# Generated by Django 4.2.1 on 2023-12-06 10:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('agent_app', '0002_alter_agent_id'),
        ('user_agent_profile_app', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='useragentprofile',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='useragentprofile',
            name='user_agent',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='agent_app.agent'),
        ),
    ]
