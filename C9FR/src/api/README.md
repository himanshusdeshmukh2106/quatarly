# API Module

This module contains the API client and all API service layers for communicating with the backend.

## Structure

```
api/
├── client.ts           # Axios instance with interceptors
├── types.ts            # Common API types
├── auth.ts             # Authentication endpoints
├── assets.ts           # Assets endpoints
├── investments.ts      # Investments endpoints
├── goals.ts            # Goals endpoints
├── opportunities.ts    # Opportunities endpoints
└── index.ts            # Re-exports
```

## API Client

The API client (`client.ts`) provides:

- **Axios instance** with base configuration
- **Request interceptor** for automatic auth token injection
- **Response interceptor** for error handling and auto-logout
- **Helper functions** for token management

### Usage

```typescript
import { apiClient, setAuthToken } from '@/api';

// Make authenticated request
const response = await apiClient.get('/assets/');

// Set auth token
setAuthToken('your-token-here');

// Clear auth token
clearAuthToken();

// Check authentication status
const isAuth = await isAuthenticated();
```

## Request Interceptor

Automatically injects authentication token from AsyncStorage:

```typescript
// Before request is sent
config.headers.Authorization = `Token ${token}`;
```

## Response Interceptor

Handles errors and auto-logout:

```typescript
// On error response
const apiError = handleApiError(error);
logError(apiError);

// Auto-logout on token expiration
if (shouldLogout(apiError)) {
  await AsyncStorage.multiRemove(['authToken', 'user']);
}
```

## Error Handling

All API errors are converted to `ApiError` instances with:

- **statusCode**: HTTP status code
- **code**: Error code (e.g., 'UNAUTHORIZED', 'NOT_FOUND')
- **userMessage**: User-friendly error message
- **details**: Validation error details (if applicable)

### Example

```typescript
import { apiClient } from '@/api';
import { handleApiError } from '@/utils/errors';

try {
  const response = await apiClient.get('/assets/');
  return response.data;
} catch (error) {
  // Error is already an ApiError from interceptor
  const apiError = error as ApiError;
  
  // Show user-friendly message
  showToast(apiError.userMessage, 'error');
  
  // Check error type
  if (apiError.isNetworkError()) {
    // Handle network error
  }
  
  throw apiError;
}
```

## API Services

Each API service module exports an object with typed methods:

```typescript
// Example: assets.ts
export const assetsApi = {
  fetchAll: () => apiClient.get<Asset[]>('/assets/'),
  fetchById: (id: string) => apiClient.get<Asset>(`/assets/${id}/`),
  create: (data: CreateAssetRequest) => apiClient.post<Asset>('/assets/', data),
  update: (id: string, data: UpdateAssetRequest) => 
    apiClient.put<Asset>(`/assets/${id}/`, data),
  delete: (id: string) => apiClient.delete(`/assets/${id}/`),
};
```

### Usage

```typescript
import { assetsApi } from '@/api';

// Fetch all assets
const response = await assetsApi.fetchAll();
const assets = response.data;

// Create asset
const newAsset = await assetsApi.create({
  name: 'Bitcoin',
  assetType: 'crypto',
  quantity: 1.5,
});
```

## Configuration

### Base URL

Update the base URL in `client.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000/api'  // Development
  : 'https://api.yourapp.com';   // Production
```

### Timeout

Default timeout is 30 seconds. Adjust in `client.ts`:

```typescript
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
});
```

## Testing

Mock the API client in tests:

```typescript
import { apiClient } from '@/api';

jest.mock('@/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// In test
(apiClient.get as jest.Mock).mockResolvedValue({
  data: mockAssets,
});
```

## Best Practices

1. **Always use API service modules** - Don't call `apiClient` directly in components
2. **Handle errors in hooks** - Let custom hooks handle API errors
3. **Use TypeScript types** - Define request/response types for all endpoints
4. **Don't log sensitive data** - Error interceptor already handles safe logging
5. **Use async/await** - Prefer async/await over promises for readability

## Migration from Old API

The old `services/api.ts` file is being split into this modular structure:

| Old | New |
|-----|-----|
| `services/api.ts` (1,482 lines) | `api/` directory (modular) |
| All endpoints in one file | Separate file per domain |
| Inconsistent error handling | Centralized error handling |
| Mixed concerns | Clear separation |

### Migration Steps

1. ✅ Create `api/client.ts` with interceptors
2. ⏳ Create `api/auth.ts` for authentication
3. ⏳ Create `api/assets.ts` for assets
4. ⏳ Create `api/investments.ts` for investments
5. ⏳ Create `api/goals.ts` for goals
6. ⏳ Create `api/opportunities.ts` for opportunities
7. ⏳ Update all imports to use new API modules
8. ⏳ Remove old `services/api.ts`
