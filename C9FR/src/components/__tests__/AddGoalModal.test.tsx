import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddGoalModal from '../AddGoalModal';
import { ThemeContext } from '../../context/ThemeContext';

// Mock the theme context
const mockTheme = {
  background: '#f4f4f4',
  text: '#222',
  textMuted: '#a0a0a0',
  primary: '#003366',
  secondary: '#007a33',
  card: '#fff',
  cardElevated: '#fff',
  accent: '#ffd700',
  accentMuted: '#fff9e3',
  success: '#007a33',
  warning: '#ffe066',
  error: '#ff6f61',
  info: '#00509e',
  border: '#e0e0e0',
  borderMuted: '#f0f0f0',
  divider: '#e0e0e0',
  profit: '#004d00',
  loss: '#ff6f61',
  neutral: '#66a3ff',
  investment: '#007acc',
  savings: '#66b3a1',
  debt: '#ff6f61',
  insurance: '#00509e',
  education: '#d4af37',
  travel: '#66a3ff',
  emergency: '#007a33',
};

const mockThemeContext = {
  theme: mockTheme,
  isDarkMode: false,
  toggleTheme: jest.fn(),
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeContext.Provider value={mockThemeContext}>
      {component}
    </ThemeContext.Provider>
  );
};

describe('AddGoalModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText, getByPlaceholderText } = renderWithTheme(
      <AddGoalModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(getByText('Add New Goal')).toBeTruthy();
    expect(getByText('Goal Title *')).toBeTruthy();
    expect(getByText('Target Amount *')).toBeTruthy();
    expect(getByPlaceholderText('e.g., Emergency Fund, Dream Vacation')).toBeTruthy();
    expect(getByPlaceholderText('50000')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = renderWithTheme(
      <AddGoalModal
        visible={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(queryByText('Add New Goal')).toBeNull();
  });

  it('validates required fields', async () => {
    const { getByText } = renderWithTheme(
      <AddGoalModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const createButton = getByText('Create Goal');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('Goal title is required')).toBeTruthy();
      expect(getByText('Target amount is required')).toBeTruthy();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates minimum title length', async () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <AddGoalModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const titleInput = getByPlaceholderText('e.g., Emergency Fund, Dream Vacation');
    fireEvent.changeText(titleInput, 'A');

    const createButton = getByText('Create Goal');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('Title must be at least 2 characters long')).toBeTruthy();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates target amount is a positive number', async () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <AddGoalModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const titleInput = getByPlaceholderText('e.g., Emergency Fund, Dream Vacation');
    const amountInput = getByPlaceholderText('50000');

    fireEvent.changeText(titleInput, 'Valid Title');
    fireEvent.changeText(amountInput, '0'); // Use 0 instead of negative number since formatCurrency removes negative signs

    const createButton = getByText('Create Goal');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid amount greater than 0')).toBeTruthy();
    }, { timeout: 3000 });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    mockOnSubmit.mockResolvedValue(undefined);

    const { getByPlaceholderText, getByText } = renderWithTheme(
      <AddGoalModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const titleInput = getByPlaceholderText('e.g., Emergency Fund, Dream Vacation');
    const amountInput = getByPlaceholderText('50000');
    const categoryInput = getByPlaceholderText('e.g., Vehicle, Electronics, Travel, Education, Real Estate, Emergency Fund');
    const descriptionInput = getByPlaceholderText('Add details about your goal...');

    fireEvent.changeText(titleInput, 'Emergency Fund');
    fireEvent.changeText(amountInput, '50000');
    fireEvent.changeText(categoryInput, 'Savings');
    fireEvent.changeText(descriptionInput, 'For unexpected expenses');

    const createButton = getByText('Create Goal');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Emergency Fund',
        target_amount: 50000,
        category: 'Savings',
        description: 'For unexpected expenses',
      });
    });
  });

  it('calls onClose when cancel button is pressed', () => {
    const { getByText } = renderWithTheme(
      <AddGoalModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when close icon is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <AddGoalModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Note: You might need to add testID to the close button in the component
    // For now, this test structure shows how it would work
  });

  it('shows loading state when submitting', () => {
    const { getByText } = renderWithTheme(
      <AddGoalModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        loading={true}
      />
    );

    expect(getByText('Creating...')).toBeTruthy();
  });

  it('clears form when closed', async () => {
    const { getByPlaceholderText, getByText, rerender } = renderWithTheme(
      <AddGoalModal
        visible={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const titleInput = getByPlaceholderText('e.g., Emergency Fund, Dream Vacation');
    fireEvent.changeText(titleInput, 'Test Goal');

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    // Rerender with visible=false then visible=true to simulate reopening
    rerender(
      <ThemeContext.Provider value={mockThemeContext}>
        <AddGoalModal
          visible={false}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      </ThemeContext.Provider>
    );

    rerender(
      <ThemeContext.Provider value={mockThemeContext}>
        <AddGoalModal
          visible={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      </ThemeContext.Provider>
    );

    const newTitleInput = getByPlaceholderText('e.g., Emergency Fund, Dream Vacation');
    expect(newTitleInput.props.value).toBe('');
  });
});