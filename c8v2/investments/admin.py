from django.contrib import admin
from .models import Investment, ChartData, PriceAlert


@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'symbol', 'name', 'asset_type', 'quantity', 
        'current_price', 'total_value', 'total_gain_loss_percent', 
        'risk_level', 'recommendation', 'last_updated'
    ]
    list_filter = ['asset_type', 'risk_level', 'recommendation', 'exchange', 'created_at']
    search_fields = ['symbol', 'name', 'user__username']
    readonly_fields = [
        'total_value', 'daily_change', 'daily_change_percent',
        'total_gain_loss', 'total_gain_loss_percent', 'last_updated',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'symbol', 'name', 'asset_type', 'exchange', 'currency')
        }),
        ('Holdings', {
            'fields': ('quantity', 'average_purchase_price', 'current_price', 'total_value')
        }),
        ('Performance', {
            'fields': (
                'daily_change', 'daily_change_percent', 
                'total_gain_loss', 'total_gain_loss_percent'
            )
        }),
        ('AI Analysis', {
            'fields': ('ai_analysis', 'risk_level', 'recommendation')
        }),
        ('Metadata', {
            'fields': ('sector', 'market_cap', 'dividend_yield', 'logo_url')
        }),
        ('Timestamps', {
            'fields': ('last_updated', 'created_at', 'updated_at')
        })
    )


@admin.register(ChartData)
class ChartDataAdmin(admin.ModelAdmin):
    list_display = [
        'investment', 'date', 'open_price', 'high_price', 
        'low_price', 'close_price', 'volume'
    ]
    list_filter = ['date', 'investment__symbol']
    search_fields = ['investment__symbol', 'investment__name']
    date_hierarchy = 'date'


@admin.register(PriceAlert)
class PriceAlertAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'investment', 'alert_type', 'target_value', 
        'is_active', 'triggered_at', 'created_at'
    ]
    list_filter = ['alert_type', 'is_active', 'created_at', 'triggered_at']
    search_fields = ['user__username', 'investment__symbol']
    readonly_fields = ['triggered_at', 'created_at', 'updated_at']