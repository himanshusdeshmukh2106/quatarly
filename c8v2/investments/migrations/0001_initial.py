# Generated migration for investments app

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Investment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('symbol', models.CharField(max_length=20)),
                ('name', models.CharField(max_length=200)),
                ('asset_type', models.CharField(choices=[('stock', 'Stock'), ('etf', 'ETF'), ('mutual_fund', 'Mutual Fund'), ('crypto', 'Cryptocurrency'), ('bond', 'Bond')], default='stock', max_length=20)),
                ('exchange', models.CharField(max_length=50)),
                ('currency', models.CharField(default='USD', max_length=3)),
                ('quantity', models.DecimalField(decimal_places=4, max_digits=15, validators=[django.core.validators.MinValueValidator(0)])),
                ('average_purchase_price', models.DecimalField(decimal_places=4, max_digits=15, validators=[django.core.validators.MinValueValidator(0)])),
                ('current_price', models.DecimalField(decimal_places=4, default=0, max_digits=15)),
                ('total_value', models.DecimalField(decimal_places=2, default=0, max_digits=15)),
                ('daily_change', models.DecimalField(decimal_places=4, default=0, max_digits=15)),
                ('daily_change_percent', models.DecimalField(decimal_places=4, default=0, max_digits=8)),
                ('total_gain_loss', models.DecimalField(decimal_places=2, default=0, max_digits=15)),
                ('total_gain_loss_percent', models.DecimalField(decimal_places=4, default=0, max_digits=8)),
                ('chart_data', models.JSONField(blank=True, default=list)),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('ai_analysis', models.TextField(blank=True, null=True)),
                ('risk_level', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium', max_length=10)),
                ('recommendation', models.CharField(choices=[('buy', 'Buy'), ('hold', 'Hold'), ('sell', 'Sell')], default='hold', max_length=10)),
                ('logo_url', models.URLField(blank=True, null=True)),
                ('sector', models.CharField(blank=True, max_length=100, null=True)),
                ('market_cap', models.DecimalField(blank=True, decimal_places=2, max_digits=20, null=True)),
                ('dividend_yield', models.DecimalField(blank=True, decimal_places=4, max_digits=8, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='investments', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='PriceAlert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('alert_type', models.CharField(choices=[('above', 'Price Above'), ('below', 'Price Below'), ('change_percent', 'Percentage Change')], max_length=20)),
                ('target_value', models.DecimalField(decimal_places=4, max_digits=15)),
                ('is_active', models.BooleanField(default=True)),
                ('triggered_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('investment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alerts', to='investments.investment')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='price_alerts', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ChartData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('open_price', models.DecimalField(decimal_places=4, max_digits=15)),
                ('high_price', models.DecimalField(decimal_places=4, max_digits=15)),
                ('low_price', models.DecimalField(decimal_places=4, max_digits=15)),
                ('close_price', models.DecimalField(decimal_places=4, max_digits=15)),
                ('volume', models.BigIntegerField(default=0)),
                ('timestamp', models.BigIntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('investment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='historical_data', to='investments.investment')),
            ],
            options={
                'ordering': ['date'],
            },
        ),
        migrations.AddConstraint(
            model_name='investment',
            constraint=models.UniqueConstraint(fields=('user', 'symbol'), name='unique_user_symbol'),
        ),
        migrations.AddConstraint(
            model_name='chartdata',
            constraint=models.UniqueConstraint(fields=('investment', 'date'), name='unique_investment_date'),
        ),
    ]