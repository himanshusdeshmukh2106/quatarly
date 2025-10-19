# Integration Tests

This directory contains integration tests that test how multiple components work together.

## Structure

```
integration/
├── screens/        # Screen integration tests
├── flows/          # User flow tests
└── api/            # API integration tests
```

## Guidelines

- Test component interactions
- Test data flow between components
- Mock API calls but test the integration
- Focus on user-facing functionality
- Test critical user flows end-to-end

## Example

```typescript
// AssetsScreen.integration.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AssetsScreen } from '@/screens/AssetsScreen';
import { assetsApi } from '@/api/assets';

jest.mock('@/api/assets');

describe('AssetsScreen Integration', () => {
  it('loads and displays assets', async () => {
    const mockAssets = [
      { id: '1', name: 'Bitcoin', totalValue: 50000 },
      { id: '2', name: 'Gold', totalValue: 10000 },
    ];

    (assetsApi.fetchAll as jest.Mock).mockResolvedValue({
      data: mockAssets,
    });

    const { getByText } = render(<AssetsScreen />);

    await waitFor(() => {
      expect(getByText('Bitcoin')).toBeTruthy();
      expect(getByText('Gold')).toBeTruthy();
    });
  });

  it('allows creating a new asset', async () => {
    const { getByTestId, getByText } = render(<AssetsScreen />);

    // Open add modal
    fireEvent.press(getByTestId('add-asset-button'));

    // Fill form
    fireEvent.changeText(getByTestId('asset-name-input'), 'Ethereum');
    fireEvent.press(getByTestId('submit-button'));

    // Verify API was called
    await waitFor(() => {
      expect(assetsApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Ethereum' })
      );
    });
  });
});
```
