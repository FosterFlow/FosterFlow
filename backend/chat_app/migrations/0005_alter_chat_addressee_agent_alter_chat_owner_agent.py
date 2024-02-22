# Generated by Django 4.2.1 on 2024-02-22 13:54

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('agent_app', '0001_initial'),
        ('chat_app', '0004_remove_messages, rename addressee_id and owner_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='chat',
            name='addressee_agent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='addressee_agent_chats', to='agent_app.agent'),
        ),
        migrations.AlterField(
            model_name='chat',
            name='owner_agent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='owner_agent_chats', to='agent_app.agent'),
        ),
    ]
