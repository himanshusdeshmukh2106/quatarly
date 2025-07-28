# Design Document

## Overview

This design enhances the existing Goals page by implementing three key features:
1. A functional "Add New Goal" button with form interface
2. Integration with Perplexity API for automatic placeholder image generation
3. An interactive bottom drawer for AI insights similar to the expenses page pattern

The design leverages the existing React Native architecture, Django backend, and follows established patterns from the expenses page drawer implementation.

## Architecture

### Frontend Architecture
- **React Native Components**: Enhanced GoalsScreen with modal forms and drawer components
- **State Management**: Local React state for UI interactions, API calls for data persistence
- **Navigation**: Modal presentations for goal creation, animated drawer for AI insights
- **API Integration**: Extended API service with new goal-related endpoints

### Backend Architecture
- **Django App**: New `goals` app with models, views, and serializers
- **Database**: PostgreSQL with new goals table linked to users
- **External API**: Perplexity API integration for image generation
- **Environment**: Secure API key management through environment variables

## Components and Interfaces

### Frontend Components

#### 1. Enhanced GoalsScreen
```typescript
interface GoalsScreenState {
  goals: Goal[];
  loading: boolean;
  showAddGoalModal: boolean;
  selectedGoalForInsights: Goal | null;
  showInsightsDrawer: boolean;
}
```

#### 2. AddGoalModal Component
```typescript
interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (goalData: CreateGoalRequest) => void;
}

interface GoalFormData {
  title: string;
  targetAmount: number;
  description?: string;
  category?: string;
}
```

#### 3. AIInsightsDrawer Component
```typescript
interface AIInsightsDrawerProps {
  visible: boolean;
  goal: Goal;
  onClose: () => void;
}
```

### Backend Models

#### Goal Model
```python
class Goal(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    image_url = models.URLField(blank=True)
    ai_analysis = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### API Endpoints

#### Goals API
- `GET /api/goals/` - List user goals
- `POST /api/goals/` - Create new goal
- `GET /api/goals/{id}/` - Get specific goal
- `PUT /api/goals/{id}/` - Update goal
- `DELETE /api/goals/{id}/` - Delete goal
- `POST /api/goals/{id}/generate-image/` - Generate placeholder image

#### Perplexity Integration
- Internal service for image generation based on goal titles
- Fallback to default placeholder images on API failures

## Data Models

### Frontend Types
```typescript
interface Goal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  description?: string;
  category?: string;
  image: string; // URL
  logo: string; // bank logo URL
  aiAnalysis: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateGoalRequest {
  title: string;
  target_amount: number;
  description?: string;
  category?: string;
}

interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  current_amount?: number;
}
```

### Backend Serializers
```python
class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['id', 'title', 'target_amount', 'current_amount', 
                 'description', 'category', 'image_url', 'ai_analysis',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'ai_analysis']

class CreateGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['title', 'target_amount', 'description', 'category']
```

## Error Handling

### Frontend Error Handling
1. **Network Errors**: Display toast messages for API failures
2. **Validation Errors**: Show inline form validation messages
3. **Image Loading**: Fallback to default images when URLs fail
4. **Drawer Gestures**: Prevent crashes during swipe animations

### Backend Error Handling
1. **Perplexity API Failures**: Log errors and use default placeholder images
2. **Database Errors**: Return appropriate HTTP status codes with error messages
3. **Authentication**: Ensure all endpoints require valid user tokens
4. **Input Validation**: Validate goal data before saving

### Perplexity API Integration
```python
class PerplexityImageService:
    def generate_goal_image(self, goal_title: str) -> str:
        """
        Generate placeholder image URL based on goal title
        Returns default image URL on failure
        """
        try:
            # API call to Perplexity for image generation
            response = self.call_perplexity_api(goal_title)
            return response.get('image_url', self.get_default_image())
        except Exception as e:
            logger.error(f"Perplexity API error: {e}")
            return self.get_default_image()
```

## Testing Strategy

### Frontend Testing
1. **Component Tests**: Test goal creation form validation and submission
2. **Integration Tests**: Test API calls and state management
3. **UI Tests**: Test drawer animations and modal interactions
4. **Error Scenarios**: Test network failures and invalid inputs

### Backend Testing
1. **Model Tests**: Test Goal model validation and relationships
2. **API Tests**: Test all CRUD operations for goals endpoints
3. **Service Tests**: Test Perplexity API integration with mocked responses
4. **Authentication Tests**: Ensure proper user isolation for goals

### End-to-End Testing
1. **Goal Creation Flow**: Test complete flow from button tap to goal display
2. **Image Generation**: Test automatic image assignment for new goals
3. **AI Insights Drawer**: Test drawer opening, scrolling, and closing
4. **Data Persistence**: Test goals persist across app restarts

## Implementation Approach

### Phase 1: Backend Foundation
1. Create Django goals app with models and migrations
2. Implement basic CRUD API endpoints
3. Add Perplexity API integration service
4. Set up environment configuration for API key

### Phase 2: Frontend Core Features
1. Enhance GoalsScreen with dynamic data loading
2. Implement AddGoalModal with form validation
3. Update API service with goal endpoints
4. Add error handling and loading states

### Phase 3: AI Insights Drawer
1. Create AIInsightsDrawer component using expenses page pattern
2. Implement gesture handling and animations
3. Integrate with goal-specific AI analysis
4. Add smooth open/close transitions

### Phase 4: Polish and Testing
1. Add comprehensive error handling
2. Implement loading states and optimistic updates
3. Add form validation and user feedback
4. Test all user flows and edge cases

## Security Considerations

1. **API Key Security**: Store Perplexity API key in environment variables only
2. **User Authorization**: Ensure users can only access their own goals
3. **Input Validation**: Sanitize all user inputs on both frontend and backend
4. **Rate Limiting**: Implement rate limiting for goal creation and image generation
5. **HTTPS**: Ensure all API communications use HTTPS in production