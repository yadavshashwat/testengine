from django.db import models
from djangotoolbox.fields import DictField, ListField
# Create your models here.
from questionmgmt.models import SectionQuestions, Questions
from testmgmt.models import Tests, Sections
from usermgmt.models import CAUsers
import json

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class ActiveTests(BaseModel):
    user                    = models.ForeignKey(CAUsers,
                                    on_delete=models.CASCADE)
    first_name              = models.CharField(max_length=150,null=True) 
    last_name               = models.CharField(max_length=150,null=True) 
    email                   = models.CharField(max_length=150,null=True) 

    instructions            = ListField()
    num_options_mcq         = models.IntegerField(default=4,null=True)
    
    test_details            = models.ForeignKey(Tests, on_delete=models.CASCADE)
    test_name               = models.CharField(max_length=200,null=True) 
    date_start              = models.DateTimeField()
    
    time_elapsed            = models.IntegerField(default=0)
    is_complete             = models.BooleanField(default=False)
    score                   = models.FloatField(null=True)
    max_score               = models.FloatField(null=True)
    # average_score           = models.FloatField(null=True)

    percentile              = models.FloatField(null=True)    
    date_complete           = models.DateTimeField(null=True)
    total_questions         = models.IntegerField(null=True)
    total_correct           = models.IntegerField(null=True)
    total_incorrect         = models.IntegerField(null=True)
    total_unattempted       = models.IntegerField(null=True)
    marks_correct_positive  = models.FloatField(null=True)
    marks_incorrect_negative= models.FloatField(null=True)
    marks_blank_negative    = models.FloatField(null=True)
    cut_off_cleared         = models.BooleanField(default=True)
    cut_off_exam            = models.FloatField(null=True)
    percentile_no_negative  = models.FloatField(null=True)  

    easy_correct            = models.IntegerField(null=True)
    easy_unattempted        = models.IntegerField(null=True)
    easy_incorrect          = models.IntegerField(null=True)
    easy_time_spent          = models.IntegerField(null=True)
    easy_correct_time_spent = models.IntegerField(null=True)

    medium_correct            = models.IntegerField(null=True)
    medium_unattempted        = models.IntegerField(null=True)
    medium_incorrect          = models.IntegerField(null=True)
    medium_time_spent          = models.IntegerField(null=True)
    medium_correct_time_spent = models.IntegerField(null=True)

    hard_correct            = models.IntegerField(null=True)
    hard_unattempted        = models.IntegerField(null=True)
    hard_incorrect          = models.IntegerField(null=True)
    hard_time_spent          = models.IntegerField(null=True)
    hard_correct_time_spent = models.IntegerField(null=True)

    highest_marks           = models.IntegerField(null=True)
    average_marks           = models.IntegerField(null=True)


    def __str__(self):
        return json.dumps({'id':self.id,
                            'percentile':self.percentile,
                            'score':self.score,
                            'is_complete':self.is_complete,
                        })
    

class ActiveSections(BaseModel):
    linked_test         = models.ForeignKey(ActiveTests,
                                            on_delete=models.CASCADE)
    section_details     = models.ForeignKey(Sections,
                                            on_delete=models.CASCADE)
    is_active           = models.BooleanField(default=False)
    
    time_elapsed        = models.IntegerField(default=0)

    score                   = models.FloatField(null=True)
    max_score                   = models.FloatField(null=True)
    # average_score           = models.FloatField(null=True)
    percentile              = models.FloatField(null=True)    
    total_questions         = models.IntegerField(null=True)
    total_correct           = models.IntegerField(null=True)
    total_incorrect         = models.IntegerField(null=True)
    total_unattempted       = models.IntegerField(null=True)
    marks_correct_positive  = models.FloatField(null=True)
    marks_incorrect_negative= models.FloatField(null=True)
    marks_blank_negative    = models.FloatField(null=True)
    cut_off_cleared         = models.BooleanField(default=True)
    cut_off_exam            = models.FloatField(null=True)
    percentile_no_negative  = models.FloatField(null=True)  

    easy_correct            = models.IntegerField(null=True)
    easy_unattempted        = models.IntegerField(null=True)
    easy_incorrect          = models.IntegerField(null=True)
    easy_time_spent          = models.IntegerField(null=True)
    easy_correct_time_spent = models.IntegerField(null=True)

    medium_correct            = models.IntegerField(null=True)
    medium_unattempted        = models.IntegerField(null=True)
    medium_incorrect          = models.IntegerField(null=True)
    medium_time_spent          = models.IntegerField(null=True)
    medium_correct_time_spent = models.IntegerField(null=True)    

    hard_correct            = models.IntegerField(null=True)
    hard_unattempted        = models.IntegerField(null=True)
    hard_incorrect          = models.IntegerField(null=True)
    hard_time_spent          = models.IntegerField(null=True)
    hard_correct_time_spent = models.IntegerField(null=True)
    
    highest_marks           = models.IntegerField(null=True)
    average_marks           = models.IntegerField(null=True)
    
class ActiveQuestions(BaseModel):
    is_active           = models.BooleanField(default=False)
    section_question    = models.ForeignKey(SectionQuestions,
                                            on_delete = models.CASCADE)
    linked_test      = models.ForeignKey(ActiveTests,
                                            on_delete = models.CASCADE)                                        
    linked_section      = models.ForeignKey(ActiveSections,
                                            on_delete = models.CASCADE)
    time_spent          = models.IntegerField(default=0)
    answer_response     = DictField(null=True)
    is_marked           = models.BooleanField(default=False)
    question_status     = models.CharField(max_length=20,default="not_visited")
    # not_visited/answered/unanswered
    is_correct          = models.BooleanField(default=False)
    difficulty          = models.CharField(max_length=2)
    question_category   = models.CharField(max_length=40)
    question_sub_category   = models.CharField(max_length=40)
    marks_rewarded  = models.FloatField(null=True)    

    

# class CompleteQuestions(BaseModel):
#     section_question = models.ForeignKey(SectionQuestions,
#                         on_delete = models.CASCADE)
#     linked_section   = models.ForeignKey(ActiveSections,
#                         on_delete = models.CASCADE)
#     time_spent      = models.IntegerField()
#     answer_response = DictField()
#     is_marked       = models.BooleanField(default=False)
#     question_status = models.CharField(max_length=20)
    # not_visited/answered/unanswered

    




