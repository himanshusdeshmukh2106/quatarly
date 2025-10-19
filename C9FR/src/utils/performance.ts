import React from 'react';

/**
 * Performance monitoring utility for React Native app
 * Tracks component render times, API calls, and memory usage
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = __DEV__; // Only enable in development

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start measuring performance for a given operation
   */
  static mark(name: string, metadata?: Record<string, any>): void {
    const instance = PerformanceMonitor.getInstance();
    if (!instance.isEnabled) return;

    instance.metrics.set(name, {
      name,
      startTime: Date.now(),
      metadata,
    });
  }

  /**
   * End measurement and calculate duration
   */
  static measure(name: string, logToConsole: boolean = true): number {
    const instance = PerformanceMonitor.getInstance();
    if (!instance.isEnabled) return 0;

    const metric = instance.metrics.get(name);
    if (!metric) {
      console.warn(`[Performance] No start mark found for "${name}"`);
      return 0;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    // Update metric
    metric.endTime = endTime;
    metric.duration = duration;

    if (logToConsole) {
      const metadataStr = metric.metadata 
        ? ` (${JSON.stringify(metric.metadata)})` 
        : '';
      console.log(`[Performance] ${name}: ${duration}ms${metadataStr}`);
    }

    return duration;
  }

  /**
   * Clear a specific metric
   */
  static clear(name: string): void {
    const instance = PerformanceMonitor.getInstance();
    instance.metrics.delete(name);
  }

  /**
   * Clear all metrics
   */
  static clearAll(): void {
    const instance = PerformanceMonitor.getInstance();
    instance.metrics.clear();
  }

  /**
   * Get all metrics
   */
  static getMetrics(): PerformanceMetric[] {
    const instance = PerformanceMonitor.getInstance();
    return Array.from(instance.metrics.values());
  }

  /**
   * Get metrics summary
   */
  static getSummary(): {
    totalOperations: number;
    averageDuration: number;
    slowestOperation: PerformanceMetric | null;
    fastestOperation: PerformanceMetric | null;
  } {
    const metrics = PerformanceMonitor.getMetrics();
    const completedMetrics = metrics.filter(m => m.duration !== undefined);

    if (completedMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
      };
    }

    const durations = completedMetrics.map(m => m.duration!);
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    const averageDuration = totalDuration / durations.length;

    const slowestOperation = completedMetrics.reduce((slowest, current) => 
      (current.duration! > slowest.duration!) ? current : slowest
    );

    const fastestOperation = completedMetrics.reduce((fastest, current) => 
      (current.duration! < fastest.duration!) ? current : fastest
    );

    return {
      totalOperations: completedMetrics.length,
      averageDuration: Math.round(averageDuration * 100) / 100,
      slowestOperation,
      fastestOperation,
    };
  }

  /**
   * Enable or disable performance monitoring
   */
  static setEnabled(enabled: boolean): void {
    const instance = PerformanceMonitor.getInstance();
    instance.isEnabled = enabled;
  }

  /**
   * Measure a function execution time
   */
  static measureFunction<T>(
    name: string, 
    fn: () => T, 
    metadata?: Record<string, any>
  ): T {
    PerformanceMonitor.mark(name, metadata);
    try {
      const result = fn();
      PerformanceMonitor.measure(name);
      return result;
    } catch (error) {
      PerformanceMonitor.measure(name);
      throw error;
    } finally {
      PerformanceMonitor.clear(name);
    }
  }

  /**
   * Measure an async function execution time
   */
  static async measureAsync<T>(
    name: string, 
    fn: () => Promise<T>, 
    metadata?: Record<string, any>
  ): Promise<T> {
    PerformanceMonitor.mark(name, metadata);
    try {
      const result = await fn();
      PerformanceMonitor.measure(name);
      return result;
    } catch (error) {
      PerformanceMonitor.measure(name);
      throw error;
    } finally {
      PerformanceMonitor.clear(name);
    }
  }
}

/**
 * React Hook for measuring component render performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  const markRenderStart = () => {
    PerformanceMonitor.mark(`${componentName}_render`);
  };

  const markRenderEnd = () => {
    PerformanceMonitor.measure(`${componentName}_render`);
    PerformanceMonitor.clear(`${componentName}_render`);
  };

  return { markRenderStart, markRenderEnd };
};

/**
 * Higher-order component for automatic performance monitoring
 */
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
): React.FC<P> => {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;

  const MonitoredComponent: React.FC<P> = (props: P) => {
    React.useEffect(() => {
      PerformanceMonitor.mark(`${displayName}_mount`);
      return () => {
        PerformanceMonitor.measure(`${displayName}_mount`);
        PerformanceMonitor.clear(`${displayName}_mount`);
      };
    }, []);

    return React.createElement(WrappedComponent, props);
  };

  MonitoredComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return MonitoredComponent;
};

export default PerformanceMonitor;
