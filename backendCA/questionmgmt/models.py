from django.db import models
from djangotoolbox.fields import DictField, ListField
from usermgmt.models import CAUsers
import json

from testmgmt.models import Tests, Sections

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

class Topics(BaseModel):
    category     = models.CharField(max_length=50)
    sub_category = models.CharField(max_length=50)
    description  = models.CharField(max_length=300,null=True)
    def __str__(self):
        return json.dumps({'id':self.id,'category':self.category,'sub_category':self.sub_category})

class Passages(BaseModel):
    header      = models.CharField(max_length=50,null=True)
    passage     = models.CharField(max_length=10000)
    data_table  = ListField(DictField())
    def __str__(self):
        return json.dumps({'id':self.id,'header':self.header,'passage':self.passage,'data_table' : self.data_table})


class QuestionSuperFolder(BaseModel):
    folder_name = models.CharField(db_index=True,max_length=100) 
    def __str__(self):
        return json.dumps({'id':self.id,'sup_folder_name':self.folder_name})



class QuestionFolder(BaseModel):
    folder_name  = models.CharField(db_index=True,max_length=100)
    description  = models.CharField(max_length=300,null=True)
    isOld        = models.BooleanField(default=False)
    super_folder = models.ForeignKey(QuestionSuperFolder,
                                on_delete=models.SET_NULL,
                                null=True)


    def __str__(self):
        if self.super_folder:
            super_folder = json.loads(str(self.super_folder))
        else:
            super_folder = {'id':'','sup_folder_name':''}
        return json.dumps({'id':self.id,'folder_name':self.folder_name,'sup_folder':super_folder})


class QuestionStructure(BaseModel):
    question_text            = models.CharField(max_length=500)
    question_type            = models.CharField(max_length=50)
    # mcq_single, mcq_multiple, word, number, essay, chooseorder, in_question_drop_down, in_question_word, in_question_number
    solution                 = models.CharField(max_length=500,null=True)
    topic                    = models.ForeignKey(Topics,
                                on_delete=models.SET_NULL,
                                null=True)
    total_num_set_answers    = models.IntegerField(default=1)
    difficulty_user          = models.CharField(max_length=1,null=True)
    # to_evaluate              = models.BooleanField(default=True)
    is_passage               = models.BooleanField()
    passage                  = models.ForeignKey(Passages,
                                    on_delete=models.CASCADE,
                                    null=True)
    num_correct_answered     = models.IntegerField(default=0)
    num_total_answered       = models.IntegerField(default=0)
    answer_options           = DictField(null=True)
    correct_answer           = DictField(null=True)
    # is_random_order          = models.BooleanField(default=False)
    # range 1 to 6
    created_by               = models.ForeignKey(CAUsers,
                                    on_delete=models.SET_NULL,
                                    null=True)
    question_folder          = models.ForeignKey(QuestionFolder,
                                                on_delete=models.SET_NULL,
                                                null=True)
    is_flagged              = models.BooleanField(default=False)
    is_live                 = models.BooleanField(default=False)
    tests                   = ListField()
    in_test                = models.BooleanField(default=False)
    edoola_q_id            = models.CharField(max_length=50,null=True)
    feedback               = ListField()
    class Meta:
        abstract = True    

class Questions(QuestionStructure):
    pass
    def __str__(self):
        return json.dumps({
                        'id'                    :self.id
                        ,'name'                 :self.question_text                    
                    })



class SectionQuestions(BaseModel):
    positive_marks          = models.FloatField(default=0)
    negative_marks          = models.FloatField(default=0)
    # section_answer_options  = DictField(null=True)
    # section_correct_answer  = DictField(null=True)
    topic                    = models.ForeignKey(Topics,
                                on_delete=models.SET_NULL,
                                null=True)
    is_passage              = models.BooleanField()
    difficulty_user         = models.CharField(max_length=1,null=True)
    question_type           = models.CharField(max_length=50)                                
    order                   = models.IntegerField()
    section                 = models.ForeignKey(Sections,
                                    on_delete=models.CASCADE)
    question                = models.ForeignKey(Questions,
                                    on_delete=models.CASCADE)

# Old data base scraping


# class EdoolaSections(models.Model):
#     section_id         = models.CharField(max_length=50)                                
#     section_slug       = models.CharField(max_length=50)                               


class EdoolaPassages(models.Model):
    passage            = models.CharField(max_length=10000)
    passage_id         = models.CharField(max_length=50)                                
    passage_slug       = models.CharField(max_length=50)                                
    new_passage_id     = models.CharField(max_length=50)
    copied             = models.BooleanField(default=False)

class EdoolaFolders(models.Model):
    folder_name        = models.CharField(max_length = 100)
    folder_id          = models.CharField(max_length = 20)
    folder_type        = models.CharField(max_length = 20, default="question_bank")
    scraped            = models.BooleanField(default=False)
    
    
class EdoolaTests(models.Model):
    folder_name        = models.CharField(max_length = 100)
    folder_id          = models.CharField(max_length = 30)
    test_name          = models.CharField(max_length = 100)
    details_link       = models.CharField(max_length = 200)
    question_link      = models.CharField(max_length = 200)
    type               = models.CharField(max_length = 50)
    scraped            = models.BooleanField(default=False)
    folder_type        = models.CharField(max_length = 30)
    active             = models.BooleanField(default=False)


class EdoolaQuestions(models.Model):
    question           = models.CharField(max_length=500)                                
    
    edoola_id          = models.CharField(max_length=50)                                
    edoola_slug        = models.CharField(max_length=50)   

    is_passage         = models.BooleanField(default=False)
    passage_id         = models.CharField(max_length=50,null=True)                                
    passage_slug       = models.CharField(max_length=50,null=True)                                
    
    bank_type          = models.CharField(max_length=30)                                
    qpaper_id          = models.CharField(max_length=50)
    test_name          = models.CharField(max_length=100)

    section_name       = models.CharField(max_length=200)

    solution           = models.CharField(max_length=500)                                
    type_label         = models.CharField(max_length=30)                                 
    type_id            = models.CharField(max_length=2)                                

    choices            = ListField(null=True)
    all_answers        = models.CharField(max_length=50,null=True)  
    
    answer             = models.CharField(max_length=50,null=True)    
    answer_text        = models.CharField(max_length=50,null=True)                                

    edoola_folder_name = models.CharField(max_length=100)
    question_link      = models.CharField(max_length = 200)
    max_marks          = models.FloatField(default=1)
    negative_marks     = models.FloatField(default=0)
    test               = models.ForeignKey(EdoolaTests,
                                on_delete=models.CASCADE)
    question_id_new    = models.CharField(max_length=30, null=True)
    handled_in_new_qb  = models.BooleanField(default=False)
    problem            = models.CharField(max_length=30,null=True)
    handled_in_new_tb  = models.BooleanField(default=False)
