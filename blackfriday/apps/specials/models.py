from django.db import models


class Special(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    document = models.FileField(upload_to='specials')

    def __str__(self):
        return self.name
