import { ParsedAssetData, PDFParsingResult, AssetType } from '../types';

/**
 * PDF Import Service for parsing brokerage statements and extracting asset data
 * Supports common brokerage formats with confidence scoring
 */
export class PDFImportService {
  private static readonly SUPPORTED_BROKERAGES = [
    'zerodha', 'upstox', 'groww', 'angel', 'icicidirect', 'hdfcsec', 'kotak',
    'robinhood', 'etrade', 'schwab', 'fidelity', 'tdameritrade'
  ];

  private static readonly ASSET_TYPE_PATTERNS = {
    stock: /\b(equity|stock|share|common stock)\b/i,
    etf: /\b(etf|exchange traded fund)\b/i,
    bond: /\b(bond|debenture|fixed deposit|fd)\b/i,
    crypto: /\b(bitcoin|btc|ethereum|eth|crypto|cryptocurrency)\b/i,
  };

  private static readonly SYMBOL_PATTERNS = {
    indian: /\b([A-Z]{2,10})(\.NS|\.BO)?\b/g,
    us: /\b([A-Z]{1,5})\b/g,
    crypto: /\b(BTC|ETH|ADA|DOT|MATIC|SOL|AVAX|LINK|UNI|AAVE)(-USD|-INR)?\b/g,
  };

  /**
   * Parses PDF content and extracts asset data
   */
  static async parsePDF(
    pdfUri: string,
    password?: string
  ): Promise<PDFParsingResult> {
    try {
      // Extract text from PDF
      const textContent = await this.extractTextFromPDF(pdfUri, password);
      
      if (!textContent) {
        return {
          success: false,
          assets: [],
          errors: ['Failed to extract text from PDF'],
          warnings: [],
          totalAssetsFound: 0,
          parsingConfidence: 0,
        };
      }

      // Detect brokerage format
      const brokerageType = this.detectBrokerageType(textContent);
      
      // Parse assets based on detected format
      const parsedAssets = await this.parseAssetData(textContent, brokerageType);
      
      // Calculate overall confidence
      const overallConfidence = this.calculateOverallConfidence(parsedAssets);
      
      // Generate warnings for low confidence assets
      const warnings = this.generateWarnings(parsedAssets);

      return {
        success: parsedAssets.length > 0,
        assets: parsedAssets,
        errors: [],
        warnings,
        totalAssetsFound: parsedAssets.length,
        parsingConfidence: overallConfidence,
      };

    } catch (error) {
      return {
        success: false,
        assets: [],
        errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
        warnings: [],
        totalAssetsFound: 0,
        parsingConfidence: 0,
      };
    }
  }

  /**
   * Extracts text content from PDF file
   */
  private static async extractTextFromPDF(
    pdfUri: string,
    _password?: string
  ): Promise<string | null> {
    try {
      // Import react-native-fs for file operations
      const RNFS = require('react-native-fs');
      
      // For now, we'll use a mock implementation since react-native-pdf
      // doesn't directly support text extraction. In a real implementation,
      // you would need a PDF text extraction library or backend service.
      
      // Check if file exists
      const fileExists = await RNFS.exists(pdfUri);
      if (!fileExists) {
        throw new Error('PDF file not found');
      }
      
      // Mock PDF content for testing - in real implementation,
      // this would extract actual text from the PDF
      const mockPDFContent = `
        ZERODHA CAPITAL SERVICES LTD
        Portfolio Statement as on 31-Dec-2024
        
        Holdings:
        RELIANCE    100    2,450.00    2,45,000.00
        TCS         50     3,200.00    1,60,000.00
        INFY        75     1,800.00    1,35,000.00
        HDFCBANK    25     1,600.00    40,000.00
        
        Mutual Funds:
        AXIS BLUECHIP FUND    1000.50    45.67    45,692.84
        SBI SMALL CAP FUND    500.25     85.43    42,736.36
        
        Crypto Holdings:
        BTC-USD     0.5     45000.00    22,500.00
        ETH-USD     2.0     3000.00     6,000.00
      `;
      
      return mockPDFContent;
    } catch (error) {
      console.error('PDF text extraction failed:', error);
      return null;
    }
  }

  /**
   * Detects the brokerage type from PDF content
   */
  private static detectBrokerageType(textContent: string): string {
    const lowerContent = textContent.toLowerCase();
    
    for (const brokerage of this.SUPPORTED_BROKERAGES) {
      if (lowerContent.includes(brokerage)) {
        return brokerage;
      }
    }
    
    return 'unknown';
  }

  /**
   * Parses asset data from text content
   */
  private static async parseAssetData(
    textContent: string,
    brokerageType: string
  ): Promise<ParsedAssetData[]> {
    const assets: ParsedAssetData[] = [];
    
    try {
      // Parse based on brokerage type
      switch (brokerageType) {
        case 'zerodha':
          assets.push(...this.parseZerodhaFormat(textContent));
          break;
        case 'upstox':
          assets.push(...this.parseUpstoxFormat(textContent));
          break;
        case 'groww':
          assets.push(...this.parseGrowwFormat(textContent));
          break;
        default:
          assets.push(...this.parseGenericFormat(textContent));
      }
      
      return assets;
    } catch (error) {
      console.error('Asset parsing failed:', error);
      return [];
    }
  }

  /**
   * Parses Zerodha format portfolio statements
   */
  private static parseZerodhaFormat(textContent: string): ParsedAssetData[] {
    const assets: ParsedAssetData[] = [];
    const lines = textContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Match pattern: SYMBOL QUANTITY PRICE TOTAL_VALUE
      const stockMatch = trimmedLine.match(/^([A-Z]+)\s+(\d+(?:\.\d+)?)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)$/);
      
      if (stockMatch) {
        const [, symbol, quantity, price, totalValue] = stockMatch;
        
        assets.push({
          symbol: symbol,
          name: this.getCompanyName(symbol),
          quantity: parseFloat(quantity),
          averagePurchasePrice: parseFloat(price.replace(/,/g, '')),
          currentValue: parseFloat(totalValue.replace(/,/g, '')),
          assetType: 'stock',
          confidence: 0.9,
        });
      }
      
      // Match mutual fund pattern
      const mfMatch = trimmedLine.match(/^(.+FUND)\s+(\d+(?:\.\d+)?)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)$/);
      
      if (mfMatch) {
        const [, name, units, nav, totalValue] = mfMatch;
        
        assets.push({
          symbol: this.generateMFSymbol(name),
          name: name.trim(),
          quantity: parseFloat(units),
          averagePurchasePrice: parseFloat(nav.replace(/,/g, '')),
          currentValue: parseFloat(totalValue.replace(/,/g, '')),
          assetType: 'etf', // Treating MF as ETF for simplicity
          confidence: 0.85,
        });
      }
    }
    
    return assets;
  }

  /**
   * Parses Upstox format portfolio statements
   */
  private static parseUpstoxFormat(textContent: string): ParsedAssetData[] {
    // Similar parsing logic for Upstox format
    return this.parseGenericFormat(textContent);
  }

  /**
   * Parses Groww format portfolio statements
   */
  private static parseGrowwFormat(textContent: string): ParsedAssetData[] {
    // Similar parsing logic for Groww format
    return this.parseGenericFormat(textContent);
  }

  /**
   * Generic parsing for unknown formats
   */
  private static parseGenericFormat(textContent: string): ParsedAssetData[] {
    const assets: ParsedAssetData[] = [];
    const lines = textContent.split('\n');
    
    for (const line of lines) {
      // Try to extract symbols using regex patterns
      const symbols = this.extractSymbols(line);
      const numbers = this.extractNumbers(line);
      
      if (symbols.length > 0 && numbers.length >= 3) {
        const symbol = symbols[0];
        const assetType = this.detectAssetType(line);
        
        assets.push({
          symbol: symbol,
          name: this.getCompanyName(symbol),
          quantity: numbers[0],
          averagePurchasePrice: numbers[1],
          currentValue: numbers[2],
          assetType: assetType,
          confidence: 0.7, // Lower confidence for generic parsing
        });
      }
    }
    
    return assets;
  }

  /**
   * Extracts potential stock symbols from text
   */
  private static extractSymbols(text: string): string[] {
    const symbols: string[] = [];
    
    // Try Indian stock pattern
    const indianMatches = text.match(this.SYMBOL_PATTERNS.indian);
    if (indianMatches) {
      symbols.push(...indianMatches.map(s => s.replace(/\.(NS|BO)/, '')));
    }
    
    // Try US stock pattern
    const usMatches = text.match(this.SYMBOL_PATTERNS.us);
    if (usMatches) {
      symbols.push(...usMatches);
    }
    
    // Try crypto pattern
    const cryptoMatches = text.match(this.SYMBOL_PATTERNS.crypto);
    if (cryptoMatches) {
      symbols.push(...cryptoMatches);
    }
    
    return symbols;
  }

  /**
   * Extracts numbers from text line
   */
  private static extractNumbers(text: string): number[] {
    const numberPattern = /[\d,]+\.?\d*/g;
    const matches = text.match(numberPattern);
    
    if (!matches) return [];
    
    return matches.map(match => parseFloat(match.replace(/,/g, '')));
  }

  /**
   * Detects asset type from text content
   */
  private static detectAssetType(text: string): AssetType {
    for (const [type, pattern] of Object.entries(this.ASSET_TYPE_PATTERNS)) {
      if (pattern.test(text)) {
        return type as AssetType;
      }
    }
    
    return 'stock'; // Default to stock
  }

  /**
   * Gets company name for a symbol (mock implementation)
   */
  private static getCompanyName(symbol: string): string {
    const companyNames: Record<string, string> = {
      'RELIANCE': 'Reliance Industries Ltd',
      'TCS': 'Tata Consultancy Services',
      'INFY': 'Infosys Limited',
      'HDFCBANK': 'HDFC Bank Limited',
      'ICICIBANK': 'ICICI Bank Limited',
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'TSLA': 'Tesla Inc.',
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
    };
    
    return companyNames[symbol] || symbol;
  }

  /**
   * Generates symbol for mutual fund
   */
  private static generateMFSymbol(name: string): string {
    return name
      .replace(/\s+/g, '')
      .replace(/FUND/gi, '')
      .substring(0, 10)
      .toUpperCase();
  }

  /**
   * Calculates overall parsing confidence
   */
  private static calculateOverallConfidence(assets: ParsedAssetData[]): number {
    if (assets.length === 0) return 0;
    
    const totalConfidence = assets.reduce((sum, asset) => sum + asset.confidence, 0);
    return totalConfidence / assets.length;
  }

  /**
   * Generates warnings for low confidence assets
   */
  private static generateWarnings(assets: ParsedAssetData[]): string[] {
    const warnings: string[] = [];
    
    const lowConfidenceAssets = assets.filter(asset => asset.confidence < 0.8);
    
    if (lowConfidenceAssets.length > 0) {
      warnings.push(
        `${lowConfidenceAssets.length} assets have low parsing confidence. Please verify the data.`
      );
    }
    
    const duplicateSymbols = this.findDuplicateSymbols(assets);
    if (duplicateSymbols.length > 0) {
      warnings.push(
        `Duplicate symbols detected: ${duplicateSymbols.join(', ')}. Please review.`
      );
    }
    
    return warnings;
  }

  /**
   * Finds duplicate symbols in parsed assets
   */
  private static findDuplicateSymbols(assets: ParsedAssetData[]): string[] {
    const symbolCounts: Record<string, number> = {};
    
    assets.forEach(asset => {
      symbolCounts[asset.symbol] = (symbolCounts[asset.symbol] || 0) + 1;
    });
    
    return Object.keys(symbolCounts).filter(symbol => symbolCounts[symbol] > 1);
  }

  /**
   * Validates PDF file before processing
   */
  static validatePDFFile(fileUri: string): { isValid: boolean; error?: string } {
    try {
      // Basic validation checks
      if (!fileUri) {
        return { isValid: false, error: 'No file selected' };
      }
      
      if (!fileUri.toLowerCase().endsWith('.pdf')) {
        return { isValid: false, error: 'File must be a PDF' };
      }
      
      // Additional checks can be added here
      // File size, corruption checks, etc.
      
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'File validation failed' 
      };
    }
  }

  /**
   * Checks if password is required for PDF
   */
  static async isPasswordProtected(_fileUri: string): Promise<boolean> {
    try {
      // Mock implementation - in real app, this would check PDF encryption
      return false;
    } catch (error) {
      console.error('Password check failed:', error);
      return false;
    }
  }
}