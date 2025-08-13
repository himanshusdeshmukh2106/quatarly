# Optimized Goals Feature Documentation

## Overview
The goals feature focuses on generating high-quality, specific images using an optimized Perplexity Sonar API approach with minimal API calls and efficient URL testing.

## Features

### 1. Optimized Image Generation
- **Single API Call**: Gets 2-3 image URLs in one API request (minimizes API usage)
- **Parallel Testing**: Tests multiple URLs concurrently for fastest response
- **First Working URL**: Returns immediately when first accessible URL is found
- **Focused Search**: Uses only title, description, and category for precise matching
- **High-Quality Results**: Searches Google Images and other sources for exact matches
- **Specific Examples**: 
  - "XUV700" → Actual XUV700 car image
  - "European Vacation" → Beautiful Europe travel image
  - "iPhone 15 Pro" → Actual iPhone 15 Pro image
- **Multiple Sources**: Searches across Google Images, Unsplash, Pexels, etc.
- **Fast Validation**: Optimized URL validation with reduced timeouts
- **Smart Fallbacks**: Falls back to category-based default images if no valid URL found

### 2. AI Insights (Disabled)
- **Infrastructure Maintained**: All endpoints and UI remain functional
- **Feature Disabled**: Insights generation returns empty string
- **Controlled Elsewhere**: Feature control managed by external system

## API Endpoints

### Active Endpoints
- `POST /api/goals/` - Create goal (generates specific image only)
- `POST /api/goals/{id}/generate_image/` - Generate new specific image
- `POST /api/goals/{id}/refresh_ai_content/` - Refresh image only

### Maintained Endpoints (Disabled Features)
- `POST /api/goals/{id}/generate_insights/` - Returns without generating insights

## Service Class: PerplexityGoalService

### Methods

#### `generate_goal_image(goal_data: dict) -> str`
Generates specific, high-quality image URL using simplified goal context.

**Parameters:**
```python
goal_data = {
    'title': str,        # e.g., "XUV700", "European Vacation"
    'description': str,  # Brief description
    'category': str      # Goal category
}
```

#### `generate_goal_insights(goal_data: dict) -> str`
**DISABLED** - Returns empty string. Infrastructure maintained for future use.

#### `_validate_image_url(url: str) -> bool`
Validates that an image URL is accessible and returns an actual image.

## Configuration

Requires `PERPLEXITY_API_KEY` environment variable to be set. Falls back to default placeholder images if not configured.

## Example Usage

```python
from goals.services import PerplexityGoalService

# Simplified goal data
goal_data = {
    'title': 'XUV700',
    'description': 'Saving for a new Mahindra XUV700 SUV',
    'category': 'car'
}

service = PerplexityGoalService()
image_url = service.generate_goal_image(goal_data)  # Gets specific XUV700 image
insights = service.generate_goal_insights(goal_data)  # Returns empty (disabled)
```

## Benefits

1. **Minimal API Calls**: Single API call gets multiple image options (cost-effective)
2. **Fast Response**: Parallel URL testing returns first working image immediately
3. **High Success Rate**: Multiple URL options increase chance of finding working image
4. **Specific Images**: Gets exact images for specific items/goals mentioned
5. **High Quality**: Focuses on professional, high-resolution images
6. **Efficient Performance**: Optimized timeouts and concurrent processing
7. **Clean Architecture**: Disabled features maintain infrastructure without overhead
8. **Reliable Fallbacks**: Graceful degradation when API is unavailable

## Key Changes

- **Optimized API Usage**: Single call gets 2-3 image URLs instead of multiple calls
- **Parallel Processing**: Concurrent URL testing for faster validation
- **Simplified Input**: Only uses title, description, and category (no amounts)
- **Specific Focus**: Searches for exact matches rather than general financial images
- **Disabled Insights**: AI insights generation turned off but infrastructure preserved
- **Google Images**: Explicitly searches Google Images for better specific results
- **Fast Timeouts**: Reduced validation timeouts for quicker responses

## Backward Compatibility

The `PerplexityImageService` class name is maintained as an alias for backward compatibility.