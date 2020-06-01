from django.db import models
from djangotoolbox.fields import DictField, ListField
from usermgmt.models import CAUsers
from coursemgmt.models import Courses

import json
# To Do

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class PercentileTables(models.Model):
    table_name  = models.CharField(max_length=30)
    table       = ListField(DictField())
    def __str__(self):
        return json.dumps({'id':self.id,'table_name':self.table_name})

class TestFolder(BaseModel):
    folder_name = models.CharField(max_length=100)
    description  = models.CharField(max_length=300,null=True)
    def __str__(self):
        return json.dumps({'id':self.id,'folder_name':self.folder_name})

class TestCategory(BaseModel):
    category     = models.CharField(max_length=50)
    # Overall/Sectional
    sub_category = models.CharField(max_length=50)
    description  = models.CharField(max_length=300,null=True)
    def __str__(self):
        return json.dumps({'id':self.id,'category':self.category,'sub_category':self.sub_category})

# Genric Profile of Test
class TestStructure(BaseModel):
    is_section_sequence_choose  = models.BooleanField(default=True) 
    is_sectional_jump           = models.BooleanField(default=False)
    time_calculation            = models.CharField(max_length=20,default="sectional",null=True)
    total_time                  = models.IntegerField(null=True)
    # sectional/overall
    is_question_jump            = models.BooleanField(default=False)
    is_pausable                 = models.BooleanField(default=True)
    timer_type                  = models.CharField(max_length=20,default="elapsed",null=True)

    # remaining / elapsed
    interface_type              = models.CharField(max_length=50,default="general",null=True)
    # general/nmat
    num_options_mcq             = models.IntegerField(default=4,null=True)
    is_blank_negative           = models.BooleanField(default=False)
    blank_negative_type         = models.CharField(max_length=10,null=True)
    # sectional/overall     
    num_blank_allowed           = models.IntegerField(null=True)
    blank_negative_marks        = models.FloatField(null=True)   
    test_cutoff                 = models.FloatField(default=0,null=True)
    percentile_table            = models.ForeignKey(PercentileTables,
                                    on_delete=models.SET_NULL,
                                    null=True)
    
    instructions                = ListField()
    test_analysis               = models.CharField(max_length=500,null=True)
    # sections_list               = ListField()  
    class Meta:
        abstract= True


class Tests(TestStructure):
    test_name               = models.CharField(max_length=100)
    is_live                 = models.BooleanField(default=False)
    scheduled_for           = models.DateField()
    category                = models.ForeignKey(TestCategory,
                                    on_delete=models.SET_NULL,
                                    null=True)
    courses                 = ListField()

    comments                = models.CharField(max_length=200,null=True)
    folder                  = models.ForeignKey(TestFolder,
                                                on_delete=models.SET_NULL,
                                                null = True)
    created_by              = models.ForeignKey(CAUsers,
                                                on_delete=models.SET_NULL,
                                                null=True)

    
    def __str__(self):
        if self.folder:
            path_out = '/testengine/adminpanel/test-bank/' + self.folder.folder_name + '/' + self.test_name + '/'
        else:
            path_out = '/testengine/adminpanel/test-bank/allbanks/' + self.test_name  + '/'
        return json.dumps({'id':self.id,
                        'test_name':self.test_name,
                        'is_blank_negative':self.is_blank_negative,
                        'time_calculation':self.time_calculation,
                        'blank_negative_type':self.blank_negative_type,
                        'is_live':self.is_live,
                        'path':path_out
                        })
    
# Generic Profile of section
class SectionStructure(BaseModel):
    # number_questions        = models.IntegerField()
    section_time            = models.IntegerField(null=True)
    
    # Blank Marks Handling
    num_blank_allowed       = models.IntegerField(null=True)
    blank_negative_marks    = models.FloatField(null=True)    
    instructions            = ListField()      
    is_complete             = models.BooleanField(default=False)             
    is_eval_manual          = models.BooleanField(default=False)
    is_calculator           = models.BooleanField(default=False)
    section_cutoff          = models.FloatField(default=0,null=True)
    
    class Meta:
        abstract = True

class Sections(SectionStructure):
    name                    = models.CharField(max_length=100)
    sub_section_name        = models.CharField(max_length=100)    
    to_complete_date        = models.DateField(null=True)
    order                   = models.IntegerField()
    default_positive_marks  = models.FloatField(default=0)
    default_negative_marks  = models.FloatField(default=0)
    folder                  = models.ForeignKey(TestFolder,
                                                on_delete=models.SET_NULL,
                                                null = True)
    test                    = models.ForeignKey(Tests,
                                                on_delete=models.CASCADE,
                                                null=True)
    assigned_to             = models.ForeignKey(CAUsers,
                                                on_delete=models.SET_NULL,
                                                null=True)
    percentile_table            = models.ForeignKey(PercentileTables,
                                on_delete=models.SET_NULL,
                                null=True)
                                
    created_by              = DictField(null=True)
    def __str__(self):
        return json.dumps({
                            'id'                    :self.id
                            ,'name'                 :self.name                    
                        })
    # class Meta:
    #     ordering = 'priority'
    
class TestProfile(TestStructure):
    profile_name            = models.CharField(max_length=100)
    edit_log                = ListField(DictField())
    created_by              = models.ForeignKey(CAUsers,
                                                on_delete=models.SET_NULL,
                                                null=True)
    section                 = models.ForeignKey(Sections,
                                                on_delete=models.SET_NULL,
                                                null=True)












