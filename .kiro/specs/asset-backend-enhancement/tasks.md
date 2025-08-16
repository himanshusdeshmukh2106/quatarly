# Implementation Plan

- [x] 1. Enhance existing Investment model to support all asset types


  - Add new asset type choices (gold, silver, commodity) to existing ASSET_TYPE_CHOICES
  - Add minimal physical asset fields (unit only) to Investment model as optional field
  - Add enhanced market data fields (pe_ratio, fifty_two_week_high, fifty_two_week_low) for Perplexity API data
  - Add data enrichment status fields (data_enriched, enrichment_attempted, enrichment_error)
  - Create database migration for new fields
  - Update model methods to handle different asset types appropriately
  - _Requirements: 1.1, 1.2, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_



- [x] 2. Set up Perplexity API integration service


  - Install required dependencies (requests, python-dotenv if not already present)
  - Create PerplexityAPIService class with methods for different asset types
  - Implement get_stock_data method for stocks and ETFs
  - Implement get_crypto_data method for cryptocurrencies
  - Implement get_precious_metal_price method for gold and silver
  - Implement get_bond_data method for bonds
  - Add proper error handling and rate limiting
  - Add API key configuration in settings.py using environment variables


  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_


- [x] 3. Create BharatSM service for frontend data fetching


  - Create BharatSMService class using MoneyControl from Fundamentals library
  - Implement get_frontend_display_data method to fetch volume, market cap, P/E ratio, and growth rate
  - Implement _get_volume_data method to fetch and format trading volume as string (e.g., "1.2M")
  - Implement _get_market_cap method to extract market capitalization from ratios data
  - Implement _get_pe_ratio method to get P/E ratio from complete ratios data
  - Implement _get_growth_rate method to calculate revenue growth from quarterly results
  - Implement _format_volume helper method to format volume numbers as strings
  - Add error handling and logging for BharatSM API failures
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_





- [ ] 4. Set up Celery for background tasks
  - Install and configure Celery with Redis/RabbitMQ broker
  - Create celery.py configuration file
  - Update Django settings for Celery integration


  - Create background task for data enrichment (enrich_investment_data_task)
  - Create daily price update task (daily_price_update_task)


  - Add task scheduling configuration

  - Test background task execution
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_



- [ ] 5. Update Investment model and serializers for frontend data fields
  - Add volume field (CharField) to Investment model for formatted volume strings
  - Add growth_rate field (DecimalField) to Investment model to replace dividend_yield


  - Remove dividend_yield field from Investment model
  - Update InvestmentSerializer to include volume, market_cap, pe_ratio, growth_rate fields
  - Update serializer field lists to match frontend requirements exactly
  - Add asset_specific_fields method to return relevant fields based on asset type
  - Create database migration for new volume and growth_rate fields
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_





- [ ] 6. Enhance InvestmentViewSet with new functionality
  - Update perform_create method to trigger data enrichment for tradeable assets
  - Add asset_suggestions endpoint for AddAssetModal autocomplete
  - Enhance refresh_prices endpoint to handle all asset types
  - Add enrich_data endpoint for manual data enrichment
  - Update portfolio_summary endpoint to include all asset types

  - Add filtering by asset_type query parameter

  - Maintain backward compatibility with existing API responses
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 7. Create asset suggestion system for frontend

  - Create static asset database with popular stocks, crypto, and commodities



  - Implement intelligent search with scoring algorithm
  - Add support for Indian stocks (NSE/BSE), US stocks (NASDAQ/NYSE), and global crypto


  - Include precious metals (gold, silver) and commodities in suggestions
  - Add current price fetching for selected assets


  - Implement caching for better performance




  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_


- [ ] 8. Update data enrichment service to use BharatSM with Perplexity fallback
  - Update DataEnrichmentService.enrich_investment_data to use BharatSM first


  - Implement enrich_stock_data_with_bharatsm method for stocks/ETFs using BharatSM
  - Implement fallback to Perplexity when BharatSM fails or for unsupported asset types


  - Update investment fields with volume, market_cap, pe_ratio, and growth_rate from BharatSM
  - Add logging for BharatSM success/failure and Perplexity fallback usage
  - Handle API failures gracefully without blocking asset creation
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 9. Create daily data update system using BharatSM
  - Implement daily_price_and_data_update Celery task
  - Update volume, market cap, P/E ratio, and growth rate for stocks/ETFs using BharatSM


  - Update crypto data using Perplexity fallback (BharatSM doesn't support crypto)
  - Calculate daily change and percentage change from price updates
  - Handle market closure times and weekend updates
  - Add error handling and retry logic for failed BharatSM calls
  - Log update results, BharatSM failures, and Perplexity fallback usage
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_





- [ ] 10. Add comprehensive error handling and validation
  - Create custom exception classes for different error types

  - Add validation for asset-specific required fields
  - Implement graceful handling of Perplexity API failures
  - Add user-friendly error messages for common validation errors
  - Create error logging for debugging and monitoring
  - Add rate limiting protection for API endpoints
  - _Requirements: 2.6, 2.7, 4.6, 4.7, 7.3, 7.4, 7.5_





- [x] 11. Update portfolio analytics for all asset types

  - Enhance portfolio_summary endpoint to include physical assets


  - Calculate total portfolio value across all asset types


  - Provide asset allocation breakdown by type
  - Calculate performance metrics for mixed portfolios


  - Add diversification insights




  - Include top and worst performing assets across all types
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_


- [ ] 12. Create comprehensive test suite for BharatSM integration
  - Write unit tests for BharatSMService methods (volume, market cap, P/E ratio, growth rate)





  - Test BharatSMService with real MoneyControl API calls for sample stocks
  - Test DataEnrichmentService with BharatSM primary and Perplexity fallback
  - Create integration tests for asset creation with BharatSM data enrichment
  - Test Celery tasks for daily data updates using BharatSM
  - Test API endpoints returning volume, market_cap, pe_ratio, growth_rate fields
  - Add performance tests for BharatSM API response times
  - Test error handling when BharatSM fails and Perplexity fallback activates
  - _Requirements: All requirements - testing coverage_

- [ ] 13. Add database indexes and performance optimizations
  - Add database indexes for common query patterns (user + asset_type, symbol)
  - Implement query optimization with select_related and prefetch_related
  - Add caching for portfolio summaries and frequently accessed data
  - Optimize API responses for large portfolios
  - Add pagination for asset lists if needed
  - _Requirements: 6.6, 7.6, 7.7_

- [ ] 14. Update API documentation and examples
  - Update API documentation to reflect new asset types
  - Add examples for creating different asset types


  - Document new endpoints (asset_suggestions, enrich_data)


  - Update response format documentation
  - Add troubleshooting guide for common issues
  - _Requirements: 7.6, 7.7_

- [ ] 15. Update frontend components to display growth rate instead of dividend yield
  - Update TradableAssetCard to show growthRate instead of dividendYield in stats section
  - Update AssetCard getDividendYield method to getGrowthRate method
  - Update frontend types to include growthRate field and remove dividendYield
  - Update TradableAsset interface to include growthRate as optional number field
  - Update asset card styling to show "Growth Rate" label instead of "Dividend Yield"
  - Add appropriate color coding for growth rate (green for positive, red for negative)
  - Ensure PhysicalAssetCard continues showing its current 4 fields without changes
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_



- [ ] 16. Deploy and configure production environment
  - Set up Perplexity API key in production environment
  - Configure Celery workers and beat scheduler
  - Set up Redis/RabbitMQ for task queue
  - Configure logging and monitoring
  - Run database migrations
  - Test end-to-end functionality in production
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_