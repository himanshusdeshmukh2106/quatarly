/**
 * useDebounce Hook Unit Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '../../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));

    expect(result.current).toBe('initial');
  });

  it('delays updating value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // Update value
    rerender({ value: 'updated' });

    // Value should not update immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Value should now be updated
    expect(result.current).toBe('updated');
  });

  it('cancels previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // Rapid updates
    rerender({ value: 'update1' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'update2' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'update3' });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Should still be initial (not enough time passed)
    expect(result.current).toBe('initial');

    // Fast-forward remaining time
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should be the last value
    expect(result.current).toBe('update3');
  });

  it('works with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 1000),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Should not update after 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // Should update after 1000ms
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('works with different value types', () => {
    // Test with number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 0 } }
    );

    numberRerender({ value: 42 });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(numberResult.current).toBe(42);

    // Test with object
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: { count: 0 } } }
    );

    objectRerender({ value: { count: 10 } });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(objectResult.current).toEqual({ count: 10 });
  });

  it('uses default delay of 500ms when not specified', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Should not update before 500ms
    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');

    // Should update at 500ms
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });
});
