# Specific Code Improvements
## Detailed Code Changes for Quatarly App

---

## 🎯 BACKEND IMPROVEMENTS

### 1. Improve Investment Serializer Performance

**Current Issue:** `c8v2/investments/serializers.py:39-44`
```python
def get_chart_data(self, obj):
    if obj.supports_chart_data:
        chart_data = obj.historical_data.all()[:30]  # ❌ Queries DB again
        return ChartDataSerializer(chart_data, many=True).data
    return []
```

**Optimized Version:**
```python
def get_chart_data(self, obj):
    """Use prefetched data to avoid additional queries"""
    if not obj.supports_chart_data:
        return []
    
    # Use prefetched data if available
    chart_data = getattr(obj, 'recent_chart_data', None)
    if chart_data is None:
        # Fallback to queryset if not prefetched
        chart_data = obj.historical_data.order_by('-date')[:30]
    
    return ChartDataSerializer(chart_data, many=True).data
```

---

### 2. Optimize Investment ViewSet

**Current Issue:** `c8v2/investments/views.py:50-55`
```python
def get_queryset(self):
    queryset = Investment.objects.filter(user=self.request.user).select_related('user')
    asset_type = self.request.query_params.get('asset_type', None)
    if asset_type:
        queryset = queryset.filter(asset_type=asset_type)
    return queryset.order_by('-created_at')
```

**Optimized Version:**
```python
def get_queryset(self):
    """Optimized queryset with prefetching and caching"""
    from django.db.models import Prefetch
    from django.core.cache import cache
    
    asset_type = self.request.query_params.get('asset_type')
    cache_key = f"investments_{self.request.user.id}_{asset_type or 'all'}"
    
    # Try cache first for list actions
    if self.action == 'list':
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data
    
    queryset = Investment.objects.filter(user=self.request.user)\
        .select_related('user')\
        .prefetch_related(
            Prefetch(
                'historical_data',
                queryset=ChartData.objects.order_by('-date')[:30],
                to_attr='recent_chart_data'
            ),
            Prefetch(
                'alerts',
                queryset=PriceAlert.objects.filter(is_active=True),
                to_attr='active_alerts'
            )
        )
    
    if asset_type:
        queryset = queryset.filter(asset_type=asset_type)
    
    queryset = queryset.order_by('-created_at')
    
    # Cache for list actions
    if self.action == 'list':
        cache.set(cache_key, queryset, 180)  # 3 minutes
    
    return queryset
```

---

### 3. Add Caching Service

**Create:** `c8v2/investments/cache_service.py`
```python
from django.core.cache import cache
from functools import wraps
import hashlib
import json
from typing import Any, Callable, Optional

class CacheService:
    """Centralized caching service for investments"""
    
    TIMEOUTS = {
        'portfolio_summary': 300,      # 5 minutes
        'user_investments': 180,       # 3 minutes
        'asset_suggestions': 3600,     # 1 hour
        'market_data': 60,             # 1 minute
        'chart_data': 600,             # 10 minutes
    }
    
    @classmethod
    def get_cache_key(cls, prefix: str, *args, **kwargs) -> str:
        """Generate consistent cache key"""
        key_data = {
            'args': args,
            'kwargs': sorted(kwargs.items())
        }
        key_hash = hashlib.md5(
            json.dumps(key_data, sort_keys=True, default=str).encode()
        ).hexdigest()
        return f"quatarly:{prefix}:{key_hash}"
    
    @classmethod
    def get(cls, key: str) -> Optional[Any]:
        """Get value from cache"""
        return cache.get(key)
    
    @classmethod
    def set(cls, key: str, value: Any, timeout: Optional[int] = None) -> None:
        """Set value in cache"""
        cache.set(key, value, timeout)
    
    @classmethod
    def delete(cls, key: str) -> None:
        """Delete value from cache"""
        cache.delete(key)
    
    @classmethod
    def delete_pattern(cls, pattern: str) -> None:
        """Delete all keys matching pattern"""
        from django_redis import get_redis_connection
        conn = get_redis_connection("default")
        keys = conn.keys(f"quatarly:{pattern}:*")
        if keys:
            conn.delete(*keys)
    
    @classmethod
    def invalidate_user_cache(cls, user_id: int) -> None:
        """Invalidate all cache for a user"""
        cls.delete_pattern(f"*user_{user_id}*")
    
    @classmethod
    def cached_method(cls, timeout: int = 300, key_prefix: str = ''):
        """Decorator for caching method results"""
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = cls.get_cache_key(
                    f"{key_prefix}:{func.__name__}",
                    *args,
                    **kwargs
                )
                
                # Try to get from cache
                cached_result = cls.get(cache_key)
                if cached_result is not None:
                    return cached_result
                
                # Execute function
                result = func(*args, **kwargs)
                
                # Cache result
                cls.set(cache_key, result, timeout)
                
                return result
            return wrapper
        return decorator
```

**Usage Example:**
```python
from .cache_service import CacheService

class InvestmentService:
    @staticmethod
    @CacheService.cached_method(timeout=300, key_prefix='portfolio_summary')
    def get_portfolio_summary(user):
        # Expensive calculation
        return summary
```

---

### 4. Improve Error Handling

**Create:** `c8v2/investments/error_handlers.py`
```python
import logging
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from .exceptions import AssetValidationException, DataEnrichmentException

logger = logging.getLogger(__name__)

class APIErrorHandler:
    """Centralized error handling for API views"""
    
    @staticmethod
    def handle_api_errors(func):
        """Decorator for handling API errors consistently"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            
            except AssetValidationException as e:
                logger.warning(f"Asset validation error: {e}")
                return Response(
                    {'error': str(e), 'type': 'validation_error'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            except DataEnrichmentException as e:
                logger.error(f"Data enrichment error: {e}")
                return Response(
                    {'error': 'Failed to enrich data', 'details': str(e)},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            
            except ValidationError as e:
                logger.warning(f"Validation error: {e}")
                return Response(
                    {'error': 'Invalid data', 'details': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            except Exception as e:
                logger.exception(f"Unexpected error in {func.__name__}: {e}")
                return Response(
                    {'error': 'An unexpected error occurred'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return wrapper
```

---

### 5. Optimize Celery Tasks

**Improve:** `c8v2/investments/tasks.py`
```python
from celery import shared_task
from celery.utils.log import get_task_logger
from django.db import transaction
from .models import Investment
from .data_enrichment_service import DataEnrichmentService

logger = get_task_logger(__name__)

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    time_limit=300,
    soft_time_limit=240
)
def enrich_investment_data_task(self, investment_id):
    """
    Background task for data enrichment with retry logic
    """
    try:
        with transaction.atomic():
            investment = Investment.objects.select_for_update().get(id=investment_id)
            
            # Skip if already enriched recently
            if investment.data_enriched and investment.last_updated:
                from django.utils import timezone
                from datetime import timedelta
                if timezone.now() - investment.last_updated < timedelta(hours=6):
                    logger.info(f"Investment {investment_id} recently enriched, skipping")
                    return f"Investment {investment_id} already enriched"
            
            success = DataEnrichmentService.enrich_investment_data(investment_id)
            
            if success:
                logger.info(f"Successfully enriched investment {investment_id}")
                return f"Successfully enriched investment {investment_id}"
            else:
                logger.warning(f"Failed to enrich investment {investment_id}")
                raise self.retry(countdown=60 * (self.request.retries + 1))
    
    except Investment.DoesNotExist:
        logger.error(f"Investment {investment_id} not found")
        return f"Investment {investment_id} not found"
    
    except Exception as e:
        logger.error(f"Error enriching investment {investment_id}: {e}")
        raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))


@shared_task(
    bind=True,
    time_limit=600,
    soft_time_limit=540
)
def bulk_enrich_investments_task(self, investment_ids):
    """
    Bulk enrichment with batching
    """
    from celery import group
    
    # Process in batches of 10
    batch_size = 10
    batches = [
        investment_ids[i:i + batch_size]
        for i in range(0, len(investment_ids), batch_size)
    ]
    
    results = []
    for batch in batches:
        # Create a group of tasks for parallel processing
        job = group(
            enrich_investment_data_task.s(inv_id)
            for inv_id in batch
        )
        result = job.apply_async()
        results.append(result)
    
    return f"Queued {len(investment_ids)} investments for enrichment in {len(batches)} batches"
```

---

## 🎨 FRONTEND IMPROVEMENTS

### 6. Optimize useAssets Hook

**Improve:** `C9FR/src/hooks/useAssets.ts`
```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset, CreateAssetRequest } from '../types';
import { fetchAssets, createAsset, updateAsset, deleteAsset } from '../services/api';
import { getErrorMessage, withRetry } from '../utils/networkUtils';
import InvestmentCache from '../services/investmentCache';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to prevent multiple simultaneous loads
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadAssets = useCallback(async (showLoading = true) => {
    // Prevent concurrent loads
    if (loadingRef.current) {
      return;
    }
    
    loadingRef.current = true;
    
    try {
      if (showLoading) {
        setLoading(true);
        setError(null);
      }

      // Try cache first
      const cachedAssets = await InvestmentCache.getCachedAssets();
      if (cachedAssets && cachedAssets.length > 0 && mountedRef.current) {
        setAssets(cachedAssets);
        setLoading(false);
        showLoading = false; // Don't show loading for background refresh
      }

      // Fetch fresh data
      const token = await AsyncStorage.getItem('authToken');
      const assetsData = await withRetry(() => fetchAssets(token || undefined), 2);
      
      if (mountedRef.current) {
        // Cache the fresh data
        await InvestmentCache.cacheAssets(assetsData);
        
        setAssets(assetsData);
        setLoading(false);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
      const errorMessage = getErrorMessage(err);
      
      // If we have cached data, keep using it
      const cachedAssets = await InvestmentCache.getCachedAssets();
      if (cachedAssets && cachedAssets.length > 0 && mountedRef.current) {
        setAssets(cachedAssets);
        setError(null); // Don't show error if we have cached data
      } else if (mountedRef.current) {
        setError(errorMessage);
      }
      
      if (mountedRef.current) {
        setLoading(false);
      }
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const refreshAssets = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAssets(false);
    } catch (error) {
      console.error('Failed to refresh assets:', error);
      Alert.alert('Refresh Failed', 'Unable to refresh asset data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [loadAssets]);

  const createNewAsset = useCallback(async (assetData: CreateAssetRequest) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const newAsset = await createAsset(assetData, token || undefined);
      
      // Optimistically update UI
      setAssets(prev => [newAsset, ...prev]);
      
      // Invalidate cache and reload in background
      await InvestmentCache.clearCache();
      loadAssets(false);
      
      Alert.alert('Success', 'Asset added successfully!');
    } catch (error) {
      console.error('Failed to create asset:', error);
      Alert.alert('Error', 'Failed to add asset. Please try again.');
      // Reload to ensure consistency
      loadAssets(false);
      throw error;
    }
  }, [loadAssets]);

  const updateExistingAsset = useCallback(async (assetId: string, assetData: Partial<Asset>) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const updatedAsset = await updateAsset(assetId, assetData, token || undefined);
      
      // Optimistically update UI
      setAssets(prev => prev.map(a => a.id === assetId ? updatedAsset : a));
      
      // Invalidate cache and reload in background
      await InvestmentCache.clearCache();
      loadAssets(false);
      
      Alert.alert('Success', 'Asset updated successfully!');
    } catch (error) {
      console.error('Failed to update asset:', error);
      Alert.alert('Error', 'Failed to update asset. Please try again.');
      // Reload to ensure consistency
      loadAssets(false);
      throw error;
    }
  }, [loadAssets]);

  const deleteExistingAsset = useCallback(async (assetId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      await deleteAsset(assetId, token || undefined);
      
      // Optimistically update UI
      setAssets(prev => prev.filter(a => a.id !== assetId));
      
      // Invalidate cache
      await InvestmentCache.clearCache();
      
      Alert.alert('Success', 'Asset deleted successfully!');
    } catch (error) {
      console.error('Failed to delete asset:', error);
      Alert.alert('Error', 'Failed to delete asset. Please try again.');
      // Reload to ensure consistency
      loadAssets(false);
      throw error;
    }
  }, [loadAssets]);

  // Load assets on mount
  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return {
    assets,
    loading,
    refreshing,
    error,
    loadAssets,
    refreshAssets,
    createNewAsset,
    updateExistingAsset,
    deleteExistingAsset,
  };
};
```

---

### 7. Optimize AssetCard Component

**Improve:** `C9FR/src/components/AssetCard.tsx`
```typescript
import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  onPress?: () => void;
  onLongPress?: () => void;
}

export const AssetCard = memo<AssetCardProps>(({ asset, onPress, onLongPress }) => {
  // Memoize expensive calculations
  const gainLossColor = useMemo(() => {
    return asset.totalGainLoss >= 0 ? '#4CAF50' : '#F44336';
  }, [asset.totalGainLoss]);

  const formattedValue = useMemo(() => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: asset.currency || 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(asset.totalValue);
  }, [asset.totalValue, asset.currency]);

  const formattedGainLoss = useMemo(() => {
    const sign = asset.totalGainLoss >= 0 ? '+' : '';
    return `${sign}${asset.totalGainLoss.toFixed(2)} (${sign}${asset.totalGainLossPercent.toFixed(2)}%)`;
  }, [asset.totalGainLoss, asset.totalGainLossPercent]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        {asset.logoUrl && (
          <FastImage
            source={{
              uri: asset.logoUrl,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            style={styles.logo}
            resizeMode={FastImage.resizeMode.contain}
          />
        )}
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {asset.name}
          </Text>
          <Text style={styles.symbol} numberOfLines={1}>
            {asset.symbol}
          </Text>
        </View>
      </View>
      
      <View style={styles.values}>
        <Text style={styles.value}>{formattedValue}</Text>
        <Text style={[styles.gainLoss, { color: gainLossColor }]}>
          {formattedGainLoss}
        </Text>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.asset.id === nextProps.asset.id &&
    prevProps.asset.currentPrice === nextProps.asset.currentPrice &&
    prevProps.asset.totalValue === nextProps.asset.totalValue &&
    prevProps.asset.totalGainLoss === nextProps.asset.totalGainLoss
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  symbol: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  values: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  gainLoss: {
    fontSize: 14,
    fontWeight: '600',
  },
});
```

---

## 📊 PERFORMANCE MONITORING

### 8. Add Performance Tracking

**Create:** `C9FR/src/utils/performance.ts`
```typescript
class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static mark(name: string): void {
    this.marks.set(name, Date.now());
  }

  static measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }

    const duration = Date.now() - start;
    console.log(`[Performance] ${name}: ${duration}ms`);
    
    // Send to analytics if needed
    // Analytics.logEvent('performance', { name, duration });
    
    return duration;
  }

  static clear(name: string): void {
    this.marks.delete(name);
  }
}

export default PerformanceMonitor;
```

**Usage:**
```typescript
import PerformanceMonitor from '../utils/performance';

const loadAssets = async () => {
  PerformanceMonitor.mark('loadAssets_start');
  
  // ... load assets
  
  PerformanceMonitor.measure('Load Assets', 'loadAssets_start');
  PerformanceMonitor.clear('loadAssets_start');
};
```

---

These specific improvements will significantly enhance the performance, maintainability, and reliability of your application!

