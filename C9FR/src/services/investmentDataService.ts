import { InvestmentData } from '../components/InvestmentCard';

// Static data removed - using real assets from backend
export const MOCK_INVESTMENTS: readonly InvestmentData[] = Object.freeze([]);


export class InvestmentDataService {
  private static instance: InvestmentDataService;
  private cachedData: InvestmentData[] | null = null;

  static getInstance(): InvestmentDataService {
    if (!InvestmentDataService.instance) {
      InvestmentDataService.instance = new InvestmentDataService();
    }
    return InvestmentDataService.instance;
  }

  getMockInvestments(): readonly InvestmentData[] {
    return MOCK_INVESTMENTS;
  }

  // Future: Replace with real API call
  async fetchInvestments(): Promise<InvestmentData[]> {
    if (this.cachedData) {
      return this.cachedData;
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.cachedData = [...MOCK_INVESTMENTS];
    return this.cachedData;
  }

  // Invalidate cache when needed
  invalidateCache(): void {
    this.cachedData = null;
  }

  // Update specific investment (for real-time updates)
  updateInvestment(id: string, updates: Partial<InvestmentData>): void {
    if (this.cachedData) {
      const index = this.cachedData.findIndex(inv => inv.id === id);
      if (index !== -1) {
        this.cachedData[index] = { ...this.cachedData[index], ...updates };
      }
    }
  }
}