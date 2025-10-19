/**
 * useThrottle Hook
 * 
 * Throttles a callback to limit execution frequency
 */

import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook for throttling a callback
 * 
 * @param callback - Callback to throttle
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns Throttled callback
 * 
 * @example
 * const handleScroll = useThrottle((event) => {
 *   console.log('Scroll position:', event.nativeEvent.contentOffset.y);
 * }, 200);
 * 
 * <ScrollView onScroll={handleScroll} />
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): ((...args: Parameters<T>) => void) => {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        // Enough time has passed, execute immediately
        callback(...args);
        lastRun.current = now;
      } else {
        // Not enough time has passed, schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastRun.current = Date.now();
          },
          delay - timeSinceLastRun
        );
      }
    },
    [callback, delay]
  );
};
