# Implementation Plan

- [x] 1. Create UserProfile model and database migration


  - Create UserProfile model with user relationship and profile_data JSONField
  - Generate and run database migration
  - Add indexes for performance optimization
  - _Requirements: 1.1, 1.2_

- [x] 2. Implement ProfileService for persistent profile management


  - Create ProfileService class with get_or_create_profile method
  - Implement profile staleness checking (7 days)
  - Add profile update functionality when questionnaire changes
  - Integrate with existing GeminiProfileService
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Enhance PerplexityOpportunityService for consolidated image generation




  - Update opportunity prompt to request image URLs in same call
  - Modify response parsing to extract both opportunities and image URLs
  - Add image URL validation and fallback logic
  - Remove separate image API call methods
  - _Requirements: 4.1, 4.2, 4.3, 6.1, 6.2, 6.3_

- [x] 4. Simplify OpportunityService with synchronous operations


  - Remove async/background processing methods
  - Implement synchronous refresh_opportunities method
  - Add simple caching logic (4 hour freshness check)
  - Remove complex ThreadPoolExecutor and timeout handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.2, 5.3, 5.4_

- [x] 5. Update API views for synchronous operations


  - Modify OpportunitiesListView to use simplified service
  - Update refresh_opportunities view to be synchronous
  - Remove check_refresh_status endpoint and related polling logic
  - Simplify error handling and response formatting
  - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2, 5.3_

- [x] 6. Remove toast notifications from frontend


  - Update OpportunitiesScreen to remove success toast messages
  - Keep only error notifications for user awareness
  - Remove polling logic and status checking
  - Simplify refresh handling to be synchronous
  - _Requirements: 3.1, 3.2, 3.3, 3.4_



- [ ] 7. Update frontend API service methods
  - Simplify refreshOpportunities to return opportunities directly
  - Remove checkRefreshStatus method and related polling
  - Update error handling to be more straightforward
  - Remove complex async status management
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [x] 8. Add comprehensive testing

  - Write unit tests for ProfileService profile management
  - Test PerplexityService enhanced prompt and parsing
  - Add integration tests for synchronous opportunity flow
  - Test image URL validation and fallback mechanisms
  - _Requirements: 1.1, 2.1, 4.1, 6.1_

- [x] 9. Performance optimization and cleanup

  - Remove unused caching mechanisms and background tasks
  - Optimize database queries with proper indexing
  - Clean up unused imports and methods
  - Add performance monitoring for opportunity generation time
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 10. Update documentation and configuration


  - Update API documentation for simplified endpoints
  - Remove background task configuration
  - Update environment variables if needed
  - Add monitoring and logging for the new flow
  - _Requirements: 2.1, 2.2, 4.1, 6.4_