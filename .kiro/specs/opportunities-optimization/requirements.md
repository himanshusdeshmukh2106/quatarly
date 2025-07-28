# Requirements Document

## Introduction

This feature optimizes the opportunities system to improve performance and user experience by implementing persistent user profiles, synchronous refresh operations, removing unnecessary notifications, and consolidating image URL generation with opportunity creation.

## Requirements

### Requirement 1

**User Story:** As a system, I want to store user profiles persistently in the database, so that I don't need to regenerate profiles on every opportunity request.

#### Acceptance Criteria

1. WHEN a user's questionnaire responses are processed THEN the system SHALL generate a user profile using Gemini API and store it in the database
2. WHEN generating opportunities THEN the system SHALL use the stored profile instead of calling Gemini API again
3. WHEN user questionnaire responses are updated THEN the system SHALL regenerate and update the stored profile
4. WHEN the stored profile is older than 7 days THEN the system SHALL automatically regenerate it

### Requirement 2

**User Story:** As a user, I want opportunity refresh to be synchronous and immediate, so that I get updated opportunities without background processing delays.

#### Acceptance Criteria

1. WHEN the user requests to refresh opportunities THEN the system SHALL delete existing opportunities and generate new ones synchronously
2. WHEN refresh is complete THEN the system SHALL return the new opportunities immediately
3. WHEN refresh fails THEN the system SHALL return an appropriate error message
4. WHEN opportunities are being refreshed THEN the system SHALL NOT use background/async processing

### Requirement 3

**User Story:** As a user, I want a clean interface without unnecessary notifications, so that I'm not interrupted by toast messages about opportunity status.

#### Acceptance Criteria

1. WHEN opportunities are loaded THEN the system SHALL NOT show "opportunities loaded" toast messages
2. WHEN opportunities are refreshed THEN the system SHALL NOT show "refreshing opportunities" toast messages
3. WHEN opportunities are generated THEN the system SHALL NOT show "new opportunities found" toast messages
4. WHEN there are errors THEN the system SHALL still show error messages for user awareness

### Requirement 4

**User Story:** As a system, I want to generate image URLs together with opportunities, so that I reduce API calls and improve performance.

#### Acceptance Criteria

1. WHEN requesting opportunities from Perplexity API THEN the system SHALL include image URL generation in the same prompt
2. WHEN parsing opportunity responses THEN the system SHALL extract both opportunity data and image URLs together
3. WHEN image URLs are not provided by the API THEN the system SHALL use category-based fallback images
4. WHEN opportunities are created THEN the system SHALL NOT make separate API calls for images

### Requirement 5

**User Story:** As a developer, I want a simplified caching strategy, so that the system is more predictable and maintainable.

#### Acceptance Criteria

1. WHEN opportunities are requested THEN the system SHALL check for existing opportunities in the database first
2. WHEN opportunities exist and are less than 1 hour old THEN the system SHALL return them without regeneration
3. WHEN opportunities are older than 1 hour OR user explicitly refreshes THEN the system SHALL regenerate them
4. WHEN opportunities are regenerated THEN the system SHALL clear the old ones and create new ones

### Requirement 6

**User Story:** As a system, I want to optimize the Perplexity API usage, so that I get both opportunities and images in a single efficient call.

#### Acceptance Criteria

1. WHEN calling Perplexity API THEN the system SHALL use an enhanced prompt that requests both opportunity details and relevant image URLs
2. WHEN parsing the API response THEN the system SHALL extract structured data including image URLs
3. WHEN image URLs are missing or invalid THEN the system SHALL use high-quality fallback images based on opportunity category
4. WHEN opportunities are saved THEN the system SHALL include the image URLs in the database records