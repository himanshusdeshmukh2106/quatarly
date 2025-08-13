from django.contrib import admin
from .models import SmsMessage


@admin.register(SmsMessage)
class SmsMessageAdmin(admin.ModelAdmin):
    list_display = ("user", "sender", "received_at", "is_processed")
    search_fields = ("sender", "body")
    list_filter = ("is_processed",)
    raw_id_fields = ("user",) 