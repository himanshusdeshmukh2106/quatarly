# Generated migration for adding performance indexes

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('investments', '0003_alter_investment_unique_together_and_more'),
    ]

    operations = [
        # Add indexes for common query patterns
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_investment_user_asset_type ON investments_investment(user_id, asset_type);",
            reverse_sql="DROP INDEX IF EXISTS idx_investment_user_asset_type;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_investment_user_created_at ON investments_investment(user_id, created_at DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_investment_user_created_at;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_investment_symbol_asset_type ON investments_investment(symbol, asset_type);",
            reverse_sql="DROP INDEX IF EXISTS idx_investment_symbol_asset_type;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_investment_data_enriched ON investments_investment(data_enriched, enrichment_attempted);",
            reverse_sql="DROP INDEX IF EXISTS idx_investment_data_enriched;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_investment_last_updated ON investments_investment(last_updated DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_investment_last_updated;"
        ),
        
        # Add indexes for ChartData model
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_chartdata_investment_date ON investments_chartdata(investment_id, date DESC);",
            reverse_sql="DROP INDEX IF EXISTS idx_chartdata_investment_date;"
        ),
        
        # Add indexes for PriceAlert model
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_pricealert_user_active ON investments_pricealert(user_id, is_active);",
            reverse_sql="DROP INDEX IF EXISTS idx_pricealert_user_active;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_pricealert_triggered ON investments_pricealert(triggered_at) WHERE triggered_at IS NULL;",
            reverse_sql="DROP INDEX IF EXISTS idx_pricealert_triggered;"
        ),
    ]