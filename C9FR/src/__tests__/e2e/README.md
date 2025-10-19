# End-to-End Tests

This directory contains end-to-end tests that test complete user workflows.

## Structure

```
e2e/
├── auth.e2e.test.ts           # Authentication flows
├── assets.e2e.test.ts         # Asset management flows
├── goals.e2e.test.ts          # Goal management flows
└── opportunities.e2e.test.ts  # Opportunity flows
```

## Guidelines

- Test complete user journeys
- Use real API calls (or comprehensive mocks)
- Test critical business flows
- Focus on happy paths and critical error scenarios
- These tests may be slower but more comprehensive

## Example

```typescript
// auth.e2e.test.ts
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '@/App';

describe('Authentication E2E', () => {
  it('allows user to register, login, and access protected content', async () => {
    const { getByText, getByTestId } = render(<App />);

    // Navigate to registration
    fireEvent.press(getByText('Sign Up'));

    // Fill registration form
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('register-button'));

    // Wait for redirect to login
    await waitFor(() => {
      expect(getByText('Login')).toBeTruthy();
    });

    // Login with new credentials
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('login-button'));

    // Verify user is logged in and can see protected content
    await waitFor(() => {
      expect(getByText('Dashboard')).toBeTruthy();
    });
  });
});
```

## Running E2E Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run specific e2e test
npm run test -- e2e/auth.e2e.test.ts
```
