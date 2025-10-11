/**
 * useThrottle Hook Unit Tests
 */

import { renderHook } from '@testing-library/react-native';
import { useThrottle } from '../../../hooks/useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('executes callback immediately on first call', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    result.current('test');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('test');
  });

  it('throttles rapid calls', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    // First call - executes immediately
    result.current('call1');
    expect(callback).toHaveBeenCalledTimes(1);

    // Rapid calls - should be throttled
    result.current('call2');
    result.current('call3');
    result.current('call4');

    // Should still be 1 (throttled)
    expect(callback).toHaveBeenCalledTimes(1);

    // Fast-forward time
    jest.advanceTimersByTime(500);

    // Should execute the last call
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('call4');
  });

  it('allows execution after delay period', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    // First call
    result.current('call1');
    expect(callback).toHaveBeenCalledTimes(1);

    // Wait for delay to pass
    jest.advanceTimersByTime(500);

    // Second call - should execute immediately
    result.current('call2');
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('works with different delay values', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 1000));

    result.current('call1');
    expect(callback).toHaveBeenCalledTimes(1);

    // Try to call before 1000ms
    jest.advanceTimersByTime(500);
    result.current('call2');
    expect(callback).toHaveBeenCalledTimes(1); // Still throttled

    // Wait for remaining time
    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('passes all arguments to callback', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback, 500));

    result.current('arg1', 'arg2', 'arg3');

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('uses default delay of 500ms when not specified', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useThrottle(callback));

    result.current('call1');
    expect(callback).toHaveBeenCalledTimes(1);

    // Try to call before 500ms
    jest.advanceTimersByTime(499);
    result.current('call2');
    expect(callback).toHaveBeenCalledTimes(1);

    // Wait for remaining time
    jest.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('cancels pending execution on unmount', () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useThrottle(callback, 500));

    result.current('call1');
    expect(callback).toHaveBeenCalledTimes(1);

    // Schedule a throttled call
    result.current('call2');

    // Unmount before it executes
    unmount();

    // Fast-forward time
    jest.advanceTimersByTime(500);

    // Should not execute after unmount
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('updates callback reference correctly', () => {
    let callbackValue = 'first';
    const callback = jest.fn(() => callbackValue);

    const { result, rerender } = renderHook(
      ({ cb }) => useThrottle(cb, 500),
      { initialProps: { cb: callback } }
    );

    result.current();
    expect(callback).toHaveBeenCalledTimes(1);

    // Update callback
    callbackValue = 'second';
    const newCallback = jest.fn(() => callbackValue);
    rerender({ cb: newCallback });

    // Wait for throttle period
    jest.advanceTimersByTime(500);

    // Call with new callback
    result.current();
    expect(newCallback).toHaveBeenCalledTimes(1);
  });
});
