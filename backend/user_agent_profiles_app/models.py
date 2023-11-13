from django.db import models
from django.contrib import admin
from django.template.defaultfilters import slugify
from .validators import compress_image
from django.conf import settings

# Create your models here.

def get_image_filename(instance, filename):
    name = instance.user_id.username
    slug = slugify(name)
    return f"avatars/{slug}-{filename}"

class UserAgentProfiles(models.Model):
    user_id = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to=get_image_filename, blank=True)
    first_name = models.TextField(max_length=32)
    last_name = models.TextField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user_id.email

    @property
    def filename(self):
        return os.path.basename(self.image.name)

    def save(self, force_insert=False, force_update=False, using=None, *args, **kwargs):

        if self.avatar:
            image = self.avatar
            if image.size > 0.3 * 1024 * 1024:
                self.avatar = compress_image(image)
        super(UserAgentProfiles, self).save(*args, **kwargs)