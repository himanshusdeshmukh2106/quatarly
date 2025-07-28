# Requirements Document

## Introduction

The Opportunities Page Enhancement feature will transform the existing placeholder opportunities screen into a comprehensive, AI-powered financial opportunities discovery system. This feature will analyze user profile data from questionnaire responses, generate personalized insights using AI, and present actionable financial opportunities through an intuitive interface that maintains consistency with the existing app design patterns.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see personalized financial opportunities based on my profile, so that I can make informed decisions to improve my financial situation.

#### Acceptance Criteria

1. WHEN the user navigates to the opportunities screen THEN the system SHALL fetch and display personalized opportunities based on their questionnaire responses
2. WHEN the user has not completed the questionnaire THEN the system SHALL display a message prompting them to complete their profile
3. WHEN opportunities are loading THEN the system SHALL display a loading spinner with appropriate messaging
4. WHEN the API fails to fetch opportunities THEN the system SHALL display an error message with retry functionality

### Requirement 2

**User Story:** As a user, I want to see AI-generated insights for each opportunity, so that I can understand why the opportunity is relevant to my situation.

#### Acceptance Criteria

1. WHEN an opportunity is displayed THEN the system SHALL show an AI insights section below each opportunity card
2. WHEN the user taps on an AI insights section THEN the system SHALL open a drawer with detailed analysis
3. WHEN the insights drawer is open THEN the system SHALL display comprehensive analysis including opportunity relevance, potential benefits, and actionable steps
4. WHEN the user swipes down on the insights drawer THEN the system SHALL close the drawer

### Requirement 3

**User Story:** As a user, I want the opportunities page to follow the same design patterns as other screens, so that I have a consistent experience throughout the app.

#### Acceptance Criteria

1. WHEN the opportunities screen loads THEN the system SHALL use the same card design patterns as the goals screen
2. WHEN displaying opportunities THEN the system SHALL use consistent typography, colors, and spacing as other screens
3. WHEN showing AI insights THEN the system SHALL use the same drawer component and styling as the goals screen
4. WHEN the user interacts with opportunities THEN the system SHALL provide the same visual feedback patterns as other screens

### Requirement 4

**User Story:** As a user, I want opportunities to be categorized and prioritized, so that I can focus on the most relevant suggestions first.

#### Acceptance Criteria

1. WHEN opportunities are displayed THEN the system SHALL group them by category (debt management, job opportunities, investment suggestions, etc.)
2. WHEN multiple opportunities exist in a category THEN the system SHALL prioritize them based on user profile urgency
3. WHEN displaying opportunity cards THEN the system SHALL show category icons and priority indicators
4. WHEN the user has critical financial issues THEN the system SHALL prioritize debt management and emergency fund opportunities

### Requirement 5

**User Story:** As a user, I want to refresh opportunities data, so that I can get updated suggestions based on any profile changes.

#### Acceptance Criteria

1. WHEN the user pulls down on the opportunities screen THEN the system SHALL refresh the opportunities data
2. WHEN refreshing THEN the system SHALL show a refresh indicator
3. WHEN refresh is complete THEN the system SHALL update the displayed opportunities
4. WHEN refresh fails THEN the system SHALL display an error message and maintain existing data

### Requirement 6

**User Story:** As a system, I want to generate user profiles using Gemini API and find opportunities using Perplexity API, so that I can provide accurate and relevant suggestions.

#### Acceptance Criteria

1. WHEN generating opportunities THEN the system SHALL fetch user questionnaire responses from the backend
2. WHEN user data is available THEN the system SHALL create a comprehensive profile prompt using Gemini API
3. WHEN the profile prompt is ready THEN the system SHALL send it to Perplexity API to find relevant opportunities
4. WHEN API responses are received THEN the system SHALL parse and format the opportunities for display
5. IF any API call fails THEN the system SHALL log the error and provide fallback content

### Requirement 7

**User Story:** As a user, I want to see different types of opportunities based on my financial situation, so that I can address my most pressing needs.

#### Acceptance Criteria

1. WHEN the user has high debt THEN the system SHALL prioritize debt consolidation and management opportunities
2. WHEN the user has low job stability THEN the system SHALL suggest job search platforms and skill development opportunities
3. WHEN the user has no emergency fund THEN the system SHALL prioritize emergency fund building strategies
4. WHEN the user has surplus income THEN the system SHALL suggest investment and wealth building opportunities
5. WHEN the user has specific goals THEN the system SHALL suggest opportunities aligned with those goals