"""
URL configuration for C8V2 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from .health import health_check, readiness_check, liveness_check

urlpatterns = [
    # Health check endpoints (for monitoring and load balancers)
    path('health/', health_check, name='health_check'),
    path('health/ready/', readiness_check, name='readiness_check'),
    path('health/live/', liveness_check, name='liveness_check'),

    # Admin
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/questionnaire/', include('questionnaire.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/sms/', include('sms.urls')),
    path('api/email/', include('email_reader.urls')),
    path('api/opportunities/', include('opportunities.urls')),
    path('api/', include('goals.urls')),
    path('api/', include('investments.urls')),
]
