/**
 * Test UI Fixes for Asset Cards
 * This tests the price formatting and growth rate calculation improvements
 */

import { AssetDataProcessor } from './AssetDataProcessor';
import { TradableAsset } from '../types';

// Mock theme object
const mockTheme = {
  colors: {
    text: '#000000',
    background: '#ffffff',
    primary: '#007AFF',
  }
};

// Mock tradable asset with various scenarios
const mockAssets: TradableAsset[] = [
  // Asset with backend growth rate
  {
    id: '1',
    name: 'Apple Inc.',
    assetType: 'stock',
    symbol: 'AAPL',
    exchange: 'NASDAQ',
    currency: 'USD',
    quantity: 10,
    averagePurchasePrice: 150,
    currentPrice: 175.50, // Should format as $175.50 (not $175.50.00)
    totalValue: 1755,
    totalGainLoss: 255,
    totalGainLossPercent: 17.0,
    dailyChange: 2.50,
    dailyChangePercent: 1.45,
    chartData: [],
    createdAt: '',
    updatedAt: '',
    lastUpdated: '',
    aiAnalysis: '',
    riskLevel: 'medium',
    recommendation: 'hold',
    growthRate: 12.5, // Should show 12.5% with green color
    peRatio: 28.45,
    volume: '45.2M',
    marketCap: 2800000000
  },
  
  // Asset without backend growth rate (should calculate)
  {
    id: '2',
    name: 'Tesla Inc.',
    assetType: 'stock',
    symbol: 'TSLA',
    exchange: 'NASDAQ',
    currency: 'USD',
    quantity: 5,
    averagePurchasePrice: 200,
    currentPrice: 180, // Whole number should format as $180 (not $180.00)
    totalValue: 900,
    totalGainLoss: -100,
    totalGainLossPercent: -10.0,
    dailyChange: -5.00,
    dailyChangePercent: -2.7, // Should use this for growth rate calculation
    chartData: [],
    createdAt: '',
    updatedAt: '',
    lastUpdated: '',
    aiAnalysis: '',
    riskLevel: 'high',
    recommendation: 'sell',
    // No growthRate - should calculate from dailyChangePercent
    peRatio: 45.12,
    volume: '23.1M',
    marketCap: 850000000
  },

  // Indian stock with INR currency
  {
    id: '3',
    name: 'Reliance Industries',
    assetType: 'stock',
    symbol: 'RELIANCE',
    exchange: 'NSE',
    currency: 'INR',
    quantity: 50,
    averagePurchasePrice: 2400,
    currentPrice: 2500, // Should format as ₹2500 (not ₹2500.00)
    totalValue: 125000,
    totalGainLoss: 5000,
    totalGainLossPercent: 4.17,
    dailyChange: 25,
    dailyChangePercent: 1.0,
    chartData: [],
    createdAt: '',
    updatedAt: '',
    lastUpdated: '',
    aiAnalysis: '',
    riskLevel: 'medium',
    recommendation: 'hold',
    growthRate: 8.3, // Should show 8.3% with orange color
    peRatio: 15.2,
    volume: '2.5Cr',
    marketCap: 1500000
  }
];

function testPriceFormatting() {
  console.log('🧪 Testing Price Formatting Improvements');
  console.log('=====================================');
  
  mockAssets.forEach((asset, index) => {
    console.log(`\n📊 Asset ${index + 1}: ${asset.name}`);
    
    const displayData = AssetDataProcessor.processAssetForDisplay(asset, mockTheme);
    
    console.log(`   💰 Price: ${displayData.price} (raw) → Display should show clean format`);
    console.log(`   💱 Currency: ${displayData.currency}`);
    console.log(`   📈 Change: ${displayData.changePercent}%`);
    
    // Test the stats generation
    const stats = AssetDataProcessor.getStatsForAsset(asset);
    const growthRateStat = stats.find(stat => stat.label === 'Growth Rate');
    
    console.log(`   📊 Growth Rate: ${growthRateStat?.value} (Color: ${growthRateStat?.color || 'default'})`);
    console.log(`   📋 Volume: ${stats.find(stat => stat.label === 'Volume')?.value}`);
    console.log(`   🏢 Market Cap: ${stats.find(stat => stat.label === 'Market Cap')?.value}`);
    console.log(`   📊 P/E Ratio: ${stats.find(stat => stat.label === 'P/E Ratio')?.value}`);
  });
}

function testGrowthRateCalculation() {
  console.log('\n🧪 Testing Growth Rate Calculation');
  console.log('==================================');
  
  // Test specific scenarios
  const testCases = [
    { description: 'With backend growth rate', asset: mockAssets[0] },
    { description: 'Without growth rate - should use dailyChangePercent', asset: mockAssets[1] },
    { description: 'Indian stock with growth rate', asset: mockAssets[2] }
  ];
  
  testCases.forEach(({ description, asset }) => {
    console.log(`\n📋 ${description}:`);
    console.log(`   Backend Growth Rate: ${asset.growthRate || 'None'}`);
    console.log(`   Daily Change %: ${asset.dailyChangePercent}`);
    console.log(`   Total Gain/Loss %: ${asset.totalGainLossPercent}`);
    
    const stats = AssetDataProcessor.getStatsForAsset(asset);
    const growthRateStat = stats.find(stat => stat.label === 'Growth Rate');
    
    console.log(`   → Calculated Growth Rate: ${growthRateStat?.value}`);
    console.log(`   → Color: ${growthRateStat?.color || 'default'}`);
  });
}

function testCurrencyFormatting() {
  console.log('\n🧪 Testing Currency Formatting');
  console.log('===============================');
  
  const testValues = [
    { amount: 175.50, currency: 'USD', expected: '$175.50' },
    { amount: 180, currency: 'USD', expected: '$180' },
    { amount: 2500, currency: 'INR', expected: '₹2500' },
    { amount: 1234.67, currency: 'INR', expected: '₹1234.67' },
  ];
  
  testValues.forEach(({ amount, currency, expected }) => {
    console.log(`   ${amount} ${currency} → Expected: ${expected}`);
  });
}

// Run tests
console.log('🚀 Running UI Fixes Tests');
console.log('=========================');

testPriceFormatting();
testGrowthRateCalculation();
testCurrencyFormatting();

console.log('\n✅ Tests completed! Check the output above to verify:');
console.log('   1. Price formatting shows clean display (no extra decimals for whole numbers)');
console.log('   2. Growth rates are calculated when backend data is missing');
console.log('   3. Growth rates show appropriate colors based on values');
console.log('   4. Currency symbols are properly formatted');

export default {};