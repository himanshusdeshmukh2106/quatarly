# Throttling Configuration Fix - October 9, 2025

## 🔴 Issue: Missing Throttle Rate for dj_rest_auth

### Error Message
```
django.core.exceptions.ImproperlyConfigured: No default throttle rate set for 'dj_rest_auth' scope
ERROR "POST /api/auth/registration/ HTTP/1.1" 500 19461
```

### Root Cause
The `dj_rest_auth` package uses `ScopedRateThrottle` with a scope of `'dj_rest_auth'`, but this scope was not defined in the `DEFAULT_THROTTLE_RATES` configuration in `settings.py`.

When a user tries to register or login, the throttling middleware checks for the rate limit for the `'dj_rest_auth'` scope, but since it's not defined, it raises an `ImproperlyConfigured` exception.

---

## ✅ Fix Applied

**File:** `c8v2/C8V2/settings.py` (Lines 212-218)

**Before (Broken):**
```python
'DEFAULT_THROTTLE_RATES': {
    'anon': '100/hour',
    'user': '1000/hour',
    'burst': '60/minute',
    'sustained': '1000/day',
},
```

**After (Fixed):**
```python
'DEFAULT_THROTTLE_RATES': {
    'anon': '100/hour',
    'user': '1000/hour',
    'burst': '60/minute',
    'sustained': '1000/day',
    'dj_rest_auth': '100/hour',  # Rate limit for dj_rest_auth endpoints
},
```

---

## 📋 Complete List of Fixes

### 1. Redis Configuration Error ✅
**Issue:** `connection_pool_kwargs` not supported in Django's RedisCache  
**Fix:** Removed unsupported parameter from cache configuration  
**File:** `c8v2/C8V2/settings.py` (Lines 271-299)

### 2. Django-Allauth Deprecation Warnings ✅
**Issue:** Deprecated `ACCOUNT_USERNAME_REQUIRED` and `ACCOUNT_EMAIL_REQUIRED` settings  
**Fix:** Removed deprecated settings, using `ACCOUNT_SIGNUP_FIELDS` instead  
**File:** `c8v2/C8V2/settings.py` (Lines 241-251)

### 3. Missing Throttle Rate for dj_rest_auth ✅
**Issue:** No throttle rate defined for `'dj_rest_auth'` scope  
**Fix:** Added `'dj_rest_auth': '100/hour'` to `DEFAULT_THROTTLE_RATES`  
**File:** `c8v2/C8V2/settings.py` (Lines 212-218)

---

## 🔍 Frontend-Backend Data Flow Analysis

### Registration Flow

**Frontend (RegistrationScreen.tsx):**
```typescript
await registerUser({ 
    username, 
    email, 
    password1: password, 
    password2: password2 
});
```

**API Call (api.ts):**
```typescript
const response = await apiClient.post('/api/auth/registration/', userData);
```

**Backend Endpoint:**
- URL: `/api/auth/registration/`
- View: `dj_rest_auth.registration.views.RegisterView`
- Expected Data:
  - `username` (string)
  - `email` (string)
  - `password1` (string)
  - `password2` (string)

**Response:**
```json
{
    "key": "auth_token_here",
    "user": {
        "pk": 1,
        "username": "testuser",
        "email": "test@example.com",
        "first_name": "",
        "last_name": "",
        "onboarding_complete": false
    }
}
```

### Login Flow

**Frontend (LoginScreen.tsx):**
```typescript
await loginUser({ 
    username, 
    password 
});
```

**API Call (api.ts):**
```typescript
const response = await apiClient.post('/api/auth/login/', credentials);
```

**Backend Endpoint:**
- URL: `/api/auth/login/`
- View: `dj_rest_auth.views.LoginView`
- Expected Data:
  - `username` (string)
  - `password` (string)

**Response:**
```json
{
    "key": "auth_token_here",
    "user": {
        "pk": 1,
        "username": "testuser",
        "email": "test@example.com",
        "first_name": "",
        "last_name": "",
        "onboarding_complete": false
    }
}
```

### Questionnaire Submission Flow

**Frontend (OnboardingScreen.tsx):**
```typescript
const payload = {
    responses: [
        {
            question_id: 1,
            selected_choices: ['Option 1'],
            custom_input: null
        },
        // ... more responses
    ]
};
await submitQuestionnaire(payload, authToken);
```

**API Call (api.ts):**
```typescript
const response = await apiClient.post('/api/questionnaire/submit/', data, {
    headers: {
        Authorization: `Token ${token}`,
    },
});
```

**Backend Endpoint:**
- URL: `/api/questionnaire/submit/`
- View: `questionnaire.views.SubmitQuestionnaireView`
- Expected Data:
  ```json
  {
      "responses": [
          {
              "question_id": 1,
              "selected_choices": ["Option 1"],
              "custom_input": null
          }
      ]
  }
  ```

**Response:**
```json
{
    "detail": "Responses submitted successfully."
}
```

**Side Effect:** Sets `user.onboarding_complete = True`

---

## 🧪 Testing

### Run Configuration Tests
```bash
cd c8v2
python test_redis_fix.py
```

Expected output: All 7 tests should pass, including the new throttling check.

### Run API Endpoint Tests
```bash
cd c8v2
python test_api_endpoints.py
```

This will test:
1. User registration
2. User login
3. User profile fetch
4. Questionnaire submission (if questions exist)

### Manual Testing

1. **Start the server:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Test registration:**
   ```bash
   curl -X POST http://localhost:8000/api/auth/registration/ \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password1": "TestPass123!",
       "password2": "TestPass123!"
     }'
   ```

3. **Test login:**
   ```bash
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "password": "TestPass123!"
     }'
   ```

---

## 📊 Expected Behavior

### Before Fixes:
```
❌ Redis connection error on registration
❌ ImproperlyConfigured: No default throttle rate set for 'dj_rest_auth' scope
❌ Server returns 500 error
```

### After Fixes:
```
✅ Registration endpoint returns 201 Created
✅ Login endpoint returns 200 OK
✅ Auth token is returned in response
✅ User can complete onboarding
✅ Throttling works correctly
```

---

## 🚨 Remaining Warnings (Non-Critical)

These warnings are from the `dj_rest_auth` package itself:

```
UserWarning: app_settings.USERNAME_REQUIRED is deprecated
UserWarning: app_settings.EMAIL_REQUIRED is deprecated
```

**Impact:** None - these are deprecation warnings from the package, not errors  
**Action:** No action needed. Will be resolved when `dj_rest_auth` is updated.

---

## 📝 Summary

All critical issues have been resolved:

✅ **Redis Configuration** - Fixed unsupported parameter  
✅ **Django-Allauth** - Removed deprecated settings  
✅ **Throttling** - Added missing `dj_rest_auth` scope  
✅ **Frontend-Backend** - Data flow verified and documented  
✅ **Testing** - Comprehensive test scripts created  

The application is now ready for:
- User registration
- User login
- Onboarding questionnaire
- Full authentication flow

---

## 🚀 Next Steps

1. **Test the complete flow:**
   - Register a new user
   - Login with the user
   - Complete the onboarding questionnaire
   - Verify `onboarding_complete` is set to `True`

2. **Monitor the application:**
   - Check logs for any errors
   - Monitor Redis memory usage
   - Track API response times

3. **Optional improvements:**
   - Add more specific throttle rates for different endpoints
   - Implement rate limiting per user
   - Add monitoring and alerting

---

## 📞 Support

If you encounter any issues:

1. Check `c8v2/logs/django.log` for errors
2. Run `python test_redis_fix.py` to verify configuration
3. Run `python test_api_endpoints.py` to test API endpoints
4. Verify Redis is running: `redis-cli ping`
5. Check Django configuration: `python manage.py check`

