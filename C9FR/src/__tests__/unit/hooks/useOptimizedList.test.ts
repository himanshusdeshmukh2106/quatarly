/**
 * useOptimizedList Hook Unit Tests
 */

import { renderHook } from '@testing-library/react-native';
import { useOptimizedList } from '../../../hooks/useOptimizedList';

describe('useOptimizedList', () => {
  const mockItems = [
    { id: '1', name: 'Item 1', value: 10 },
    { id: '2', name: 'Item 2', value: 20 },
    { id: '3', name: 'Item 3', value: 15 },
  ];

  it('returns all items when no filter or sort', () => {
    const { result } = renderHook(() =>
      useOptimizedList({ items: mockItems })
    );

    expect(result.current.items).toEqual(mockItems);
  });

  it('filters items correctly', () => {
    const filterFn = (item: typeof mockItems[0]) => item.value > 15;

    const { result } = renderHook(() =>
      useOptimizedList({ items: mockItems, filterFn })
    );

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('2');
  });

  it('sorts items correctly', () => {
    const sortFn = (a: typeof mockItems[0], b: typeof mockItems[0]) =>
      a.value - b.value;

    const { result } = renderHook(() =>
      useOptimizedList({ items: mockItems, sortFn })
    );

    expect(result.current.items[0].id).toBe('1'); // value: 10
    expect(result.current.items[1].id).toBe('3'); // value: 15
    expect(result.current.items[2].id).toBe('2'); // value: 20
  });

  it('filters and sorts items together', () => {
    const filterFn = (item: typeof mockItems[0]) => item.value >= 15;
    const sortFn = (a: typeof mockItems[0], b: typeof mockItems[0]) =>
      b.value - a.value; // Descending

    const { result } = renderHook(() =>
      useOptimizedList({ items: mockItems, filterFn, sortFn })
    );

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[0].id).toBe('2'); // value: 20
    expect(result.current.items[1].id).toBe('3'); // value: 15
  });

  it('provides keyExtractor function', () => {
    const { result } = renderHook(() =>
      useOptimizedList({ items: mockItems })
    );

    const key = result.current.keyExtractor(mockItems[0]);
    expect(key).toBe('1');
  });

  it('provides getItemLayout function', () => {
    const { result } = renderHook(() =>
      useOptimizedList({ items: mockItems })
    );

    const layout = result.current.getItemLayout(mockItems, 1, 100);
    expect(layout).toEqual({
      length: 100,
      offset: 100,
      index: 1,
    });
  });

  it('memoizes items when dependencies do not change', () => {
    const { result, rerender } = renderHook(
      ({ items }) => useOptimizedList({ items }),
      { initialProps: { items: mockItems } }
    );

    const firstResult = result.current.items;

    // Rerender with same items
    rerender({ items: mockItems });

    // Should be the same reference (memoized)
    expect(result.current.items).toBe(firstResult);
  });

  it('updates items when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ items }) => useOptimizedList({ items }),
      { initialProps: { items: mockItems } }
    );

    const firstResult = result.current.items;

    // Rerender with different items
    const newItems = [...mockItems, { id: '4', name: 'Item 4', value: 25 }];
    rerender({ items: newItems });

    // Should be a different reference
    expect(result.current.items).not.toBe(firstResult);
    expect(result.current.items).toHaveLength(4);
  });
});
