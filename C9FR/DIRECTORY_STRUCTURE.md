# Directory Structure

## Overview

This document describes the refactored directory structure for the Quatarly frontend application.

## Structure

```
C9FR/src/
├── api/                          # NEW: API service layer (split from services/api.ts)
│   ├── client.ts                 # Axios instance, interceptors
│   ├── auth.ts                   # Authentication endpoints
│   ├── assets.ts                 # Assets endpoints
│   ├── investments.ts            # Investments endpoints
│   ├── goals.ts                  # Goals endpoints
│   ├── opportunities.ts          # Opportunities endpoints
│   ├── types.ts                  # API response types
│   └── index.ts                  # Re-exports
│
├── __mocks__/                    # NEW: Mock data for development
│   ├── assets.ts                 # Mock asset data
│   ├── investments.ts            # Mock investment data
│   ├── goals.ts                  # Mock goal data
│   └── index.ts                  # Re-exports
│
├── __tests__/                    # Test files
│   ├── unit/                     # NEW: Unit tests
│   │   ├── components/           # Component unit tests
│   │   ├── hooks/                # Hook unit tests
│   │   └── utils/                # Utility unit tests
│   ├── integration/              # NEW: Integration tests
│   │   ├── screens/              # Screen integration tests
│   │   ├── flows/                # User flow tests
│   │   └── api/                  # API integration tests
│   └── e2e/                      # NEW: End-to-end tests
│       ├── auth.e2e.test.ts
│       ├── assets.e2e.test.ts
│       └── goals.e2e.test.ts
│
├── components/
│   ├── common/                   # NEW: Shared reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── assets/                   # NEW: Asset-related components
│   │   ├── AssetCard.tsx         # (moved from root)
│   │   ├── TradableAssetCard.tsx # (moved from root)
│   │   ├── PhysicalAssetCard.tsx # (moved from root)
│   │   ├── AssetList.tsx         # NEW: Virtualized list
│   │   └── index.ts
│   ├── auth/                     # Authentication components
│   ├── onboarding/               # Onboarding components
│   └── ...other components
│
├── config/                       # Configuration files
│   └── aiConfig.ts
│
├── context/                      # React Context providers
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
│
├── data/                         # Static data
│   ├── categories.ts
│   ├── indianCities.ts
│   └── ...
│
├── hooks/                        # Custom React hooks
│   ├── useAssets.ts
│   ├── useGoals.ts               # NEW
│   ├── useOpportunities.ts       # NEW
│   ├── useOptimizedList.ts       # NEW: Performance hook
│   ├── useDebounce.ts            # NEW: Debounce hook
│   └── index.ts
│
├── navigation/                   # Navigation configuration
│   └── AppNavigator.tsx
│
├── screens/                      # Screen components
│   ├── AssetsScreen/             # NEW: Directory structure
│   │   ├── index.tsx             # Main component
│   │   ├── components/           # Screen-specific components
│   │   │   ├── PortfolioSummary.tsx
│   │   │   ├── AssetFilters.tsx
│   │   │   └── AddAssetButton.tsx
│   │   ├── hooks/                # Screen-specific hooks
│   │   │   ├── useAssetActions.ts
│   │   │   └── usePortfolioData.ts
│   │   └── utils/                # Screen-specific utilities
│   │       └── calculations.ts
│   ├── GoalsScreen/              # NEW: Similar structure
│   ├── OpportunitiesScreen/      # NEW: Similar structure
│   └── ...other screens
│
├── services/                     # Service layer (legacy, being refactored)
│   ├── api.ts                    # TO BE SPLIT into api/ directory
│   ├── apiClient.ts
│   └── ...other services
│
├── styles/                       # Styling
│   └── designSystem.ts           # Design system tokens
│
├── types/                        # TypeScript type definitions
│   ├── index.ts
│   └── ...type definitions
│
└── utils/                        # Utility functions
    ├── errors/                   # NEW: Error handling utilities
    │   ├── ApiError.ts
    │   ├── ErrorHandler.ts
    │   ├── errorMessages.ts
    │   └── index.ts
    ├── validation/               # NEW: Validation utilities
    │   ├── assetValidation.ts
    │   ├── investmentValidation.ts
    │   └── index.ts
    ├── debounce.ts
    ├── networkUtils.ts
    ├── performance.ts
    └── toast.ts
```

## Key Changes

### 1. API Layer Refactoring
- **Before**: Single `services/api.ts` file (1,482 lines)
- **After**: Modular `api/` directory with separate files per domain
- **Benefit**: Better organization, easier to maintain, clearer separation of concerns

### 2. Mock Data Separation
- **Before**: Mock data mixed in production components
- **After**: Separate `__mocks__/` directory, only loaded in development
- **Benefit**: Cleaner production code, easier testing

### 3. Test Organization
- **Before**: Flat `__tests__/` directory
- **After**: Organized by test type (unit, integration, e2e)
- **Benefit**: Clear test organization, easier to run specific test types

### 4. Common Components
- **Before**: All components in flat structure
- **After**: Reusable components in `components/common/`
- **Benefit**: Promotes reusability, reduces duplication

### 5. Screen Structure
- **Before**: Single large screen files (1,399 lines)
- **After**: Directory per screen with sub-components, hooks, and utilities
- **Benefit**: Better organization, easier to navigate, smaller files

### 6. Error Handling
- **Before**: Inconsistent error handling throughout
- **After**: Centralized error utilities in `utils/errors/`
- **Benefit**: Consistent error handling, better user experience

### 7. Validation
- **Before**: Validation logic scattered throughout
- **After**: Centralized validation in `utils/validation/`
- **Benefit**: Reusable validation, consistent rules

## Migration Status

- ✅ Directory structure created
- ⏳ API layer refactoring (Tasks 4-10)
- ⏳ Error handling utilities (Task 3)
- ⏳ Common components (Tasks 13-16)
- ⏳ Screen refactoring (Tasks 17-34)
- ⏳ Mock data extraction (Tasks 31-32)

## Guidelines

### File Naming
- Components: PascalCase (e.g., `AssetCard.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAssets.ts`)
- Utilities: camelCase (e.g., `formatCurrency.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### File Size Limits
- Components: Max 300 lines
- Hooks: Max 200 lines
- Utilities: Max 150 lines
- Screens: Max 250 lines (use composition)

### Import Paths
Use absolute imports with `@/` prefix:
```typescript
// Good
import { Button } from '@/components/common/Button';
import { useAssets } from '@/hooks/useAssets';

// Avoid
import { Button } from '../../../components/common/Button';
```

## Next Steps

1. Complete API layer refactoring (Tasks 4-10)
2. Create error handling utilities (Task 3)
3. Build common component library (Tasks 13-16)
4. Refactor large screen files (Tasks 17-34)
5. Extract and organize mock data (Tasks 31-32)
