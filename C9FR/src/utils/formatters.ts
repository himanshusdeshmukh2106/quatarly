/**
 * Formatting Utilities
 * Reusable functions for formatting currency, numbers, and dates
 */

import { FINANCIAL_MULTIPLIERS } from './constants';

/**
 * Format currency with appropriate symbol and locale
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === 'USD' ? `$${formatted}` : `₹${formatted}`;
};

/**
 * Format large numbers in compact notation (T, B, Cr, L, K)
 */
export const formatCompact = (value: number): string => {
  if (value >= FINANCIAL_MULTIPLIERS.TRILLION) {
    return `₹${(value / FINANCIAL_MULTIPLIERS.TRILLION).toFixed(2)}T`;
  }
  if (value >= FINANCIAL_MULTIPLIERS.BILLION) {
    return `₹${(value / FINANCIAL_MULTIPLIERS.BILLION).toFixed(2)}B`;
  }
  if (value >= FINANCIAL_MULTIPLIERS.CRORE) {
    return `₹${(value / FINANCIAL_MULTIPLIERS.CRORE).toFixed(2)}Cr`;
  }
  if (value >= FINANCIAL_MULTIPLIERS.LAKH) {
    return `₹${(value / FINANCIAL_MULTIPLIERS.LAKH).toFixed(2)}L`;
  }
  if (value >= FINANCIAL_MULTIPLIERS.THOUSAND) {
    return `₹${(value / FINANCIAL_MULTIPLIERS.THOUSAND).toFixed(2)}K`;
  }
  return `₹${value.toFixed(2)}`;
};

/**
 * Format percentage value with sign
 */
export const formatPercentage = (value: number, includeSign: boolean = true): string => {
  const sign = includeSign && value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };
  
  return dateObj.toLocaleDateString('en-US', defaultOptions);
};

/**
 * Format timestamp with time
 */
export const formatTimestamp = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format change with arrow indicator
 */
export const formatChangeWithArrow = (value: number, currency: string = 'INR'): string => {
  const arrow = value >= 0 ? '↑' : '↓';
  return `${arrow} ${formatCurrency(Math.abs(value), currency)}`;
};
