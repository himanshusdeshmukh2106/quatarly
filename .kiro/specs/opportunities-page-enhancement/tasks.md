# Implementation Plan

- [x] 1. Set up backend data models and API endpoints


  - Create Opportunity model with all required fields
  - Implement questionnaire responses API endpoint for fetching user data
  - Create opportunities API endpoint with GET and POST methods
  - _Requirements: 1.1, 6.1, 6.4_





- [x] 2. Implement backend AI services infrastructure

  - [x] 2.1 Create GeminiProfileService for user profile generation

    - Add GEMINI_API_KEY to backend .env file for API authentication
    - Write service class to interface with Gemini 2.5 Flash model API

    - Implement method to convert questionnaire responses to structured profile prompt
    - Add error handling and fallback mechanisms for API failures
    - _Requirements: 6.2, 6.5_

  - [x] 2.2 Create PerplexityOpportunityService for opportunity discovery

    - Write service class to interface with Perplexity API
    - Implement method to find opportunities based on user profile
    - Add opportunity categorization and prioritization logic
    - _Requirements: 6.3, 7.1, 7.2, 7.3, 7.4, 7.5_




  - [x] 2.3 Create OpportunityService orchestrator

    - Write main service class to coordinate profile generation and opportunity discovery
    - Implement opportunity processing and formatting logic
    - Add caching mechanism for generated opportunities

    - _Requirements: 6.1, 6.4, 6.5_

- [x] 3. Implement backend API views and serializers

  - [x] 3.1 Create opportunity serializers

    - Write OpportunitySerializer for API responses

    - Create UserProfileSerializer for internal data handling
    - Add validation for opportunity data structures
    - _Requirements: 6.4_



  - [x] 3.2 Implement opportunities API views

    - Write OpportunitiesListView for fetching user opportunities
    - Implement OpportunitiesRefreshView for regenerating opportunities
    - Add proper authentication and permission handling
    - _Requirements: 1.1, 5.1, 5.2, 5.3_



  - [x] 3.3 Create questionnaire responses API endpoint

    - Write UserResponsesView to fetch user questionnaire data
    - Implement proper data filtering and formatting
    - Add error handling for missing or incomplete responses
    - _Requirements: 1.2, 6.1_

- [x] 4. Create frontend TypeScript interfaces and types


  - Define Opportunity interface with all required properties
  - Create OpportunityCategory interface for categorization
  - Add UserProfile interface for internal data handling
  - Write API response types for type safety
  - _Requirements: 3.1, 3.2_

- [x] 5. Implement frontend API service methods

  - [x] 5.1 Add opportunities API methods to api.ts

    - Write fetchOpportunities method with authentication handling
    - Implement refreshOpportunities method for data refresh
    - Add proper error handling and response transformation
    - _Requirements: 1.1, 5.1, 5.2, 5.3_

  - [x] 5.2 Add questionnaire responses API method

    - Write fetchUserResponses method for profile data
    - Implement proper data transformation and error handling
    - Add authentication token management
    - _Requirements: 6.1_

- [x] 6. Create OpportunityCard component


  - [x] 6.1 Implement basic OpportunityCard structure


    - Create component with consistent card styling matching Goals screen
    - Add opportunity title, description, and category display
    - Implement priority indicator with appropriate visual styling
    - _Requirements: 3.1, 3.2, 4.3_

  - [x] 6.2 Add category icons and visual indicators

    - Implement category icon mapping using MaterialCommunityIcons
    - Add priority-based color coding and visual indicators
    - Create consistent spacing and typography following design system
    - _Requirements: 3.1, 3.2, 4.3_

  - [x] 6.3 Implement AI insights section in OpportunityCard

    - Add clickable AI insights section below opportunity content
    - Use same styling pattern as Goals screen AI insights
    - Implement proper touch feedback and accessibility
    - _Requirements: 2.1, 3.3_

- [x] 7. Create OpportunityInsightsDrawer component


  - [x] 7.1 Implement drawer structure extending AIInsightsDrawer pattern


    - Create drawer component with same animation and gesture handling
    - Add opportunity-specific header with title and category
    - Implement proper modal and backdrop handling
    - _Requirements: 2.2, 2.3, 3.3_

  - [x] 7.2 Add opportunity insights content sections

    - Create sections for opportunity analysis, relevance, and benefits
    - Add actionable steps section with formatted list
    - Implement proper scrolling and content layout
    - _Requirements: 2.3_

  - [x] 7.3 Implement drawer interaction and accessibility

    - Add swipe-to-close gesture handling
    - Implement proper focus management and screen reader support
    - Add close button with proper touch targets
    - _Requirements: 2.4_

- [x] 8. Implement main OpportunitiesScreen component



  - [x] 8.1 Create screen structure and state management


    - Set up component with proper state for opportunities, loading, and drawer
    - Implement useEffect hooks for data fetching on mount
    - Add proper error boundary and loading state handling
    - _Requirements: 1.1, 1.3, 1.4_

  - [x] 8.2 Implement opportunities data fetching and display



    - Add fetchOpportunities call with proper error handling
    - Implement opportunities list rendering with OpportunityCard components
    - Add empty state handling for users without opportunities
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 8.3 Add pull-to-refresh functionality

    - Implement RefreshControl with proper refresh state management
    - Add refreshOpportunities method with loading indicators
    - Handle refresh errors with appropriate user feedback
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 8.4 Implement AI insights drawer integration

    - Add drawer state management and opportunity selection
    - Implement onInsightsPress handler for OpportunityCard
    - Add proper drawer opening and closing animations
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 9. Add opportunity categorization and prioritization


  - [x] 9.1 Implement opportunity grouping by category


    - Add category-based grouping logic in screen component
    - Create section headers for different opportunity categories
    - Implement proper spacing and visual separation between categories
    - _Requirements: 4.1, 4.3_

  - [x] 9.2 Add priority-based sorting within categories

    - Implement sorting logic to prioritize high-priority opportunities
    - Add visual priority indicators in opportunity cards
    - Ensure critical financial issues are prioritized appropriately
    - _Requirements: 4.2, 4.4_

- [x] 10. Implement error handling and loading states


  - [x] 10.1 Add comprehensive error handling

    - Implement error states for API failures with retry functionality
    - Add user-friendly error messages for different failure scenarios
    - Create fallback content for when opportunities cannot be generated
    - _Requirements: 1.4, 5.4_

  - [x] 10.2 Implement loading states and indicators

    - Add LoadingSpinner component during initial data fetch
    - Implement skeleton loading or progress indicators
    - Add loading states for refresh operations
    - _Requirements: 1.3, 5.2_

- [x] 11. Add comprehensive testing


  - [x] 11.1 Write unit tests for backend services


    - Create tests for GeminiProfileService with mocked API responses
    - Write tests for PerplexityOpportunityService with various user profiles
    - Add tests for OpportunityService orchestration logic
    - _Requirements: 6.2, 6.3, 6.5_

  - [x] 11.2 Write unit tests for frontend components


    - Create tests for OpportunityCard component with different opportunity types
    - Write tests for OpportunityInsightsDrawer with proper interaction testing
    - Add tests for OpportunitiesScreen with various data states
    - _Requirements: 1.1, 2.1, 2.2, 3.1_

  - [x] 11.3 Write integration tests for API endpoints


    - Create tests for opportunities API with authenticated requests
    - Write tests for questionnaire responses API with proper data validation
    - Add tests for error scenarios and edge cases
    - _Requirements: 1.4, 5.4, 6.1_

- [x] 12. Final integration and testing


  - [x] 12.1 Integrate all components in OpportunitiesScreen

    - Connect all components with proper data flow and state management
    - Test complete user journey from screen load to insights viewing
    - Verify consistent styling and behavior across all components
    - _Requirements: 1.1, 2.1, 3.1, 3.2_

  - [x] 12.2 Test with real user data and API responses


    - Test with various user profiles and questionnaire responses
    - Verify opportunity generation works with different financial situations
    - Test error handling with actual API failures and edge cases
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_


  - [x] 12.3 Performance optimization and final polish






    - Optimize API calls and implement proper caching
    - Add performance monitoring and error tracking
    - Final UI polish and accessibility improvements
    - _Requirements: 3.4, 5.1, 5.2_