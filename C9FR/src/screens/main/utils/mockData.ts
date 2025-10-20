/**
 * Mock Investment Data
 * 
 * Temporary mock data for demonstration purposes
 * This will be replaced with real API data in the future
 */

export interface MockInvestment {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  dividendYield: number;
  growthRate?: number;
  chartData: number[];
  insight: string;
  time: string;
}

export const mockInvestments: MockInvestment[] = [
  {
    id: '1',
    name: 'Gartner, Inc.',
    symbol: 'IT',
    price: 241.68,
    change: -28.22,
    changePercent: -10.45,
    volume: '2.63M',
    marketCap: '18.6B',
    peRatio: 14.71,
    dividendYield: 0.0,
    growthRate: undefined,
    chartData: [350, 340, 330, 320, 310, 300, 290, 280, 270, 260, 250, 240],
    insight: 'IT shares plunged today after President Trump signed a sweeping executive order imposing new global tariffs and escalating trade tensions, triggering a broad selloff in related sectors and increasing investor concerns about rising costs and economic slowdown.',
    time: '6:00 PM'
  },
  {
    id: '2',
    name: 'Vertex Pharmaceuticals',
    symbol: 'VRTX',
    price: 392.66,
    change: -16.86,
    changePercent: -4.12,
    volume: '5.96M',
    marketCap: '100.83B',
    peRatio: -100.17,
    dividendYield: 0.0,
    growthRate: undefined,
    chartData: [420, 415, 410, 405, 400, 395, 390, 385, 380, 375, 385, 392],
    insight: 'Vertex Pharmaceuticals shares plunged today after the company announced its experimental pain drug VX-993 failed a key Phase 2 trial, prompting the discontinuation of its development as a solo treatment and overshadowing its strong quarterly earnings.',
    time: '6:00 PM'
  },
  {
    id: '3',
    name: 'Apple Inc.',
    symbol: 'AAPL',
    price: 185.92,
    change: 4.25,
    changePercent: 2.34,
    volume: '45.2M',
    marketCap: '2.85T',
    peRatio: 28.45,
    dividendYield: 0.52,
    growthRate: 12.5,
    chartData: [175, 178, 180, 182, 184, 186, 188, 185, 183, 184, 186, 185],
    insight: 'Apple shares gained momentum today following strong iPhone 15 sales data from China and positive analyst upgrades citing improved supply chain efficiency and robust services revenue growth in the holiday quarter.',
    time: '6:00 PM'
  },
  {
    id: '4',
    name: 'Microsoft Corporation',
    symbol: 'MSFT',
    price: 412.34,
    change: 8.76,
    changePercent: 2.17,
    volume: '28.9M',
    marketCap: '3.06T',
    peRatio: 34.12,
    dividendYield: 0.78,
    growthRate: 15.2,
    chartData: [395, 398, 402, 405, 408, 410, 412, 415, 413, 411, 412, 412],
    insight: 'Microsoft stock rose today after the company announced significant AI integration improvements in Office 365 and Azure cloud services, with enterprise customers showing strong adoption rates and increased subscription renewals.',
    time: '6:00 PM'
  },
  {
    id: '5',
    name: 'Tesla, Inc.',
    symbol: 'TSLA',
    price: 248.73,
    change: -12.45,
    changePercent: -4.77,
    volume: '89.4M',
    marketCap: '791.2B',
    peRatio: 62.18,
    dividendYield: 0.0,
    growthRate: undefined,
    chartData: [270, 265, 260, 255, 250, 248, 245, 247, 249, 251, 250, 248],
    insight: 'Tesla shares declined today amid concerns over increased competition in the EV market and reports of production delays at the Berlin Gigafactory, overshadowing positive news about Supercharger network expansion.',
    time: '6:00 PM'
  },
  {
    id: '6',
    name: 'NVIDIA Corporation',
    symbol: 'NVDA',
    price: 875.28,
    change: 23.45,
    changePercent: 2.75,
    volume: '52.1M',
    marketCap: '2.16T',
    peRatio: 65.43,
    dividendYield: 0.03,
    growthRate: 8.7,
    chartData: [840, 845, 850, 855, 860, 865, 870, 875, 878, 876, 875, 875],
    insight: 'NVIDIA surged today following reports of breakthrough AI chip developments and major cloud computing partnerships, with analysts raising price targets citing strong demand for next-generation GPU architecture.',
    time: '6:00 PM'
  }
];
