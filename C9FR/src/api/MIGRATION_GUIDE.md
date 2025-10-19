# API Migration Guide

## Overview

The old monolithic `services/api.ts` file (1,482 lines) has been split into modular API services. This guide helps you migrate from the old API to the new structure.

## What Changed

### Before (Old Structure)
```
services/
└── api.ts (1,482 lines)
    ├── All endpoints in one file
    ├── Inconsistent error handling
    ├── Repeated auth token logic
    └── Hard to maintain
```

### After (New Structure)
```
api/
├── client.ts          # Axios instance with interceptors
├── types.ts           # Common API types
├── auth.ts            # Authentication endpoints
├── assets.ts          # Assets endpoints
├── investments.ts     # Investments endpoints
├── goals.ts           # Goals endpoints
├── opportunities.ts   # Opportunities endpoints
└── index.ts           # Re-exports
```

## Migration Steps

### 1. Update Imports

**Old:**
```typescript
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../services/api';
```

**New:**
```typescript
import { goalsApi } from '../api';
```

### 2. Update Function Calls

**Old:**
```typescript
const goals = await fetchGoals(token);
const newGoal = await createGoal(goalData, token);
await updateGoal(goalId, goalData, token);
await deleteGoal(goalId, token);
```

**New:**
```typescript
const goals = await goalsApi.fetchAll();
const newGoal = await goalsApi.create(goalData);
await goalsApi.update(goalId, goalData);
await goalsApi.delete(goalId);
```

### 3. Remove Token Parameters

The new API client automatically handles authentication tokens via interceptors. You no longer need to pass tokens manually.

**Old:**
```typescript
const token = await AsyncStorage.getItem('authToken');
const assets = await fetchAssets(token);
```

**New:**
```typescript
const assets = await assetsApi.fetchAll();
```

### 4. Update Error Handling

**Old:**
```typescript
try {
  const goals = await fetchGoals();
} catch (error: any) {
  console.error('Error:', error);
  if (error.response?.status === 401) {
    // Handle auth error
  }
}
```

**New:**
```typescript
import { ApiError } from '../utils/errors';

try {
  const goals = await goalsApi.fetchAll();
} catch (error) {
  const apiError = error as ApiError;
  
  // User-friendly message
  showToast(apiError.userMessage, 'error');
  
  // Check error type
  if (apiError.isAuthError()) {
    // Handle auth error
  }
}
```

## API Reference

### Authentication API

```typescript
import { authApi } from '../api';

// Register
const response = await authApi.register({
  username: 'user',
  email: 'user@example.com',
  password: 'password123',
});

// Login
const response = await authApi.login({
  username: 'user',
  password: 'password123',
});

// Logout
await authApi.logout();

// Get user details
const user = await authApi.getUserDetails();
```

### Assets API

```typescript
import { assetsApi } from '../api';

// Fetch all assets
const assets = await assetsApi.fetchAll();

// Fetch single asset
const asset = await assetsApi.fetchById('123');

// Create asset
const newAsset = await assetsApi.create({
  assetType: 'stock',
  name: 'Apple Inc.',
  symbol: 'AAPL',
  quantity: 10,
  purchasePrice: 150.00,
});

// Update asset
const updated = await assetsApi.update('123', {
  quantity: 15,
});

// Delete asset
await assetsApi.delete('123');

// Fetch chart data
const chartData = await assetsApi.fetchChartData('AAPL', 'daily');

// Refresh prices
const result = await assetsApi.refreshPrices();
```

### Investments API

```typescript
import { investmentsApi } from '../api';

// Fetch all investments
const investments = await investmentsApi.fetchAll();

// Fetch portfolio summary
const summary = await investmentsApi.fetchPortfolioSummary();

// Create investment
const newInvestment = await investmentsApi.create(investmentData);

// Update investment
const updated = await investmentsApi.update('123', updateData);

// Delete investment
await investmentsApi.delete('123');

// Refresh prices
await investmentsApi.refreshPrices();
```

### Goals API

```typescript
import { goalsApi } from '../api';

// Fetch all goals
const goals = await goalsApi.fetchAll();

// Fetch single goal
const goal = await goalsApi.fetchById('123');

// Create goal
const newGoal = await goalsApi.create({
  name: 'Emergency Fund',
  target_amount: 10000,
  current_amount: 0,
  deadline: '2025-12-31',
});

// Update goal
const updated = await goalsApi.update('123', {
  current_amount: 5000,
});

// Update progress
await goalsApi.updateProgress('123', 5000);

// Mark completed
await goalsApi.markCompleted('123');

// Delete goal
await goalsApi.delete('123');

// Generate image
const withImage = await goalsApi.generateImage('123');
```

### Opportunities API

```typescript
import { opportunitiesApi } from '../api';

// Fetch all opportunities
const opportunities = await opportunitiesApi.fetchAll();

// Fetch single opportunity
const opportunity = await opportunitiesApi.fetchById('123');

// Refresh opportunities
const result = await opportunitiesApi.refresh();

// Dismiss opportunity
await opportunitiesApi.dismiss('123');

// Mark as viewed
await opportunitiesApi.markViewed('123');

// Mark as acted upon
await opportunitiesApi.markActedUpon('123');

// Fetch by category
const filtered = await opportunitiesApi.fetchByCategory('savings');

// Fetch by priority
const highPriority = await opportunitiesApi.fetchByPriority('high');
```

## Benefits of New Structure

### 1. Better Organization
- Each domain has its own file
- Easy to find and maintain
- Clear separation of concerns

### 2. Consistent Error Handling
- All errors converted to ApiError
- User-friendly error messages
- Automatic logging without sensitive data

### 3. Automatic Authentication
- No need to pass tokens manually
- Interceptors handle token injection
- Auto-logout on token expiration

### 4. Type Safety
- Full TypeScript support
- Request/response types defined
- Better IDE autocomplete

### 5. Easier Testing
- Mock individual API modules
- Test in isolation
- Clear dependencies

## Common Migration Patterns

### Pattern 1: Simple Fetch

**Old:**
```typescript
const data = await fetchGoals(token);
```

**New:**
```typescript
const data = await goalsApi.fetchAll();
```

### Pattern 2: Create with Data

**Old:**
```typescript
const newItem = await createGoal(goalData, token);
```

**New:**
```typescript
const newItem = await goalsApi.create(goalData);
```

### Pattern 3: Update by ID

**Old:**
```typescript
await updateGoal(id, updateData, token);
```

**New:**
```typescript
await goalsApi.update(id, updateData);
```

### Pattern 4: Delete by ID

**Old:**
```typescript
await deleteGoal(id, token);
```

**New:**
```typescript
await goalsApi.delete(id);
```

## Troubleshooting

### Issue: "Cannot find module '../api'"

**Solution:** Update your import path:
```typescript
// If in src/components/
import { goalsApi } from '../api';

// If in src/screens/
import { goalsApi } from '../api';

// If in src/hooks/
import { goalsApi } from '../api';
```

### Issue: "Property 'fetchAll' does not exist"

**Solution:** Make sure you're using the correct API module:
```typescript
// Wrong
import { fetchAll } from '../api';

// Correct
import { goalsApi } from '../api';
const data = await goalsApi.fetchAll();
```

### Issue: "Token not being sent"

**Solution:** The token is handled automatically. Make sure you've set it after login:
```typescript
import { setAuthToken } from '../api';

const response = await authApi.login(credentials);
setAuthToken(response.key || response.token);
```

## Next Steps

1. Update one component at a time
2. Test thoroughly after each update
3. Remove old `services/api.ts` when all migrations are complete
4. Update any documentation or comments

## Need Help?

- Check the API README: `src/api/README.md`
- Review error handling examples: `src/utils/errors/USAGE_EXAMPLES.md`
- Look at test files for usage examples
