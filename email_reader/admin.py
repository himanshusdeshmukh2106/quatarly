from django.contrib import admin
from .models import EmailAccount, Transaction

@admin.register(EmailAccount)
class EmailAccountAdmin(admin.ModelAdmin):
    list_display = ('user', 'email', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('email', 'user__username')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'merchant', 'amount', 'transaction_date', 'payment_method')
    list_filter = ('payment_method', 'currency')
    search_fields = ('merchant', 'transaction_id', 'user__username')
    date_hierarchy = 'transaction_date' 