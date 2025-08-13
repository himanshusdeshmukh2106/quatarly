// AI Service Configuration
// Add your API keys here or use environment variables

export const AI_CONFIG = {
  // Google Gemini API (Free tier available)
  // Get your key from: https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  
  // Alpha Vantage API (Free tier: 5 calls/minute, 500 calls/day)
  // Get your key from: https://www.alphavantage.co/support/#api-key
  ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY || '',
  
  // Polygon.io API (Free tier: 5 calls/minute)
  // Get your key from: https://polygon.io/
  POLYGON_API_KEY: process.env.POLYGON_API_KEY || '',
  
  // OpenAI API (Paid service)
  // Get your key from: https://platform.openai.com/api-keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Enabled providers (in order of preference)
  // 'yahoo' is free but has rate limits
  // 'gemini' provides intelligent suggestions
  // 'alphavantage' provides real-time stock data
  ENABLED_PROVIDERS: ['yahoo', 'gemini', 'alphavantage'] as const,
  
  // Cache settings
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
  
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 10,
  
  // Fallback settings
  USE_FALLBACK_DATA: true,
  MAX_SUGGESTIONS: 8,
};

// API Provider Information
export const API_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    description: 'AI-powered intelligent asset suggestions',
    free: true,
    rateLimit: '60 requests/minute',
    features: ['Smart suggestions', 'Asset analysis', 'Context understanding'],
    signupUrl: 'https://makersuite.google.com/app/apikey',
  },
  alphavantage: {
    name: 'Alpha Vantage',
    description: 'Real-time stock market data',
    free: true,
    rateLimit: '5 requests/minute (free tier)',
    features: ['Real-time prices', 'Stock search', 'Market data'],
    signupUrl: 'https://www.alphavantage.co/support/#api-key',
  },
  polygon: {
    name: 'Polygon.io',
    description: 'Comprehensive financial market data',
    free: true,
    rateLimit: '5 requests/minute (free tier)',
    features: ['Stock data', 'Crypto data', 'Market information'],
    signupUrl: 'https://polygon.io/',
  },
  yahoo: {
    name: 'Yahoo Finance',
    description: 'Free financial data (unofficial API)',
    free: true,
    rateLimit: 'Rate limited',
    features: ['Stock prices', 'Basic search', 'Market data'],
    signupUrl: 'No signup required',
  },
  openai: {
    name: 'OpenAI',
    description: 'Advanced AI for financial analysis',
    free: false,
    rateLimit: 'Based on plan',
    features: ['Advanced AI', 'Natural language processing', 'Smart analysis'],
    signupUrl: 'https://platform.openai.com/api-keys',
  },
};

// Helper function to check if API keys are configured
export const getConfiguredProviders = () => {
  const configured = [];
  
  if (AI_CONFIG.GEMINI_API_KEY) configured.push('gemini');
  if (AI_CONFIG.ALPHA_VANTAGE_API_KEY) configured.push('alphavantage');
  if (AI_CONFIG.POLYGON_API_KEY) configured.push('polygon');
  if (AI_CONFIG.OPENAI_API_KEY) configured.push('openai');
  
  // Yahoo Finance doesn't need API key
  configured.push('yahoo');
  
  return configured;
};

// Setup instructions
export const SETUP_INSTRUCTIONS = `
🚀 AI Asset Search Setup Instructions:

1. **Free APIs (Recommended to start):**
   
   📊 **Alpha Vantage** (Free: 5 calls/min, 500/day)
   • Visit: https://www.alphavantage.co/support/#api-key
   • Sign up for free account
   • Get your API key
   • Add to .env: ALPHA_VANTAGE_API_KEY=your_key_here
   
   🤖 **Google Gemini** (Free: 60 calls/min)
   • Visit: https://makersuite.google.com/app/apikey
   • Sign in with Google account
   • Create API key
   • Add to .env: GEMINI_API_KEY=your_key_here

2. **Premium APIs (Optional):**
   
   📈 **Polygon.io** (Free tier available)
   • Visit: https://polygon.io/
   • Sign up for account
   • Add to .env: POLYGON_API_KEY=your_key_here
   
   🧠 **OpenAI** (Paid service)
   • Visit: https://platform.openai.com/api-keys
   • Add to .env: OPENAI_API_KEY=your_key_here

3. **No Setup Required:**
   • Yahoo Finance API works without keys (rate limited)

4. **Environment Variables:**
   Create/update your .env file:
   \`\`\`
   GEMINI_API_KEY=your_gemini_key
   ALPHA_VANTAGE_API_KEY=your_alphavantage_key
   POLYGON_API_KEY=your_polygon_key
   \`\`\`

The app will automatically use available providers and fallback to static data if needed.
`;

export default AI_CONFIG;