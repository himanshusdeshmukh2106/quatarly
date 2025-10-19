# Generated migration for new opportunities system models

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('opportunities', '0003_userprofile_opportunity_profile_and_more'),
    ]

    operations = [
        # OpportunityCache
        migrations.CreateModel(
            name='OpportunityCache',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=300)),
                ('description', models.TextField()),
                ('category', models.CharField(choices=[('travel', 'Travel'), ('job', 'Job'), ('investment', 'Investment')], db_index=True, max_length=50)),
                ('sub_category', models.CharField(blank=True, choices=[('flight', 'Flight Deals'), ('hotel', 'Hotel Deals'), ('vacation_package', 'Vacation Packages'), ('full_time', 'Full Time Job'), ('remote', 'Remote Job'), ('freelance', 'Freelance'), ('stock', 'Stock'), ('ipo', 'IPO'), ('mutual_fund', 'Mutual Fund'), ('bond', 'Bond')], max_length=50)),
                ('source_url', models.URLField(max_length=500)),
                ('image_url', models.URLField(blank=True, max_length=500)),
                ('logo_url', models.URLField(blank=True, max_length=500)),
                ('offer_details', models.JSONField(default=dict)),
                ('target_profile', models.JSONField(default=dict, help_text='Profile characteristics this opportunity targets (income_range, location, goals, etc.)')),
                ('cluster_key', models.CharField(db_index=True, help_text="Cluster key for grouping similar users (e.g., 'income_50k-100k_investment_mumbai_25-35')", max_length=100)),
                ('content_hash', models.CharField(db_index=True, help_text='SHA-256 hash of content for deduplication', max_length=64, unique=True)),
                ('fetched_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField(db_index=True)),
                ('is_active', models.BooleanField(db_index=True, default=True)),
                ('shown_count', models.IntegerField(default=0, help_text='Number of times shown to users')),
                ('click_count', models.IntegerField(default=0, help_text='Number of times clicked by users')),
                ('conversion_rate', models.FloatField(default=0.0, help_text='Click-through rate')),
                ('priority', models.CharField(choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')], default='medium', max_length=10)),
                ('relevance_base_score', models.FloatField(default=0.5, help_text='Base relevance score (0.0-1.0) before personalization')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'opportunity_cache',
                'ordering': ['-fetched_at'],
            },
        ),
        
        # UserShownOpportunity
        migrations.CreateModel(
            name='UserShownOpportunity',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('opportunity_hash', models.CharField(db_index=True, help_text='Content hash of the opportunity', max_length=64)),
                ('opportunity_title', models.CharField(help_text='For reference', max_length=300)),
                ('shown_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('clicked', models.BooleanField(default=False)),
                ('clicked_at', models.DateTimeField(blank=True, null=True)),
                ('dismissed', models.BooleanField(default=False)),
                ('dismissed_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='shown_opportunities', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'user_shown_opportunities',
                'ordering': ['-shown_at'],
                'unique_together': {('user', 'opportunity_hash')},
            },
        ),
        
        # UserProfileVector
        migrations.CreateModel(
            name='UserProfileVector',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('embedding', models.JSONField(help_text='Semantic vector representation of user profile (768-dimensional)')),
                ('embedding_model', models.CharField(default='gemini-2.5-flash', help_text='Model used for embedding generation', max_length=50)),
                ('cluster_key', models.CharField(db_index=True, help_text='Cluster identifier for grouping similar users', max_length=100)),
                ('similar_users', models.JSONField(default=list, help_text='List of user IDs with similar profiles (top 10)')),
                ('similarity_scores', models.JSONField(default=dict, help_text='Mapping of user_id -> similarity_score for similar users')),
                ('characteristics', models.JSONField(default=dict, help_text='{\n            \'income_bracket\': \'50k-100k\',\n            \'age_group\': \'25-35\',\n            \'location\': \'mumbai\',\n            \'goals\': [\'investment\', \'savings\'],\n            \'risk_tolerance\': \'medium\',\n            \'interests\': [\'stocks\', \'travel\']\n        }')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile_vector', to=settings.AUTH_USER_MODEL)),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vectors', to='opportunities.userprofile')),
            ],
            options={
                'db_table': 'user_profile_vectors',
            },
        ),
        
        # OpportunityFetchLog
        migrations.CreateModel(
            name='OpportunityFetchLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fetch_type', models.CharField(choices=[('scheduled', 'Scheduled Background Task'), ('manual', 'Manual Refresh'), ('on_demand', 'On-Demand User Request')], max_length=20)),
                ('cluster_key', models.CharField(blank=True, max_length=100)),
                ('category', models.CharField(blank=True, max_length=50)),
                ('status', models.CharField(choices=[('success', 'Success'), ('partial', 'Partial Success'), ('failed', 'Failed')], max_length=20)),
                ('opportunities_fetched', models.IntegerField(default=0)),
                ('opportunities_cached', models.IntegerField(default=0)),
                ('duplicates_filtered', models.IntegerField(default=0)),
                ('duration_ms', models.IntegerField(help_text='Duration in milliseconds')),
                ('api_calls', models.IntegerField(default=0, help_text='Number of API calls made')),
                ('error_message', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'opportunity_fetch_logs',
                'ordering': ['-created_at'],
            },
        ),
        
        # ClusterStatistics
        migrations.CreateModel(
            name='ClusterStatistics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cluster_key', models.CharField(db_index=True, max_length=100, unique=True)),
                ('user_count', models.IntegerField(default=0)),
                ('active_user_count', models.IntegerField(default=0, help_text='Users active in last 7 days')),
                ('cached_opportunities', models.IntegerField(default=0)),
                ('expired_opportunities', models.IntegerField(default=0)),
                ('avg_click_rate', models.FloatField(default=0.0)),
                ('total_opportunities_shown', models.IntegerField(default=0)),
                ('total_opportunities_clicked', models.IntegerField(default=0)),
                ('last_fetch_at', models.DateTimeField(blank=True, null=True)),
                ('next_fetch_at', models.DateTimeField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'cluster_statistics',
                'verbose_name_plural': 'Cluster statistics',
                'ordering': ['-active_user_count'],
            },
        ),
        
        # Indexes
        migrations.AddIndex(
            model_name='opportunitycache',
            index=models.Index(fields=['cluster_key', 'expires_at', 'is_active'], name='opportunity_cluster_idx'),
        ),
        migrations.AddIndex(
            model_name='opportunitycache',
            index=models.Index(fields=['category', 'sub_category', 'expires_at'], name='opportunity_category_idx'),
        ),
        migrations.AddIndex(
            model_name='opportunitycache',
            index=models.Index(fields=['is_active', 'expires_at'], name='opportunity_active_idx'),
        ),
        migrations.AddIndex(
            model_name='usershownopportunity',
            index=models.Index(fields=['user', 'shown_at'], name='user_shown_user_idx'),
        ),
        migrations.AddIndex(
            model_name='usershownopportunity',
            index=models.Index(fields=['opportunity_hash', 'shown_at'], name='user_shown_hash_idx'),
        ),
        migrations.AddIndex(
            model_name='usershownopportunity',
            index=models.Index(fields=['user', 'clicked'], name='user_shown_clicked_idx'),
        ),
        migrations.AddIndex(
            model_name='userprofilevector',
            index=models.Index(fields=['cluster_key'], name='profile_vec_cluster_idx'),
        ),
        migrations.AddIndex(
            model_name='userprofilevector',
            index=models.Index(fields=['updated_at'], name='profile_vec_updated_idx'),
        ),
        migrations.AddIndex(
            model_name='opportunityfetchlog',
            index=models.Index(fields=['created_at'], name='fetch_log_created_idx'),
        ),
        migrations.AddIndex(
            model_name='opportunityfetchlog',
            index=models.Index(fields=['status', 'fetch_type'], name='fetch_log_status_idx'),
        ),
        migrations.AddIndex(
            model_name='opportunityfetchlog',
            index=models.Index(fields=['cluster_key'], name='fetch_log_cluster_idx'),
        ),
    ]
