from django.db import models
from djangotoolbox.fields import DictField, ListField
from usermgmt.models import CAUsers
import json


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class Courses(BaseModel):
    course_name_english     = models.CharField(max_length=50)
    display_name_dictionary = DictField()
    def __str__(self):
        return json.dumps({'id':self.id,'name':self.course_name_english})
