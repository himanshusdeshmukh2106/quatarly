from django.contrib import admin
from .models import Goal


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'target_amount', 'current_amount', 'progress_percentage', 'created_at']
    list_filter = ['category', 'created_at', 'updated_at']
    search_fields = ['title', 'user__username', 'description']
    readonly_fields = ['created_at', 'updated_at', 'progress_percentage']
    
    fieldsets = (
        (None, {
            'fields': ('user', 'title', 'description', 'category')
        }),
        ('Financial Details', {
            'fields': ('target_amount', 'current_amount', 'progress_percentage')
        }),
        ('Media & AI', {
            'fields': ('image_url', 'ai_analysis')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )