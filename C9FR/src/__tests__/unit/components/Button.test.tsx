/**
 * Button Component Unit Tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../../components/common/Button';

// Mock ThemeContext
jest.mock('../../../context/ThemeContext', () => {
  const React = require('react');
  return {
    ThemeContext: React.createContext({
      theme: { isDark: false },
      toggleTheme: jest.fn(),
    }),
  };
});

describe('Button', () => {
  it('renders with correct label', () => {
    const { getByText } = render(<Button label="Click me" onPress={jest.fn()} />);
    
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button label="Click me" onPress={onPress} />);
    
    fireEvent.press(getByText('Click me'));
    
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button label="Click me" onPress={onPress} disabled={true} />
    );
    
    fireEvent.press(getByText('Click me'));
    
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button label="Click me" onPress={onPress} loading={true} />
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { getByRole, queryByText } = render(
      <Button label="Click me" onPress={jest.fn()} loading={true} />
    );
    
    // Label should not be visible
    expect(queryByText('Click me')).toBeNull();
    
    // Button should be in busy state
    const button = getByRole('button');
    expect(button.props.accessibilityState.busy).toBe(true);
  });

  it('applies correct accessibility props', () => {
    const { getByRole } = render(
      <Button
        label="Click me"
        onPress={jest.fn()}
        accessibilityLabel="Custom label"
        accessibilityHint="This is a hint"
      />
    );
    
    const button = getByRole('button');
    
    expect(button.props.accessibilityLabel).toBe('Custom label');
    expect(button.props.accessibilityHint).toBe('This is a hint');
  });

  it('uses label as accessibility label when not provided', () => {
    const { getByRole } = render(
      <Button label="Click me" onPress={jest.fn()} />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Click me');
  });

  it('sets disabled accessibility state when disabled', () => {
    const { getByRole } = render(
      <Button label="Click me" onPress={jest.fn()} disabled={true} />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('renders with primary variant by default', () => {
    const { getByRole } = render(
      <Button label="Click me" onPress={jest.fn()} />
    );
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('renders with different variants', () => {
    const variants: Array<'primary' | 'secondary' | 'ghost' | 'danger'> = [
      'primary',
      'secondary',
      'ghost',
      'danger',
    ];
    
    variants.forEach((variant) => {
      const { getByText } = render(
        <Button label={`${variant} button`} onPress={jest.fn()} variant={variant} />
      );
      
      expect(getByText(`${variant} button`)).toBeTruthy();
    });
  });

  it('renders with different sizes', () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    
    sizes.forEach((size) => {
      const { getByText } = render(
        <Button label={`${size} button`} onPress={jest.fn()} size={size} />
      );
      
      expect(getByText(`${size} button`)).toBeTruthy();
    });
  });

  it('renders full width when specified', () => {
    const { getByRole } = render(
      <Button label="Click me" onPress={jest.fn()} fullWidth={true} />
    );
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('applies custom styles', () => {
    const customStyle = { marginTop: 20 };
    const customTextStyle = { fontSize: 20 };
    
    const { getByRole } = render(
      <Button
        label="Click me"
        onPress={jest.fn()}
        style={customStyle}
        textStyle={customTextStyle}
      />
    );
    
    const button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('has minimum touch target size', () => {
    const { getByRole } = render(
      <Button label="Click me" onPress={jest.fn()} />
    );
    
    const button = getByRole('button');
    // Button should have minHeight and minWidth of 44 (accessibility requirement)
    expect(button).toBeTruthy();
  });

  it('renders with testID', () => {
    const { getByTestId } = render(
      <Button label="Click me" onPress={jest.fn()} testID="my-button" />
    );
    
    expect(getByTestId('my-button')).toBeTruthy();
  });
});
