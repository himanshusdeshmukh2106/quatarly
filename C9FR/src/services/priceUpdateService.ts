import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { refreshAssetPrices, fetchDailyPrices } from './api';
import { Asset, PriceUpdate } from '../types';

interface PriceUpdateConfig {
  updateInterval: number; // in milliseconds
  maxRetries: number;
  retryDelay: number; // in milliseconds
}

class PriceUpdateService {
  private config: PriceUpdateConfig = {
    updateInterval: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
  };

  private updateTimer: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private isUpdating = false;
  private onPriceUpdate?: (assets: Asset[]) => void;

  constructor() {
    this.setupAppStateListener();
  }

  /**
   * Initialize the price update service
   */
  public initialize(onPriceUpdate: (assets: Asset[]) => void) {
    this.onPriceUpdate = onPriceUpdate;
    this.startPeriodicUpdates();
    this.checkForInitialUpdate();
  }

  /**
   * Start periodic price updates
   */
  private startPeriodicUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(() => {
      this.updatePricesIfNeeded();
    }, this.config.updateInterval);
  }

  /**
   * Stop periodic price updates
   */
  public stopPeriodicUpdates() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Check if we need to update prices on app launch
   */
  private async checkForInitialUpdate() {
    try {
      const lastUpdate = await this.getLastUpdateTime();
      const now = new Date();
      
      if (this.shouldUpdatePrices(lastUpdate, now)) {
        await this.updatePrices();
      }
    } catch (error) {
      console.error('Failed to check for initial price update:', error);
    }
  }

  /**
   * Update prices if needed based on time and market status
   */
  private async updatePricesIfNeeded() {
    if (this.isUpdating) {
      return;
    }

    try {
      const lastUpdate = await this.getLastUpdateTime();
      const now = new Date();
      
      if (this.shouldUpdatePrices(lastUpdate, now)) {
        await this.updatePrices();
      }
    } catch (error) {
      console.error('Failed to update prices:', error);
    }
  }

  /**
   * Force update prices regardless of last update time
   */
  public async forceUpdatePrices(): Promise<void> {
    await this.updatePrices();
  }

  /**
   * Update asset prices with retry logic
   */
  private async updatePrices(retryCount = 0): Promise<void> {
    if (this.isUpdating) {
      return;
    }

    this.isUpdating = true;

    try {
      const token = await AsyncStorage.getItem('authToken');
      const updatedAssets = await refreshAssetPrices(token || undefined);
      
      // Update the last update time
      await this.setLastUpdateTime(new Date());
      
      // Notify the callback with updated assets
      if (this.onPriceUpdate) {
        this.onPriceUpdate(updatedAssets);
      }

      console.log(`Price update completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error('Price update failed:', error);
      
      // Retry logic
      if (retryCount < this.config.maxRetries) {
        console.log(`Retrying price update (attempt ${retryCount + 1}/${this.config.maxRetries})`);
        
        setTimeout(() => {
          this.updatePrices(retryCount + 1);
        }, this.config.retryDelay * (retryCount + 1)); // Exponential backoff
        
        return; // Don't set isUpdating to false yet
      }
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Determine if prices should be updated based on time and market conditions
   */
  private shouldUpdatePrices(lastUpdate: Date | null, now: Date): boolean {
    // Always update if we've never updated before
    if (!lastUpdate) {
      return true;
    }

    // Update if last update was more than 1 hour ago
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate >= 1) {
      return true;
    }

    // Update if it's a new trading day
    if (this.isNewTradingDay(lastUpdate, now)) {
      return true;
    }

    // Update during market hours if last update was more than 5 minutes ago
    if (this.isMarketOpen(now)) {
      const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
      return minutesSinceUpdate >= 5;
    }

    return false;
  }

  /**
   * Check if it's a new trading day
   */
  private isNewTradingDay(lastUpdate: Date, now: Date): boolean {
    // Simple check: different date and current time is after market open
    const isDifferentDate = lastUpdate.getDate() !== now.getDate() || 
                           lastUpdate.getMonth() !== now.getMonth() ||
                           lastUpdate.getFullYear() !== now.getFullYear();
    
    const isAfterMarketOpen = now.getHours() >= 9; // Market opens at 9 AM
    
    return isDifferentDate && isAfterMarketOpen;
  }

  /**
   * Check if market is currently open (simplified logic)
   */
  private isMarketOpen(date: Date): boolean {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = date.getHours();
    
    // Market is open Monday to Friday, 9 AM to 4 PM
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = hour >= 9 && hour < 16;
    
    return isWeekday && isMarketHours;
  }

  /**
   * Get the last price update time from storage
   */
  private async getLastUpdateTime(): Promise<Date | null> {
    try {
      const lastUpdateStr = await AsyncStorage.getItem('lastPriceUpdate');
      return lastUpdateStr ? new Date(lastUpdateStr) : null;
    } catch (error) {
      console.error('Failed to get last update time:', error);
      return null;
    }
  }

  /**
   * Set the last price update time in storage
   */
  private async setLastUpdateTime(date: Date): Promise<void> {
    try {
      await AsyncStorage.setItem('lastPriceUpdate', date.toISOString());
    } catch (error) {
      console.error('Failed to set last update time:', error);
    }
  }

  /**
   * Setup app state listener for background/foreground transitions
   */
  private setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground, check for price updates
      this.checkForInitialUpdate();
      this.startPeriodicUpdates();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App went to background, stop periodic updates to save battery
      this.stopPeriodicUpdates();
    }
  };

  /**
   * Update specific symbols with real-time prices
   */
  public async updateSpecificSymbols(symbols: string[]): Promise<PriceUpdate[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return await fetchDailyPrices(symbols, token || undefined);
    } catch (error) {
      console.error('Failed to update specific symbols:', error);
      throw error;
    }
  }

  /**
   * Get market status information
   */
  public getMarketStatus(): { isOpen: boolean; nextOpen?: Date; nextClose?: Date } {
    const now = new Date();
    const isOpen = this.isMarketOpen(now);
    
    // Calculate next market open/close times (simplified)
    const nextOpen = new Date(now);
    const nextClose = new Date(now);
    
    if (isOpen) {
      // Market is open, calculate next close (4 PM today)
      nextClose.setHours(16, 0, 0, 0);
    } else {
      // Market is closed, calculate next open
      if (now.getHours() >= 16 || now.getDay() === 0 || now.getDay() === 6) {
        // After hours or weekend, next open is 9 AM next weekday
        const daysUntilMonday = now.getDay() === 0 ? 1 : (8 - now.getDay()) % 7;
        nextOpen.setDate(now.getDate() + daysUntilMonday);
        nextOpen.setHours(9, 0, 0, 0);
      } else {
        // Before hours, next open is 9 AM today
        nextOpen.setHours(9, 0, 0, 0);
      }
    }
    
    return {
      isOpen,
      nextOpen: isOpen ? undefined : nextOpen,
      nextClose: isOpen ? nextClose : undefined,
    };
  }

  /**
   * Configure update intervals and retry settings
   */
  public configure(config: Partial<PriceUpdateConfig>) {
    this.config = { ...this.config, ...config };
    
    // Restart periodic updates with new interval
    if (this.updateTimer) {
      this.startPeriodicUpdates();
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): PriceUpdateConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  public destroy() {
    this.stopPeriodicUpdates();
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    this.onPriceUpdate = undefined;
  }
}

// Export singleton instance
export default new PriceUpdateService();