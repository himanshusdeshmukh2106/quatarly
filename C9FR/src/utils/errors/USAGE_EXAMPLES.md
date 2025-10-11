# Error Handling Usage Examples

## Basic Usage

### In API Calls

```typescript
import { handleApiError, logError } from '@/utils/errors';
import { showToast } from '@/utils/toast';

// Example: Fetching assets
export const fetchAssets = async () => {
  try {
    const response = await apiClient.get('/assets/');
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error);
    
    // Log error (without sensitive data)
    logError(apiError, 'fetchAssets');
    
    // Show user-friendly message
    showToast(apiError.userMessage, 'error');
    
    // Re-throw for component to handle
    throw apiError;
  }
};
```

### In Components

```typescript
import { handleApiError, ApiError } from '@/utils/errors';
import { showToast } from '@/utils/toast';

const AssetsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const assets = await fetchAssets();
      setAssets(assets);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showToast(apiError.userMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show error state
  if (error) {
    return (
      <View>
        <Text>{error.userMessage}</Text>
        {error.isRetryable() && (
          <Button onPress={loadAssets}>Retry</Button>
        )}
      </View>
    );
  }

  return <AssetsList assets={assets} />;
};
```

### In Custom Hooks

```typescript
import { handleApiError, ApiError } from '@/utils/errors';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await assetsApi.fetchAll();
      setAssets(response.data);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showToast(apiError.userMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assets,
    loading,
    error,
    refetch: fetchAssets,
  };
};
```

## Handling Specific Error Types

### Authentication Errors

```typescript
import { handleApiError, shouldLogout } from '@/utils/errors';
import { logout } from '@/services/auth';

try {
  const response = await apiClient.get('/protected-resource/');
  return response.data;
} catch (error) {
  const apiError = handleApiError(error);
  
  // Check if we should logout
  if (shouldLogout(apiError)) {
    await logout();
    // Navigate to login screen
    navigation.navigate('Login');
  }
  
  throw apiError;
}
```

### Validation Errors

```typescript
import { handleApiError, formatValidationErrors } from '@/utils/errors';

try {
  await apiClient.post('/assets/', assetData);
} catch (error) {
  const apiError = handleApiError(error);
  
  if (apiError.isValidationError() && apiError.details) {
    // Show field-specific errors
    const formattedErrors = formatValidationErrors(apiError.details);
    Alert.alert('Validation Error', formattedErrors);
  } else {
    // Show general error
    showToast(apiError.userMessage, 'error');
  }
}
```

### Network Errors

```typescript
import { handleApiError, isRetryableError } from '@/utils/errors';

const fetchWithRetry = async (url: string, maxRetries = 3) => {
  let lastError: ApiError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      lastError = handleApiError(error);
      
      // Only retry if error is retryable
      if (!isRetryableError(lastError)) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  
  throw lastError!;
};
```

## Error Checking Methods

### Check Error Type

```typescript
const apiError = handleApiError(error);

// Check if network error
if (apiError.isNetworkError()) {
  showToast('Please check your internet connection', 'error');
}

// Check if auth error
if (apiError.isAuthError()) {
  navigation.navigate('Login');
}

// Check if validation error
if (apiError.isValidationError()) {
  // Show field errors
}

// Check if server error
if (apiError.isServerError()) {
  showToast('Server error. Please try again later.', 'error');
}
```

### Check if Retryable

```typescript
const apiError = handleApiError(error);

if (isRetryableError(apiError)) {
  // Show retry button
  return (
    <View>
      <Text>{apiError.userMessage}</Text>
      <Button onPress={retry}>Retry</Button>
    </View>
  );
}
```

## Global Error Boundary

```typescript
import { Component, ReactNode } from 'react';
import { ApiError } from '@/utils/errors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: ApiError | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    if (error instanceof ApiError) {
      return { hasError: true, error };
    }
    
    return {
      hasError: true,
      error: new ApiError(
        error.message,
        500,
        'UNKNOWN_ERROR',
        'Something went wrong. Please try again.'
      ),
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <View>
          <Text>Oops! Something went wrong.</Text>
          <Text>{this.state.error.userMessage}</Text>
          <Button onPress={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
```

## Testing Error Handling

```typescript
import { handleApiError, ApiError } from '@/utils/errors';
import { AxiosError } from 'axios';

describe('Error Handling', () => {
  it('converts Axios error to ApiError', () => {
    const axiosError = {
      response: {
        status: 404,
        data: { code: 'NOT_FOUND' },
      },
      message: 'Not found',
    } as AxiosError;

    const apiError = handleApiError(axiosError);

    expect(apiError).toBeInstanceOf(ApiError);
    expect(apiError.statusCode).toBe(404);
    expect(apiError.code).toBe('NOT_FOUND');
  });

  it('handles network errors', () => {
    const networkError = {
      message: 'Network Error',
    } as AxiosError;

    const apiError = handleApiError(networkError);

    expect(apiError.isNetworkError()).toBe(true);
    expect(apiError.statusCode).toBe(0);
  });
});
```

## Best Practices

1. **Always use handleApiError** - Don't throw raw errors
2. **Log errors appropriately** - Use logError to avoid logging sensitive data
3. **Show user-friendly messages** - Use apiError.userMessage
4. **Check error types** - Use helper methods (isNetworkError, isAuthError, etc.)
5. **Handle retryable errors** - Provide retry functionality for network/server errors
6. **Don't log sensitive data** - ApiError automatically sanitizes data
7. **Use error boundaries** - Catch unexpected errors at the app level
