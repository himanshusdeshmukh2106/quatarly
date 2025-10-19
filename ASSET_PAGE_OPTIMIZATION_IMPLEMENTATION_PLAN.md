# Asset Page Optimization - Implementation Plan

**Date:** 2025-10-09  
**Priority:** High Impact, Low Effort First  
**Estimated Total Time:** 2-3 days for Phase 1 & 2

---

## Quick Reference: Performance Issues Found

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| No backend API caching | HIGH | LOW | 🔴 P0 |
| Synchronous data enrichment | HIGH | LOW | 🔴 P0 |
| No pagination | MEDIUM | LOW | 🟡 P1 |
| No virtualized list | MEDIUM | LOW | 🟡 P1 |
| Full reload after mutations | MEDIUM | MEDIUM | 🟡 P1 |
| No external API caching | HIGH | LOW | 🔴 P0 |
| Missing database indexes | MEDIUM | LOW | 🟡 P1 |
| Inefficient price updates | MEDIUM | MEDIUM | 🟢 P2 |

---

## Phase 1: Backend Quick Wins (4-6 hours)

### 1.1 Enable API Response Caching (1 hour)

**File:** `c8v2/investments/views.py`

**Current Issue:** Redis is configured but not used for API responses

**Implementation:**
```python
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache

class InvestmentViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    
    def list(self, request, *args, **kwargs):
        """Cached list endpoint"""
        asset_type = request.query_params.get('asset_type', 'all')
        cache_key = f"investments_list_{request.user.id}_{asset_type}"
        
        # Try cache first
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Cache miss - fetch from database
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, 300)  # 5 minutes
        return response
    
    def perform_create(self, serializer):
        """Invalidate cache on create"""
        investment = super().perform_create(serializer)
        self._invalidate_user_cache(self.request.user.id)
        return investment
    
    def perform_update(self, serializer):
        """Invalidate cache on update"""
        investment = super().perform_update(serializer)
        self._invalidate_user_cache(self.request.user.id)
        return investment
    
    def perform_destroy(self, instance):
        """Invalidate cache on delete"""
        user_id = instance.user.id
        super().perform_destroy(instance)
        self._invalidate_user_cache(user_id)
    
    def _invalidate_user_cache(self, user_id):
        """Clear all cache entries for a user"""
        cache_patterns = [
            f"investments_list_{user_id}_all",
            f"investments_list_{user_id}_stock",
            f"investments_list_{user_id}_etf",
            f"investments_list_{user_id}_crypto",
            f"investments_list_{user_id}_bond",
            f"investments_list_{user_id}_gold",
            f"investments_list_{user_id}_silver",
            f"investments_list_{user_id}_commodity",
            f"portfolio_summary_{user_id}",
        ]
        cache.delete_many(cache_patterns)
```

**Expected Impact:** 80% faster list endpoint, 60% reduction in database load

---

### 1.2 Move Data Enrichment to Background (2 hours)

**File:** `c8v2/investments/views.py`

**Current Issue:** External API calls block asset creation (2-5 seconds)

**Implementation:**
```python
@handle_api_errors
def perform_create(self, serializer):
    """Enhanced create method - ASYNC enrichment only"""
    asset_type = serializer.validated_data['asset_type']
    
    # Validate asset type
    AssetValidator.validate_asset_type(asset_type)
    
    # Validate based on asset type
    if asset_type in ['stock', 'etf', 'crypto', 'bond', 'mutual_fund']:
        AssetValidator.validate_tradeable_asset(serializer.validated_data)
    elif asset_type in ['gold', 'silver', 'commodity']:
        AssetValidator.validate_physical_asset(serializer.validated_data)
    
    # Validate currency if provided
    currency = serializer.validated_data.get('currency')
    if currency:
        AssetValidator.validate_currency(currency)
    
    # ✅ CHANGE: Save immediately without fetching market data
    investment = serializer.save()
    
    # ✅ CHANGE: Trigger background enrichment for ALL tradeable assets
    if investment.is_tradeable and investment.symbol:
        try:
            enrich_investment_data_task.delay(investment.id)
            logger.info(f"Queued background enrichment for investment {investment.id}")
        except Exception as e:
            logger.warning(f"Failed to queue background enrichment: {e}")
            # Don't fail the creation if background task fails
    
    return investment
```

**Expected Impact:** 70% faster asset creation (from 3s to <1s)

---

### 1.3 Cache External API Results (1 hour)

**File:** `c8v2/investments/bharatsm_service.py`

**Current Issue:** BharatSM/Perplexity called on every request

**Implementation:**
```python
from django.core.cache import cache

def get_bharatsm_frontend_data(symbol: str) -> Dict:
    """Convenience function to get optimized frontend display data with caching."""
    if not final_bharatsm_service:
        logger.warning("BharatSM service not available")
        return {}
    
    # ✅ CHANGE: Check cache first
    cache_key = f"bharatsm_data_{symbol}"
    cached_data = cache.get(cache_key)
    if cached_data:
        logger.info(f"Cache hit for BharatSM data: {symbol}")
        return cached_data
    
    try:
        data = final_bharatsm_service.get_frontend_display_data(symbol)
        
        # ✅ CHANGE: Cache successful results for 1 hour
        if data:
            cache.set(cache_key, data, 3600)
            logger.info(f"Cached BharatSM data for {symbol}")
        
        return data
    except Exception as e:
        logger.error(f"Error in BharatSM frontend data fetch: {e}")
        return {}


def get_bharatsm_basic_info(symbol: str) -> Dict:
    """Get basic stock info with caching."""
    if not final_bharatsm_service:
        return {}
    
    # ✅ CHANGE: Check cache first
    cache_key = f"bharatsm_basic_{symbol}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data
    
    try:
        data = final_bharatsm_service.get_basic_stock_info(symbol)
        
        # ✅ CHANGE: Cache for 30 minutes (shorter TTL for basic info)
        if data:
            cache.set(cache_key, data, 1800)
        
        return data
    except Exception as e:
        logger.error(f"Error fetching basic info: {e}")
        return {}
```

**File:** `c8v2/investments/data_enrichment_service.py`

```python
@classmethod
def get_basic_market_data(cls, symbol: str, asset_type: str) -> Dict:
    """Get basic market data with caching"""
    # ✅ CHANGE: Check cache first
    cache_key = f"market_data_basic_{symbol}_{asset_type}"
    cached_data = cache.get(cache_key)
    if cached_data:
        logger.info(f"Cache hit for market data: {symbol}")
        return cached_data
    
    # For Indian stocks, try BharatSM first
    if asset_type in ['stock', 'etf'] and final_bharatsm_service:
        try:
            logger.info(f"Fetching basic market data for {symbol} using BharatSM")
            bharatsm_data = get_bharatsm_basic_info(symbol)
            if bharatsm_data:
                # ✅ CHANGE: Cache successful results
                cache.set(cache_key, bharatsm_data, 1800)  # 30 minutes
                return bharatsm_data
        except Exception as e:
            logger.warning(f"BharatSM service failed for {symbol}: {e}")
    
    # Fallback to Perplexity API
    if not perplexity_rate_limiter.can_make_call():
        wait_time = perplexity_rate_limiter.wait_time()
        logger.warning(f"Rate limit reached, waiting {wait_time:.2f} seconds")
        time.sleep(wait_time)
    
    try:
        logger.info(f"Fetching basic market data for {symbol} using Perplexity API")
        perplexity_rate_limiter.record_call()
        data = PerplexityAPIService.get_basic_market_data(symbol, asset_type)
        
        # ✅ CHANGE: Cache Perplexity results too
        if data:
            cache.set(cache_key, data, 3600)  # 1 hour
        
        return data
    except Exception as e:
        logger.error(f"Failed to get basic market data for {symbol}: {e}")
        return {}
```

**Expected Impact:** 90% reduction in external API calls

---

### 1.4 Add Database Indexes (30 minutes)

**File:** `c8v2/investments/models.py`

**Current Issue:** No explicit indexes on frequently queried fields

**Implementation:**
```python
class Investment(models.Model):
    # ... existing fields ...
    
    class Meta:
        indexes = [
            # Most common query: filter by user and order by created_at
            models.Index(fields=['user', '-created_at'], name='inv_user_created_idx'),
            
            # Filter by user and asset_type
            models.Index(fields=['user', 'asset_type'], name='inv_user_type_idx'),
            
            # Symbol lookups for enrichment
            models.Index(fields=['symbol'], name='inv_symbol_idx'),
            
            # Find assets needing enrichment
            models.Index(fields=['user', 'data_enriched'], name='inv_user_enriched_idx'),
            
            # Filter tradeable assets for price updates
            models.Index(fields=['asset_type', 'symbol'], name='inv_type_symbol_idx'),
        ]
        ordering = ['-created_at']
```

**Migration:**
```bash
cd c8v2
python manage.py makemigrations investments
python manage.py migrate investments
```

**Expected Impact:** 30% faster queries on large datasets (1000+ assets)

---

## Phase 2: Frontend Optimizations (4-6 hours)

### 2.1 Use VirtualizedAssetList (2 hours)

**File:** `C9FR/src/screens/main/AssetsScreen.tsx`

**Current Issue:** ScrollView renders all assets at once

**Implementation:**
```typescript
import { VirtualizedAssetList } from '../../components/VirtualizedAssetList';

// Inside AssetsScreen component, replace the ScrollView section:

const renderContent = () => {
  if (loading && assets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading your assets...
        </Text>
      </View>
    );
  }

  // ✅ CHANGE: Use VirtualizedAssetList instead of ScrollView
  return (
    <View style={{ flex: 1 }}>
      {/* Header section */}
      <View style={styles.header}>
        {/* ... existing header code ... */}
      </View>

      {/* Mock investments section */}
      {mockInvestments.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.mockInvestmentsScroll}
        >
          {mockInvestments.map((investment, index) => (
            <InvestmentCard key={investment.id} investment={investment} index={index} />
          ))}
        </ScrollView>
      )}

      {/* ✅ CHANGE: Virtualized asset list */}
      {assets.length > 0 ? (
        <VirtualizedAssetList
          assets={assets}
          refreshing={refreshing}
          onRefresh={refreshAssets}
          onInsightsPress={setSelectedAssetForInsights}
          onLongPress={handleAssetLongPress}
          onUpdateValue={updatePhysicalAssetValue}
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Assets
            </Text>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.text }]}>
            No assets yet. Tap + to add your first asset!
          </Text>
        </View>
      )}
    </View>
  );
};
```

**Expected Impact:** 50% better scroll performance for 50+ assets

---

### 2.2 Implement Pagination (2 hours)

**Backend File:** `c8v2/investments/views.py`

```python
from rest_framework.pagination import CursorPagination

class InvestmentCursorPagination(CursorPagination):
    """Cursor-based pagination for efficient large dataset handling"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    ordering = '-created_at'
    cursor_query_param = 'cursor'

class InvestmentViewSet(viewsets.ModelViewSet):
    # ✅ CHANGE: Enable pagination
    pagination_class = InvestmentCursorPagination
    
    # ... rest of the code ...
```

**Frontend File:** `C9FR/src/services/api.ts`

```typescript
export const fetchAssets = async (
  assetType?: string, 
  token?: string,
  cursor?: string  // ✅ NEW: cursor parameter
) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  } else {
    const hasHeader = Boolean(apiClient.defaults.headers.common['Authorization']);
    if (!hasHeader) {
      const stored = await AsyncStorage.getItem('authToken');
      if (stored) setAuthToken(stored);
    }
  }

  const params: any = {};
  if (assetType) params.asset_type = assetType;
  if (cursor) params.cursor = cursor;  // ✅ NEW: pass cursor

  const response = await apiClient.get('/investments/', { headers, params });

  return {
    assets: response.data.results.map((asset: any) => ({
      // ... existing mapping ...
    })),
    nextCursor: response.data.next,  // ✅ NEW: return next cursor
    hasMore: !!response.data.next,   // ✅ NEW: has more flag
  };
};
```

**Frontend File:** `C9FR/src/hooks/useAssets.ts`

```typescript
interface UseAssetsState {
  assets: Asset[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  marketStatus: MarketStatus;
  lastUpdated: string | null;
  hasMore: boolean;        // ✅ NEW
  loadingMore: boolean;    // ✅ NEW
  nextCursor: string | null; // ✅ NEW
}

const loadAssets = useCallback(async (showLoading = true, cursor?: string) => {
  try {
    if (showLoading && !cursor) {
      updateState({ loading: true, error: null });
    } else if (cursor) {
      updateState({ loadingMore: true });
    }

    const token = await getAuthToken();
    const result = await fetchAssets(undefined, token || undefined, cursor);
    
    // ✅ CHANGE: Append or replace assets based on cursor
    const newAssets = cursor 
      ? [...state.assets, ...result.assets]
      : result.assets;
    
    await InvestmentCache.cacheAssets(newAssets);
    
    updateState({
      assets: newAssets,
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    // ... error handling ...
  }
}, [updateState, getAuthToken, state.assets]);

const loadMoreAssets = useCallback(async () => {
  if (!state.hasMore || state.loadingMore) return;
  await loadAssets(false, state.nextCursor);
}, [loadAssets, state.hasMore, state.loadingMore, state.nextCursor]);

return {
  ...state,
  loadAssets,
  loadMoreAssets,  // ✅ NEW: expose loadMore function
  // ... other functions ...
};
```

**Expected Impact:** 60% faster initial load for portfolios with 50+ assets

---

### 2.3 Implement Optimistic Updates (2 hours)

**File:** `C9FR/src/hooks/useAssets.ts`

```typescript
const createNewAsset = useCallback(async (assetData: CreateAssetRequest) => {
  // ✅ CHANGE: Create temporary asset for optimistic update
  const tempAsset: Asset = {
    id: `temp-${Date.now()}`,
    name: assetData.name,
    symbol: assetData.symbol || '',
    assetType: assetData.assetType,
    quantity: assetData.quantity,
    averagePurchasePrice: assetData.purchasePrice,
    currentPrice: assetData.purchasePrice,
    totalValue: assetData.quantity * assetData.purchasePrice,
    totalGainLoss: 0,
    totalGainLossPercent: 0,
    dailyChange: 0,
    dailyChangePercent: 0,
    exchange: '',
    currency: 'INR',
    chartData: [],
    lastUpdated: new Date().toISOString(),
    aiAnalysis: 'Analyzing...',
    riskLevel: 'medium',
    recommendation: 'hold',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // ✅ NEW: Flag to indicate this is a temporary asset
    _isOptimistic: true,
  };

  // ✅ CHANGE: Immediately add to state
  updateState({ 
    assets: [tempAsset, ...state.assets],
  });

  try {
    const token = await getAuthToken();
    const newAsset = await createAsset(assetData, token || undefined);
    
    // ✅ CHANGE: Replace temp asset with real one
    updateState({
      assets: state.assets.map(a => 
        a.id === tempAsset.id ? newAsset : a
      ),
    });
    
    // Update cache
    await InvestmentCache.cacheAssets(state.assets);
    
    Alert.alert('Success', 'Asset added successfully!');
  } catch (error) {
    console.error('Failed to create asset:', error);
    
    // ✅ CHANGE: Rollback on error
    updateState({
      assets: state.assets.filter(a => a.id !== tempAsset.id),
    });
    
    Alert.alert('Error', 'Failed to add asset. Please try again.');
    throw error;
  }
}, [getAuthToken, state.assets, updateState]);
```

**Expected Impact:** Instant UI feedback, better perceived performance

---

## Phase 3: Monitoring & Validation (2 hours)

### 3.1 Add Performance Logging

**File:** `c8v2/investments/views.py`

```python
import time
from django.core.cache import cache

class InvestmentViewSet(viewsets.ModelViewSet):
    def list(self, request, *args, **kwargs):
        start_time = time.time()
        cache_key = f"investments_list_{request.user.id}_{request.query_params.get('asset_type', 'all')}"
        
        cached_data = cache.get(cache_key)
        if cached_data:
            duration = (time.time() - start_time) * 1000
            logger.info(f"Cache HIT for user {request.user.id} - {duration:.2f}ms")
            return Response(cached_data)
        
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, 300)
        
        duration = (time.time() - start_time) * 1000
        logger.info(f"Cache MISS for user {request.user.id} - {duration:.2f}ms")
        
        return response
```

### 3.2 Frontend Performance Tracking

**File:** `C9FR/src/hooks/useAssets.ts`

```typescript
const loadAssets = useCallback(async (showLoading = true) => {
  const startTime = Date.now();
  
  try {
    // ... existing code ...
    
    const duration = Date.now() - startTime;
    console.log(`[Performance] Assets loaded in ${duration}ms`);
    
    if (duration > 2000) {
      console.warn(`[Performance] Slow asset load: ${duration}ms`);
    }
  } catch (error) {
    // ... error handling ...
  }
}, [/* deps */]);
```

---

## Testing Checklist

### Backend Tests
- [ ] Verify Redis cache is working (`redis-cli MONITOR`)
- [ ] Test asset creation is < 1 second
- [ ] Verify background enrichment completes
- [ ] Test cache invalidation on mutations
- [ ] Verify pagination returns correct results
- [ ] Check database query count (should be 2-3 per request)

### Frontend Tests
- [ ] Test asset list loads from cache
- [ ] Verify optimistic updates work
- [ ] Test scroll performance with 100+ assets
- [ ] Verify pagination "load more" works
- [ ] Test offline mode with cached data
- [ ] Check memory usage doesn't grow

### Integration Tests
- [ ] Create asset → verify appears immediately → verify enrichment completes
- [ ] Delete asset → verify cache invalidated → verify removed from list
- [ ] Update asset → verify cache invalidated → verify changes reflected
- [ ] Refresh prices → verify only changed assets update

---

## Rollback Plan

If issues occur, rollback in reverse order:

1. **Phase 2 Frontend:** Revert to ScrollView, remove pagination
2. **Phase 1.3:** Remove external API caching
3. **Phase 1.2:** Revert to synchronous enrichment
4. **Phase 1.1:** Disable API response caching

Each phase is independent and can be rolled back without affecting others.

---

## Success Metrics

**Before Optimization:**
- Asset list load: 2-3 seconds
- Asset creation: 3-5 seconds
- Scroll FPS: 30-40 with 50+ assets
- External API calls: 100% of requests

**After Optimization (Expected):**
- Asset list load: 0.3-0.5 seconds (80% improvement)
- Asset creation: 0.5-1 second (70% improvement)
- Scroll FPS: 55-60 with 100+ assets (50% improvement)
- External API calls: 10% of requests (90% reduction)

---

## Next Steps

1. Review this plan with the team
2. Set up Redis if not running (`redis-server`)
3. Create a feature branch: `git checkout -b optimize-asset-page`
4. Implement Phase 1 (backend optimizations)
5. Test thoroughly
6. Implement Phase 2 (frontend optimizations)
7. Monitor performance metrics
8. Deploy to staging for user testing

**Estimated Timeline:** 2-3 days for full implementation

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-09  
**Status:** Ready for Implementation

