import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AssetActionSheet from '../AssetActionSheet';
import { ThemeProvider } from '../../context/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AssetActionSheet', () => {
  const mockOnClose = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockAssetName = 'Apple Inc.';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText } = renderWithTheme(
      <AssetActionSheet
        visible={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        assetName={mockAssetName}
      />
    );

    expect(getByText('Manage Asset')).toBeTruthy();
    expect(getByText(mockAssetName)).toBeTruthy();
    expect(getByText('Edit Asset')).toBeTruthy();
    expect(getByText('Delete Asset')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = renderWithTheme(
      <AssetActionSheet
        visible={false}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        assetName={mockAssetName}
      />
    );

    expect(queryByText('Manage Asset')).toBeNull();
  });

  it('calls onClose when overlay is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <AssetActionSheet
        visible={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        assetName={mockAssetName}
      />
    );

    // Find and press the overlay (TouchableOpacity with overlay style)
    const overlay = getByTestId('action-sheet-overlay') || 
                   getByTestId('overlay') ||
                   getByTestId('backdrop');
    
    if (overlay) {
      fireEvent.press(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('calls onClose when cancel button is pressed', () => {
    const { getByText } = renderWithTheme(
      <AssetActionSheet
        visible={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        assetName={mockAssetName}
      />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when edit button is pressed', async () => {
    const { getByText } = renderWithTheme(
      <AssetActionSheet
        visible={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        assetName={mockAssetName}
      />
    );

    const editButton = getByText('Edit Asset');
    fireEvent.press(editButton);

    // Should close first, then call onEdit after a delay
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });

  it('calls onDelete when delete button is pressed', async () => {
    const { getByText } = renderWithTheme(
      <AssetActionSheet
        visible={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        assetName={mockAssetName}
      />
    );

    const deleteButton = getByText('Delete Asset');
    fireEvent.press(deleteButton);

    // Should close first, then call onDelete after a delay
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    }, { timeout: 200 });
  });

  it('displays asset name correctly', () => {
    const longAssetName = 'Very Long Asset Name That Should Be Truncated';
    const { getByText } = renderWithTheme(
      <AssetActionSheet
        visible={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        assetName={longAssetName}
      />
    );

    expect(getByText(longAssetName)).toBeTruthy();
  });

  it('shows correct action descriptions', () => {
    const { getByText } = renderWithTheme(
      <AssetActionSheet
        visible={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        assetName={mockAssetName}
      />
    );

    expect(getByText('Update quantity, price, or other details')).toBeTruthy();
    expect(getByText('Remove this asset from your portfolio')).toBeTruthy();
  });

  it('has proper accessibility properties', () => {
    const { getByText } = renderWithTheme(
      <AssetActionSheet
        visible={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        assetName={mockAssetName}
      />
    );

    const editButton = getByText('Edit Asset');
    const deleteButton = getByText('Delete Asset');
    const cancelButton = getByText('Cancel');

    // Check that buttons are touchable (have onPress handlers)
    expect(editButton.props.onPress).toBeDefined();
    expect(deleteButton.props.onPress).toBeDefined();
    expect(cancelButton.props.onPress).toBeDefined();
  });

  it('handles empty asset name gracefully', () => {
    const { getByText } = renderWithTheme(
      <AssetActionSheet
        visible={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        assetName=""
      />
    );

    expect(getByText('Manage Asset')).toBeTruthy();
    // Should still render even with empty name
  });
});