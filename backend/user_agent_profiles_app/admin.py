from django.contrib import admin
from .models import UserAgentProfiles

class UserAgentProfilesAdmin(admin.ModelAdmin):
    readonly_fields = ('id','updated_at','created_at')

admin.site.register(UserAgentProfiles, UserAgentProfilesAdmin)
