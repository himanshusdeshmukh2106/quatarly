# Unit Tests

This directory contains unit tests for individual components, hooks, and utilities.

## Structure

```
unit/
├── components/     # Component unit tests
├── hooks/          # Hook unit tests
└── utils/          # Utility function unit tests
```

## Guidelines

- Test individual units in isolation
- Mock external dependencies
- Focus on component behavior, not implementation
- Aim for 85%+ coverage for components
- Aim for 90%+ coverage for hooks
- Aim for 95%+ coverage for utilities

## Example

```typescript
// Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/common/Button';

describe('Button', () => {
  it('renders with correct label', () => {
    const { getByText } = render(<Button label="Click me" />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button label="Click me" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```
