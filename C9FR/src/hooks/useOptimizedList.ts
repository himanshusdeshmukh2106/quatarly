/**
 * useOptimizedList Hook
 * 
 * Optimizes list rendering with memoization and callbacks
 */

import { useMemo, useCallback } from 'react';

/**
 * Props for optimized list hook
 */
export interface UseOptimizedListOptions<T> {
  items: T[];
  filterFn?: (item: T) => boolean;
  sortFn?: (a: T, b: T) => number;
}

/**
 * Hook for optimizing list rendering
 * 
 * @param options - List options
 * @returns Optimized list utilities
 */
export const useOptimizedList = <T extends { id: string }>({
  items,
  filterFn,
  sortFn,
}: UseOptimizedListOptions<T>) => {
  /**
   * Filtered and sorted items (memoized)
   */
  const processedItems = useMemo(() => {
    let result = [...items];

    // Apply filter
    if (filterFn) {
      result = result.filter(filterFn);
    }

    // Apply sort
    if (sortFn) {
      result.sort(sortFn);
    }

    return result;
  }, [items, filterFn, sortFn]);

  /**
   * Key extractor for FlatList (memoized)
   */
  const keyExtractor = useCallback((item: T) => item.id, []);

  /**
   * Get item layout for FlatList optimization (memoized)
   */
  const getItemLayout = useCallback(
    (data: T[] | null | undefined, index: number, itemHeight: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    []
  );

  return {
    items: processedItems,
    keyExtractor,
    getItemLayout,
  };
};
