from django.db import models
from djangotoolbox.fields import DictField, ListField
from usermgmt.models import CAUsers

import json

# Create your models here.

class FileUpload(models.Model):
    initial_file_name       = models.CharField(max_length=200)
    final_file_name         = models.CharField(max_length=200)
    file_path               = models.CharField(max_length=200)
    uploaded_at             = models.DateTimeField()
    file_type               = models.CharField(max_length=200)
    created_by              = models.ForeignKey(CAUsers,
                                on_delete=models.SET_NULL,
                                null=True)
    def __str__(self):
        return json.dumps({'id':self.id,'file_path':self.file_path})


class UnaAcademyEducators(models.Model):
    username = models.CharField(max_length=200)
    first_name= models.CharField(max_length=200)
    bio= models.CharField(max_length=500)
    last_name=  models.CharField(max_length=200)
    avatar= models.CharField(max_length=200)
    followers_count=  models.IntegerField()
    is_following =  models.BooleanField()
    permalink = models.CharField(max_length=200)
    uid = models.CharField(max_length=200)
    courses_count=  models.IntegerField()
    is_educator=  models.BooleanField()
    is_verified_educator=  models.BooleanField()
    avg_rating= models.FloatField()
