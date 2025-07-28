# Requirements Document

## Introduction

This feature enhances the existing Goals page by making the "Add New Goal" button functional and integrating AI-powered placeholder images from the Perplexity API. Additionally, it implements an interactive drawer interface for AI insights similar to the existing expenses page pattern.

## Requirements

### Requirement 1

**User Story:** As a user, I want to add new financial goals through a functional "Add New Goal" button, so that I can track multiple savings objectives.

#### Acceptance Criteria

1. WHEN the user taps the "Add New Goal" button THEN the system SHALL display a goal creation form
2. WHEN the user fills out goal details (title, target amount, optional description) THEN the system SHALL validate the input data
3. WHEN the user submits a valid goal THEN the system SHALL save the goal to the backend and refresh the goals list
4. WHEN the user cancels goal creation THEN the system SHALL dismiss the form without saving

### Requirement 2

**User Story:** As a user, I want my goals to have relevant placeholder images automatically generated, so that my goals are visually appealing and contextually appropriate.

#### Acceptance Criteria

1. WHEN a new goal is created THEN the system SHALL request a relevant placeholder image from the Perplexity API based on the goal title
2. WHEN the Perplexity API returns an image URL THEN the system SHALL use it as the goal's header image
3. IF the Perplexity API fails or returns no image THEN the system SHALL use a default placeholder image
4. WHEN displaying existing goals THEN the system SHALL show the stored image URL or fetch a new one if none exists

### Requirement 3

**User Story:** As a user, I want to interact with AI insights through a drawer interface, so that I can get detailed analysis and recommendations for my goals.

#### Acceptance Criteria

1. WHEN the user taps on an AI insights box THEN the system SHALL open a bottom drawer similar to the expenses page
2. WHEN the drawer opens THEN the system SHALL display detailed AI analysis and recommendations for that specific goal
3. WHEN the user swipes down or taps outside the drawer THEN the system SHALL close the drawer with smooth animation
4. WHEN the drawer is open THEN the system SHALL allow scrolling through the AI insights content

### Requirement 4

**User Story:** As a developer, I want the Perplexity API key to be securely configured in the backend environment, so that the image generation feature works reliably.

#### Acceptance Criteria

1. WHEN the backend starts THEN the system SHALL load the Perplexity API key from environment variables
2. WHEN making requests to Perplexity API THEN the system SHALL include proper authentication headers
3. IF the API key is missing THEN the system SHALL log an error and use default placeholder images
4. WHEN the API request fails THEN the system SHALL handle errors gracefully and fallback to default images

### Requirement 5

**User Story:** As a user, I want my goals data to persist across app sessions, so that I don't lose my financial tracking progress.

#### Acceptance Criteria

1. WHEN a goal is created THEN the system SHALL store it in the backend database
2. WHEN the goals page loads THEN the system SHALL fetch all user goals from the backend API
3. WHEN a goal is updated THEN the system SHALL sync changes to the backend
4. WHEN the user deletes a goal THEN the system SHALL remove it from both local state and backend storage