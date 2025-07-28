# Implementation Plan

- [x] 1. Set up backend goals app and database models


  - Create Django goals app with proper structure
  - Implement Goal model with all required fields and relationships
  - Create and run database migrations
  - _Requirements: 5.1, 5.2_



- [ ] 2. Implement backend API endpoints for goals CRUD operations
  - Create GoalSerializer and CreateGoalSerializer classes
  - Implement GoalViewSet with list, create, retrieve, update, delete actions
  - Add proper authentication and user filtering


  - Write unit tests for all API endpoints
  - _Requirements: 1.3, 5.1, 5.2, 5.3, 5.4_

- [ ] 3. Add Perplexity API integration for image generation
  - Add PERPLEXITY_API_KEY to backend .env file
  - Create PerplexityImageService class for API integration
  - Implement image generation endpoint with error handling and fallbacks
  - Add environment variable validation and logging
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 2.1, 2.2, 2.3_

- [x] 4. Update frontend API service with goals endpoints


  - Add Goal interface and related types to types/index.ts
  - Implement createGoal, fetchGoals, updateGoal, deleteGoal functions in api.ts
  - Add proper error handling and authentication headers
  - _Requirements: 1.3, 5.1, 5.2, 5.3, 5.4_

- [x] 5. Create AddGoalModal component for goal creation


  - Build modal component with form fields for title, target amount, description
  - Implement form validation with error messages matching onboarding page style
  - Add submit and cancel functionality with proper state management
  - Style modal to match existing theme from onboarding and expenses pages (colors, typography, spacing)
  - Use consistent button styles, input field designs, and modal presentation patterns
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 6. Enhance GoalsScreen to use dynamic data and integrate AddGoalModal


  - Replace static goals array with API data fetching
  - Add loading states and error handling for goals list
  - Integrate AddGoalModal with functional "Add New Goal" button
  - Implement goal creation flow with optimistic updates
  - _Requirements: 1.1, 1.3, 5.2, 2.1, 2.4_

- [x] 7. Create AIInsightsDrawer component using expenses page pattern


  - Copy drawer implementation pattern from ExpensesScreen (animations, gestures, styling)
  - Create AIInsightsDrawer component matching expenses page drawer design
  - Implement pan responder for swipe-to-close functionality with same behavior
  - Add proper backdrop and modal presentation using identical styling patterns
  - Maintain consistent drawer height, border radius, and visual elements
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 8. Integrate AIInsightsDrawer with GoalsScreen AI insights boxes


  - Make AI insights boxes clickable to open drawer
  - Pass goal-specific data to drawer component
  - Implement drawer state management in GoalsScreen
  - Add smooth animations for drawer open/close transitions
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 9. Add comprehensive error handling and loading states


  - Implement error boundaries and fallback UI components
  - Add loading spinners for API calls and image loading
  - Create toast notifications for user feedback
  - Handle network failures and API errors gracefully
  - _Requirements: 2.3, 4.3, 4.4_

- [x] 10. Write comprehensive tests for all components and functionality



  - Create unit tests for AddGoalModal form validation and submission
  - Write integration tests for goals API endpoints
  - Add tests for AIInsightsDrawer animations and interactions
  - Test error scenarios and edge cases
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2_