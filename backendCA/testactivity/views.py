from django.shortcuts import render

# Create your views here.
from django.http import HttpResponseRedirect,HttpResponseForbidden,HttpResponse
from django.db.models import Count, Sum
from django.db.models import Q
from django.core.paginator import Paginator
from overall.views import get_param,cleanstring,random_str_generator
import math
import json
import time
from datetime import datetime
import operator
from validate_email import validate_email
from fuzzywuzzy import fuzz
from overall.views import booleanvar_check, listvar_check, intvar_check, floatvar_check, boolean_fields
from models import *
from testmgmt.models import Tests, Sections
from questionmgmt.models import Questions, SectionQuestions
operation_active_tests = ['start_continue','pause','update']
operations_allowed_default = ['create','read','update','delete']
from questionmgmt.views import question_types,correct_dict_check,correct_answer_dict_chooseorder,correct_answer_dict_mcq_multiple,correct_answer_dict_mcq_single,correct_answer_numberdict,correct_answer_worddict
from mailing.views import send_mail
import random 

#<----------------- Test Start --------------------------->


def validate_test_state(request):
    error              = False
    success            = False
    error_message_list = []
    obj = {}
    message            = "Request Recieved"
    email              = get_param(request, 'email', None)    
    test_name          = get_param(request, 'test_name', None)  
    is_admin           = get_param(request, 'is_admin', None)
    testout = {}
    sectionout = []
    active_section_obj = None
    active_question_obj = None
    active_section_dict = None
    active_question_dict = None

    if email:
        email = cleanstring(email.lower())
        if validate_email(email):
            pass 
        else:
            error = True
            error_message_list.append("Invalid email")                                   
    else:
        error = True
        error_message_list.append("Missing email")                               

    if test_name:
        try:
            test = Tests.objects.filter(test_name=test_name)[0]
        except:
            error = True
            error_message_list.append("Invalid test_name")
    else:
        error = True
        error_message_list.append("Missing test_name")    

    if not error: 
        user = None
        user = CAUsers.objects.filter(email=email)
        
        if user.count() > 0:
            user = user[0]
            if is_admin == "1":
                ActiveTests.objects.filter(user =  user,test_details=test).delete()

            if test.is_live or user.is_staff:
                activetest = ActiveTests.objects.filter(user =  user,
                                                        test_details=test)
                if activetest.count() > 0 :
                    activetest = activetest[0]
                    message = "Existing test found, Continue!"
                    success = True      
                    active_section_obj  = ActiveSections.objects.filter(linked_test = activetest, is_active = True)
                    if active_section_obj.count() > 0 :
                        active_section_obj = active_section_obj[0]       
                        active_question_obj  = ActiveQuestions.objects.filter(linked_section = active_section_obj, is_active = True)
                        if active_question_obj.count() > 0:
                            active_question_obj = active_question_obj[0]   
                        else:
                            active_question_obj = None
                    else:
                        active_section_obj = None
                else:
                    success = False
                    activetest = {}
                    message = "Existing test not found, Start!"    

            else:
                success = False
                output = {}
                message = "Requested test is not live!"            

        else:
            activetest = {}
            message = "Existing test not found, Start!"
            success = False            

    else:
        message = "Errors | Refer Error List!"


    if not error:
        if active_question_obj != None:
            active_question_dict = active_question_out(active_question=active_question_obj,num_options_mcq=activetest.num_options_mcq)
        
        if active_section_obj != None:
            active_section_dict = active_section_out(active_section_obj,None)


        if success:
            activesections_list     = ActiveSections.objects.filter(linked_test = activetest)
            testdetails             = activetest.test_details
            if testdetails.category:
                category_out = json.loads(str(testdetails.category))
            else:
                category_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))

            total_time = None
            if testdetails.total_time:
                total_time = testdetails.total_time * 60


            # testout = {
            #         'user'                         :json.loads(str(activetest.user))
            #         ,'is_complete'                  :activetest.is_complete
            #         ,'id'                           :activetest.id
            #         ,'test_id'                      :testdetails.id
            #         ,'time_elapsed'                 :activetest.time_elapsed
            #         ,'test_name'                    :testdetails.test_name                  
            #         ,'scheduled_for'                :str(testdetails.scheduled_for)              
            #         ,'is_section_sequence_choose'   :testdetails.is_section_sequence_choose 
            #         ,'is_sectional_jump'            :testdetails.is_sectional_jump          
            #         ,'time_calculation'             :testdetails.time_calculation           
            #         ,'total_time'                   :total_time
            #         ,'is_question_jump'             :testdetails.is_question_jump           
            #         ,'is_pausable'                  :testdetails.is_pausable    
            #         ,'is_pausable'                  :testdetails.is_pausable                
            #         ,'timer_type'                   :testdetails.timer_type 
            #         ,'category'                     :category_out
            #         ,'interface_type'               :testdetails.interface_type             
            #         ,'is_blank_negative'            :testdetails.is_blank_negative          
            #         ,'blank_negative_type'          :testdetails.blank_negative_type        
            #         ,'num_blank_allowed'            :testdetails.num_blank_allowed          
            #         ,'blank_negative_marks'         :testdetails.blank_negative_marks       
            #         ,'instructions'                 :activetest.instructions               
            #         ,'num_options_mcq'              :activetest.num_options_mcq            
            #         ,'is_live'                      :testdetails.is_live
            #         ,'comments'                     :testdetails.comments
            #         ,'cutoff'                       :testdetails.test_cutoff
            #         ,'analysis'                     :testdetails.test_analysis
            #     }

            if testdetails.percentile_table:
                percentile_table_out = testdetails.percentile_table.table
            else:
                percentile_table_out = None



            testout = {
                    'user'                         :json.loads(str(activetest.user))
                    ,'is_complete'                  :activetest.is_complete
                    ,'id'                           :activetest.id
                    ,'test_id'                      :testdetails.id
                    ,'time_elapsed'                 :activetest.time_elapsed
                    ,'test_name'                    :testdetails.test_name                  
                    ,'scheduled_for'                :str(testdetails.scheduled_for)              
                    ,'is_section_sequence_choose'   :testdetails.is_section_sequence_choose 
                    ,'is_sectional_jump'            :testdetails.is_sectional_jump          
                    ,'time_calculation'             :testdetails.time_calculation           
                    ,'total_time'                   :testdetails.total_time
                    ,'is_question_jump'             :testdetails.is_question_jump           
                    ,'is_pausable'                  :testdetails.is_pausable    
                    ,'is_pausable'                  :testdetails.is_pausable                
                    ,'timer_type'                   :testdetails.timer_type 
                    ,'category'                     :category_out
                    ,'interface_type'               :testdetails.interface_type             
                    ,'is_blank_negative'            :testdetails.is_blank_negative          
                    ,'blank_negative_type'          :testdetails.blank_negative_type        
                    ,'num_blank_allowed'            :testdetails.num_blank_allowed          
                    ,'blank_negative_marks'         :testdetails.blank_negative_marks       
                    ,'instructions'                 :activetest.instructions               
                    ,'num_options_mcq'              :activetest.num_options_mcq            
                    ,'is_live'                      :testdetails.is_live
                    ,'comments'                     :testdetails.comments
                    ,'cutoff'                       :testdetails.test_cutoff
                    ,'score'                        : activetest.score               
                    ,'max_score'                    : activetest.max_score               
                    ,'analysis'                     :testdetails.test_analysis
                    ,'highest_marks'                : activetest.highest_marks
                    ,'average_marks'                : activetest.average_marks
                    ,'percentile'                   : activetest.percentile               
                    ,'date_start'                   : str(activetest.date_start)
                    ,'date_complete'                : str(activetest.date_complete)            
                    ,'total_questions'              : activetest.total_questions          
                    ,'total_correct'                : activetest.total_correct            
                    ,'total_incorrect'              : activetest.total_incorrect          
                    ,'total_unattempted'            : activetest.total_unattempted        
                    ,'marks_correct_positive'       : activetest.marks_correct_positive   
                    ,'marks_incorrect_negative'     : activetest.marks_incorrect_negative 
                    ,'marks_blank_negative'         : activetest.marks_blank_negative     
                    ,'cut_off_cleared'              : activetest.cut_off_cleared          
                    ,'cut_off_exam'                 : activetest.cut_off_exam             
                    ,'percentile_no_negative'       : activetest.percentile_no_negative   
                    ,'easy_correct'                 : activetest.easy_correct             
                    ,'easy_unattempted'             : activetest.easy_unattempted         
                    ,'easy_incorrect'               : activetest.easy_incorrect           
                    ,'easy_time_spent'              : activetest.easy_time_spent          
                    ,'medium_correct'               : activetest.medium_correct           
                    ,'medium_unattempted'           : activetest.medium_unattempted       
                    ,'medium_incorrect'             : activetest.medium_incorrect         
                    ,'medium_time_spent'            : activetest.medium_time_spent        
                    ,'hard_correct'                 : activetest.hard_correct             
                    ,'hard_unattempted'             : activetest.hard_unattempted         
                    ,'hard_incorrect'               : activetest.hard_incorrect           
                    ,'hard_time_spent'              : activetest.hard_time_spent  
                    ,'percentile_table'             : percentile_table_out   
                    ,'easy_correct_time_spent'              : activetest.easy_correct_time_spent          
                    ,'medium_correct_time_spent'              : activetest.medium_correct_time_spent          
                    ,'hard_correct_time_spent'              : activetest.hard_correct_time_spent          
              
                }





            for sect in activesections_list:
                sec_questions_list  = []
                section_detail = None
                section_detail = sect.section_details
                sec_questions_out  = ActiveQuestions.objects.filter(linked_section = sect)
                for ques in sec_questions_out:
                    secques_detail = ques.section_question
                    ques_detail = ques.section_question.question
                    if ques_detail.passage:
                        passage_out = json.loads(str(ques_detail.passage))
                    else:
                        passage_out = json.loads(str(json.dumps({'id':'','header':'','text':'','data_table' : []})))
                    
                    if secques_detail.topic:
                        topic_out = json.loads(str(secques_detail.topic))
                    else:
                        topic_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))

                    if activetest.is_complete:
                        sec_questions_list.append(active_question_out(active_question = ques, solution =True, num_options_mcq=activetest.num_options_mcq))
                    else:
                        sec_questions_list.append(active_question_out(active_question = ques, num_options_mcq=activetest.num_options_mcq))
                sectionout.append(active_section_out(active_section=sect,question_list=sec_questions_list))
        else:

            if test.category:
                category_out = json.loads(str(test.category))
            else:
                category_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))
            
            sections_out = map(lambda x : json.loads(str(x)),test.sections_set.all().order_by('order'))

            total_time = None
            if test.total_time:
                total_time = test.total_time * 60


            testout = {
                    'test_id'                       :test.id
                    ,'test_name'                    :test.test_name                  
                    ,'scheduled_for'                :str(test.scheduled_for)              
                    ,'is_section_sequence_choose'   :test.is_section_sequence_choose 
                    ,'is_sectional_jump'            :test.is_sectional_jump          
                    ,'time_calculation'             :test.time_calculation           
                    ,'total_time'                   :total_time
                    ,'is_question_jump'             :test.is_question_jump           
                    ,'is_pausable'                  :test.is_pausable    
                    ,'timer_type'                   :test.timer_type 
                    ,'sections'                     :sections_out
                    ,'category'                     :category_out
                    ,'interface_type'               :test.interface_type             
                    ,'num_options_mcq'              :test.num_options_mcq            
                    ,'is_blank_negative'            :test.is_blank_negative          
                    ,'sections'                     :sections_out
                    ,'blank_negative_type'          :test.blank_negative_type        
                    ,'num_blank_allowed'            :test.num_blank_allowed          
                    ,'blank_negative_marks'         :test.blank_negative_marks       
                    ,'instructions'                 :test.instructions               
                    ,'is_live'                      :test.is_live
                    ,'comments'                     :test.comments
                    ,'is_complete'                   :False
                    }
            
    else:
        message = "Errors | Refer Error List!"    


    obj = {'result':{
                'test':testout,
                'sections':sectionout,
                'prev_section' : None,
                'next_section' : active_section_dict,
                'prev_question' : None,
                'next_question' : active_question_dict

                
                },
            'message':message,
            'error':error,
            'error_message_list':error_message_list,
            'status':success}
    return HttpResponse(json.dumps(obj), content_type='application/json')


def start_continue_test(request):
    error              = False
    success            = False
    error_message_list = []
    obj = {}
    message            = "Request Recieved"
    email              = get_param(request, 'email', None)    
    fname              = get_param(request, 'fname', None)    
    lname              = get_param(request, 'lname', None)    
    # mobile             = get_param(request, 'mobile', None)    
    test_id            = get_param(request, 'test_id', None)  
    section_id_order   = get_param(request, 'section_order',None)  
    testout = {}
    sectionout = []
    active_section_obj = None
    active_question_obj = None
    active_question_dict = None
    active_section_dict = None


    if email:
        email = cleanstring(email.lower())
        if validate_email(email):
            pass 
        else:
            error = True
            error_message_list.append("Invalid email")                                   
    else:
        error = True
        error_message_list.append("Missing email")                               

    if fname:
        fname = cleanstring(fname.lower())
    else:
        error = True
        error_message_list.append("Missing fname")                               

    if lname:
        lname = cleanstring(lname.lower())
    else:
        error = True
        error_message_list.append("Missing lname")                               

    # check_mobile = intvar_check(variable_name="mobile",value=mobile)     
    # if not check_mobile['error']:
    #     mobile = check_mobile['output']
    #     if len(str(mobile)) != 10:
    #         error = True
    #         error_message_list.append("Invalid mobile")    
    # else:
    #     error = check_mobile['error']
    #     error_message_list.append(check_mobile['errormessage'])

    if test_id:
        try:
            test = Tests.objects.get(id=test_id)
            givensectionlist = []
            if test.is_section_sequence_choose:
                section_id_order_list = section_id_order.split(",")
                if len(section_id_order_list) == test.sections_set.all().count():
                    givensectionlist =  map(lambda x : Sections.objects.get(id=x),section_id_order_list)
                else:
                    error = True
                    error_message_list.append("Missing section ids")        
            else:
                givensectionlist = test.sections_set.all().order_by('order')

        except:
            error = True
            error_message_list.append("Invalid test_id")
    else:
        error = True
        error_message_list.append("Missing test_id")

    
    if not error: 
        user = None
        user = CAUsers.objects.filter(email=email)
        if user.count() > 0 :
            user = user[0]
        else:
            user = CAUsers.objects.create(email=email,
                                        first_name=fname,
                                        last_name=lname)
            user.secret_string = (user.id + random_str_generator())
            user.auth_token = (user.id + random_str_generator())
            user.save()

        ts = time.time()
        created_at = datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')

        if test.is_live or user.is_staff:
            activetest = ActiveTests.objects.filter(user=user,
                                                    test_details=test)
            if activetest.count() > 0 :
                activetest = activetest[0]
                message = "Existing test found, Continue!"
                success = True            
            else:
                activetest = ActiveTests.objects.create(
                    user            = user,
                    first_name      = fname,
                    last_name       = lname,
                    email           = email,
                    test_details    = test,
                    date_start      = created_at,
                    test_name       = test.test_name,
                    instructions    = test.instructions,
                    num_options_mcq = test.num_options_mcq
                )
                
                sections_list = givensectionlist
                for sec in sections_list:
                    question_list = None
                    activesection = None
                    activesection = ActiveSections.objects.create(
                                                linked_test             = activetest,
                                                section_details         = sec
                                            )
                    question_list = sec.sectionquestions_set.all().order_by('order')

                    for ques in question_list:
                        if ques.question.topic:
                            category = ques.question.topic.category
                            sub_category = ques.question.topic.sub_category
                        else:
                            category = "Unassigned"
                            sub_category = "Unassigned"


                        difficulty = "Unassigned"
                        if ques.question.difficulty_user:
                            if ques.question.difficulty_user in ['5','6']:
                                difficulty = "Difficulty"
                            elif ques.question.difficulty_user in ['3','4']:
                                difficulty = "Moderate"
                            else:
                                difficulty = "Easy"
                        else:
                            difficulty = "Unassigned"

                        ActiveQuestions.objects.create(
                            section_question    = ques,
                            linked_section      = activesection,
                            linked_test         = activetest,
                            question_category   = category,
                            question_sub_category = sub_category,
                            difficulty = difficulty
                        )
                success = True
                message = "Test Started!"
        else:
            success = False
            output = ActiveTests.objects.none()
            message = "Requested test is not live!"
    else:
        message = "Errors | Refer Error List!"
        success = False
        


    if not error:
        activesections_list     = ActiveSections.objects.filter(linked_test = activetest)
        testdetails             = activetest.test_details        

        if testdetails.category:
            category_out = json.loads(str(testdetails.category))
        else:
            category_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))

        total_time = None
        if testdetails.total_time:
            total_time = testdetails.total_time * 60


        testout = {
                 'user'                         :json.loads(str(activetest.user))
                ,'is_complete'                  :activetest.is_complete
                ,'id'                           :activetest.id
                ,'time_elapsed'                 :activetest.time_elapsed
                ,'test_name'                    :testdetails.test_name                  
                ,'scheduled_for'                :str(testdetails.scheduled_for)              
                ,'is_section_sequence_choose'   :testdetails.is_section_sequence_choose 
                ,'is_sectional_jump'            :testdetails.is_sectional_jump          
                ,'time_calculation'             :testdetails.time_calculation           
                ,'total_time'                   :total_time
                ,'is_question_jump'             :testdetails.is_question_jump           
                ,'is_pausable'                  :testdetails.is_pausable    
                ,'is_pausable'                  :testdetails.is_pausable                
                ,'timer_type'                   :testdetails.timer_type 
                ,'category'                     :category_out
                ,'interface_type'               :testdetails.interface_type             
                ,'is_blank_negative'            :testdetails.is_blank_negative          
                ,'blank_negative_type'          :testdetails.blank_negative_type        
                ,'num_blank_allowed'            :testdetails.num_blank_allowed          
                ,'blank_negative_marks'         :testdetails.blank_negative_marks       
                ,'instructions'                 :activetest.instructions               
                ,'num_options_mcq'              :activetest.num_options_mcq            
                ,'is_live'                      :testdetails.is_live
                ,'comments'                     :testdetails.comments
                ,'cutoff'                       :testdetails.test_cutoff
                ,'analysis'                     :testdetails.test_analysis
            }
        isActiveFound = False
        for sect in activesections_list:
            sec_questions_list  = []
            section_detail = None
            section_detail = sect.section_details
            sec_questions_out  = ActiveQuestions.objects.filter(linked_section = sect)
            if not isActiveFound:
                if len(section_detail.instructions) == 0:
                    if len(sec_questions_out) > 0:
                        question = sec_questions_out[0]
                        question.is_active = True
                        question.save()
                        sect.is_active = True
                        sect.save()
                        active_section_obj = sect
                        active_question_obj = question
                        isActiveFound = True
                    else:
                        active_question_obj = None
                else:
                    active_section_obj = sect
                    sect.is_active = True
                    isActiveFound = True
                    sect.save()


            for ques in sec_questions_out:
                secques_detail = ques.section_question
                ques_detail = ques.section_question.question
                if ques_detail.passage:
                    passage_out = json.loads(str(ques_detail.passage))
                else:
                    passage_out = json.loads(str(json.dumps({'id':'','header':'','text':'','data_table' : []})))
                
                if secques_detail.topic:
                    topic_out = json.loads(str(secques_detail.topic))
                else:
                    topic_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))

                sec_questions_list.append(active_question_out(active_question = ques,num_options_mcq=activetest.num_options_mcq))

            sectionout.append(active_section_out(active_section=sect,question_list=sec_questions_list))

        if active_question_obj != None:
            active_question_dict = active_question_out(active_question = active_question_obj,num_options_mcq=activetest.num_options_mcq)
        else:
            active_question_dict = None

        if active_section_obj != None:
            active_section_dict = active_section_out(active_section_obj,None)
        else:
            active_section_dict = None


    else:
        message = "Errors | Refer Error List!" 
        error = True   
        success = False


    obj = {'result':{
                'test':testout,
                'sections':sectionout,
                'prev_section' : None,
                'next_section' : active_section_dict,
                'prev_question' : None,
                'next_question' : active_question_dict
                },
            'message':message,
            'error':error,
            'error_message_list':error_message_list,
            'status':success}
    return HttpResponse(json.dumps(obj), content_type='application/json')


def bookmark_question(request):
    obj = {}
    success = False
    # result = []
    message = "Request Recieved"
    filters = {}
    error = False
    error_message_list = []
    questionout = None
    question_id  = get_param(request, 'question_id', None)
    is_marked    = get_param(request, 'is_marked', None)

    if question_id:
        try:
            question = ActiveQuestions.objects.get(id=question_id)
        except:
            error = True
            error_message_list.append("Invalid question_id")
    else:
        error = True
        error_message_list.append("Missing question_id")

    check_is_marked = booleanvar_check(variable_name="is_marked",value=is_marked)
    if not check_is_marked['error']:
        is_marked = check_is_marked['output']
    else:
        error = True 
        error_message_list.append(check_is_marked['errormessage'])    

    if not error:
        question.is_marked = is_marked
        question.save()
        if is_marked:
            message = "Question bookmarked"
        else:
            message = "Removed question bookmark"
        success = True

    else:
        success = False
        message = "Errors | Refer Error List!"        

    obj['result'] = {}
    obj['message'] = message
    obj['status'] = success
    obj['error'] = error
    obj['error_list'] = error_message_list
    return HttpResponse(json.dumps(obj), content_type='application/json')



def share_question_feedback(request):
    obj = {}
    success = False
    # result = []
    message = "Request Recieved"
    filters = {}
    error = False
    error_message_list = []
    questionout = None
    question_id = get_param(request, 'question_id', None)
    feedback    = get_param(request, 'feedback', None)

    if question_id:
        try:
            question = ActiveQuestions.objects.get(id=question_id)
        except:
            error = True
            error_message_list.append("Invalid question_id")
    else:
        error = True
        error_message_list.append("Missing question_id")

    if not error:
        act_question = question.section_question.question
        act_question.is_flagged = True
        feedback_list = act_question.feedback
        feedback_list.append('feedback')
        act_question.save()
        message = "Question feedback saved"
        success = True
        content_email = "Test Name : " + question.section_question.section.test.test_name +  " | Section Name : " + question.section_question.section.sub_section_name + " | User email : "+ question.linked_test.email + " | Question : " + question.section_question.question.question_text + " | Feedback : " + feedback
        send_mail(subject="Question Feedback Email | CareerAnna TestEngine",to_email=(',').join(["y.shashwat@gmail.com","anshika@careeranna.com","ayushi@careeranna.com","varun@careeranna.com"]),from_email="editor@careeranna.com",content=content_email)    
    else:
        success = False
        message = "Errors | Refer Error List!"        

    obj['result'] = {}
    obj['message'] = message
    obj['status'] = success
    obj['error'] = error
    obj['error_list'] = error_message_list
    return HttpResponse(json.dumps(obj), content_type='application/json')



    


def update_active_test(request):
    obj = {}
    success = False
    # result = []
    message = "Request Recieved"
    filters = {}
    error = False
    error_message_list = []
    prev_sectionout = None
    new_sectionout = None
    prev_questionout = None
    next_questionout = None
    testout = None
    test_id          = get_param(request, 'test_id', None)
    section_id       = get_param(request, 'section_id', None)
    next_section_id  = get_param(request, 'next_section_id', None)
    question_id      = get_param(request, 'question_id', None)
    next_question_id = get_param(request, 'next_question_id', None)
    time_elapsed     = get_param(request, 'time_elapsed', None)
    response         = get_param(request, 'response', None)
    is_marked        = get_param(request, 'is_marked', 0)
    is_jump          = get_param(request,'is_jump',None)
    to_mark          = get_param(request, 'to_mark', 0)
    if test_id:
        try:
            test = ActiveTests.objects.get(id=test_id)
        except:
            error = True
            error_message_list.append("Invalid test_id")
    else:
        error = True
        error_message_list.append("Missing test_id")

    if section_id:
        try:
            section = ActiveSections.objects.get(id=section_id)    
        except:
            error = True
            error_message_list.append("Invalid section_id")
    else:
        section = None
    
    if next_section_id:
        try:
            next_section = ActiveSections.objects.get(id=next_section_id)    
        except:
            error = True
            error_message_list.append("Invalid next_section_id")    
    else:
        next_section = None

    check_time = intvar_check(variable_name="time_elapsed",value=time_elapsed)
    if not check_time['error']:
        time_elapsed = check_time['output']
    else:
        error = check_time['error']
        error_message_list.append(check_time['errormessage'])    
    
    
    if not is_jump:
        check_is_marked = booleanvar_check(variable_name="is_marked",value=is_marked)
        if not check_is_marked['error']:
            is_marked = check_is_marked['output']
        else:
            error = True 
            error_message_list.append(check_is_marked['errormessage'])

    if to_mark == "1":
        check_is_marked = booleanvar_check(variable_name="is_marked",value=is_marked)
        if not check_is_marked['error']:
            is_marked = check_is_marked['output']
        else:
            error = True 
            error_message_list.append(check_is_marked['errormessage'])
        
    if question_id:
        try:
            question = ActiveQuestions.objects.get(id=question_id)    
            # check_answer_dict = correct_dict_check(value=response,question_type=question.section_question.question_type)
            # if not check_answer_dict['error']:
            #     response = check_answer_dict['output']
            # else:
            #     error = True
            #     error_message_list.append(check_answer_dict['errormessage'])
            if not is_jump:
                question_response_out  = check_question_response(response, question.section_question.question_type)
                if not question_response_out['error']:
                    response = question_response_out['output']
                else:
                    error = True
                    error_message_list.append(question_response_out['errormessage'])

        except:
            error = True
            error_message_list.append("Invalid question_id")    
    else:
        question = None

    if next_question_id:
        try:
            next_question = ActiveQuestions.objects.get(id=next_question_id)    
        except:
            error = True
            error_message_list.append("Invalid next_question_id")    
    else:
        next_question = None

    if not error:
        print next_section
        if section == next_section:
            old_section_time_elapsed = section.time_elapsed
            new_section_time_elapsed = int(old_section_time_elapsed) + int(time_elapsed)
            # print "section time elapsed: " + str(old_section_time_elapsed)
            # print "section time elapsed: " + str(new_section_time_elapsed)
            section.time_elapsed = int(new_section_time_elapsed)
            section.save()            
            print "here 1"
            next_section = section

        else:        
            if section:
                section.is_active = False
                old_section_time_elapsed = section.time_elapsed
                new_section_time_elapsed = int(old_section_time_elapsed) + int(time_elapsed)
                section.time_elapsed = int(new_section_time_elapsed)
                section.save()

            if next_section:
                next_section.is_active = True
                next_section.save()
            print "here 2"

        if question == next_question:
            if not is_jump:
                question.is_marked = is_marked
                question.answer_response = response
                if response:
                    question.question_status = "answered"
                else:
                    question.question_status = "unanswered"
            else:
                if question.question_status == "not_visited":
                    question.question_status = "unanswered"

            if to_mark == "1":
                question.is_marked = is_marked
            

            old_time_elapsed = question.time_spent 
            new_time_elapsed = int(old_time_elapsed) + int(time_elapsed)
            question.time_spent = int(new_time_elapsed)
            question.save()
            next_question = question
            print "here 3"

        else:
            if question:
                question.is_active = False
                if not is_jump:
                    question.is_marked = is_marked
                    question.answer_response = response
                    if response:
                        question.question_status = "answered"
                    else:
                        question.question_status = "unanswered"
                else:
                    if question.question_status == "not_visited":
                        question.question_status = "unanswered"

                if to_mark == "1":
                    question.is_marked = is_marked

                old_time_elapsed = question.time_spent 
                new_time_elapsed = int(old_time_elapsed) + int(time_elapsed)
                question.time_spent = int(new_time_elapsed)
        
                question.save()


            if next_question:
                next_question.is_active = True
                next_question.save()
            print "here 4"


        old_test_time_elapsed = test.time_elapsed 
        # print "test time elapsed: " + str(old_test_time_elapsed)
        new_test_time_elapsed = int(old_test_time_elapsed) + int(time_elapsed)
        test.time_elapsed = int(new_test_time_elapsed)
        test.save()


        if section:
            prev_sectionout = active_section_out(active_section=section,question_list=None)
        else:
            prev_sectionout = None

        if next_section:
            new_sectionout = active_section_out(active_section=next_section,question_list=None)
        else:
            new_sectionout = None

        if question:
            prev_questionout = active_question_out(active_question=question,num_options_mcq=test.num_options_mcq)
        else:
            prev_questionout = None

        if next_question:
            next_questionout = active_question_out(active_question=next_question,num_options_mcq=test.num_options_mcq)
        else:
            next_questionout = None
        
        success = True
        message = "Test Updated!"


        testdetails             = test.test_details        

        if testdetails.category:
            category_out = json.loads(str(testdetails.category))
        else:
            category_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))

        total_time = None
        if testdetails.total_time:
            total_time = testdetails.total_time * 60


        testout = {
                 'user'                         :json.loads(str(test.user))
                ,'is_complete'                  :test.is_complete
                ,'id'                           :test.id
                ,'time_elapsed'                 :test.time_elapsed
                ,'test_name'                    :testdetails.test_name                  
                ,'scheduled_for'                :str(testdetails.scheduled_for)              
                ,'is_section_sequence_choose'   :testdetails.is_section_sequence_choose 
                ,'is_sectional_jump'            :testdetails.is_sectional_jump          
                ,'time_calculation'             :testdetails.time_calculation           
                ,'total_time'                   :total_time
                ,'is_question_jump'             :testdetails.is_question_jump           
                ,'is_pausable'                  :testdetails.is_pausable    
                ,'is_pausable'                  :testdetails.is_pausable                
                ,'timer_type'                   :testdetails.timer_type 
                ,'category'                     :category_out
                ,'interface_type'               :testdetails.interface_type             
                ,'is_blank_negative'            :testdetails.is_blank_negative          
                ,'blank_negative_type'          :testdetails.blank_negative_type        
                ,'num_blank_allowed'            :testdetails.num_blank_allowed          
                ,'blank_negative_marks'         :testdetails.blank_negative_marks       
                ,'instructions'                 :test.instructions               
                ,'num_options_mcq'              :test.num_options_mcq            
                ,'is_live'                      :testdetails.is_live
                ,'comments'                     :testdetails.comments
                ,'cutoff'                       :testdetails.test_cutoff
                ,'analysis'                     :testdetails.test_analysis
            }


    else:
        success = False
        message = "Errors | Refer Error List!"        
        
    obj['result'] = {
        'test':testout,
        'prev_section' : prev_sectionout,
        'next_section' : new_sectionout,
        'prev_question' : prev_questionout,
        'next_question' : next_questionout
    }
    obj['filter'] = filters
    obj['message'] = message
    obj['status'] = success
    obj['error'] = error
    obj['error_list'] = error_message_list
    return HttpResponse(json.dumps(obj), content_type='application/json')

def active_question_out(active_question,solution=False,num_options_mcq = 4):
    obj = {}
    secques_detail = active_question.section_question
    ques_detail = active_question.section_question.question
    if ques_detail.passage:
        passage_out = json.loads(str(ques_detail.passage))
    else:
        passage_out = json.loads(str(json.dumps({'id':'','header':'','text':'','data_table' : []})))
    
    if secques_detail.topic:
        topic_out = json.loads(str(secques_detail.topic))
    else:
        topic_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))
    question_option_details = {}
    question_option_details = handleanswer_options(question = ques_detail,num_options_mcq=num_options_mcq)        
    if solution:
        obj =  {
            'id':active_question.id,
            'sec_quest_id':secques_detail.id,
            'question_id':ques_detail.id,
            'is_live':ques_detail.is_live,
            'question_text':ques_detail.question_text,        
            'question_type':{"value":ques_detail.question_type,"label":question_types[ques_detail.question_type]},           
            'topic': topic_out,          
            'total_num_set_answers':ques_detail.total_num_set_answers,    
            'difficulty_user':secques_detail.difficulty_user,   
            'solution':ques_detail.solution,  
            'is_passage':ques_detail.is_passage, 
            'passage':passage_out,
            'response':active_question.answer_response,
            'num_correct_answered':ques_detail.num_correct_answered,
            'num_total_answered':ques_detail.num_total_answered,
            'is_marked':active_question.is_marked,
            'status':active_question.question_status,
            'answer_options':
                            question_option_details['option_dict'],
                            # ques_detail.answer_options,
            'correct_answer':
                            question_option_details['correct_dict'],
                            # ques_detail.correct_answer,
            'positive_marks':secques_detail.positive_marks,
            'negative_marks':secques_detail.negative_marks,
            'order':secques_detail.order,
            'time_spent':active_question.time_spent,
            'marks_rewarded':active_question.marks_rewarded,
            'is_correct':active_question.is_correct

        }
    else:
        obj =  {
            'id':active_question.id,
            'is_active':active_question.is_active,
            'sec_quest_id':secques_detail.id,
            'question_id':ques_detail.id,
            'is_live':ques_detail.is_live,
            'question_text':ques_detail.question_text,        
            'question_type':{"value":ques_detail.question_type,"label":question_types[ques_detail.question_type]},           
            'topic': topic_out,          
            'total_num_set_answers':ques_detail.total_num_set_answers,    
            'is_passage':ques_detail.is_passage, 
            'passage':passage_out,
            'response':active_question.answer_response,
            'is_marked':active_question.is_marked,
            'status':active_question.question_status,
            'answer_options':
                            question_option_details['option_dict'],
                            # ques_detail.answer_options,
            'positive_marks':secques_detail.positive_marks,
            'negative_marks':secques_detail.negative_marks,
            'order':secques_detail.order,
            'time_spent':active_question.time_spent
        }
    return obj
    
def active_section_out(active_section,question_list):
    obj = {}
    section_detail = active_section.section_details
    section_time = None
    if section_detail.section_time:
        section_time = section_detail.section_time * 60

    if section_detail.percentile_table:
        percentile_table_out = section_detail.percentile_table.table
    else:
        percentile_table_out = None


    obj =  {
        'id'                    :active_section.id
        ,'is_active'            :active_section.is_active
        ,'section_id'           :section_detail.id                    
        ,'name'                 :section_detail.name                    
        ,'is_eval_manual'       :section_detail.is_eval_manual
        ,'is_calculator'        :section_detail.is_calculator
        ,'section_time'         :section_time
        ,'percentile_table'     :percentile_table_out
        ,'order'                :section_detail.order
        ,'number_questions'     :section_detail.sectionquestions_set.all().count()
        ,'num_blank_allowed'    :section_detail.num_blank_allowed       
        ,'blank_negative_marks' :section_detail.blank_negative_marks    
        ,'instructions'         :section_detail.instructions
        ,'cutoff'               :section_detail.section_cutoff
        ,'sub_section_name'     :section_detail.sub_section_name
        ,'time_elapsed'         :active_section.time_elapsed
        ,'questions'            :question_list
        ,'highest_marks'        : active_section.highest_marks
        ,'average_marks'        : active_section.average_marks
        ,'percentile'           : active_section.percentile               
        ,'score'                : active_section.score
        ,'max_score'            : active_section.max_score
        ,'total_questions': active_section.total_questions          
        ,'total_correct': active_section.total_correct            
        ,'total_incorrect': active_section.total_incorrect          
        ,'total_unattempted': active_section.total_unattempted        
        ,'marks_correct_positive': active_section.marks_correct_positive   
        ,'marks_incorrect_negative': active_section.marks_incorrect_negative 
        ,'marks_blank_negative': active_section.marks_blank_negative     
        ,'cut_off_cleared': active_section.cut_off_cleared          
        ,'cut_off_exam': active_section.cut_off_exam             
        ,'percentile_no_negative': active_section.percentile_no_negative   
        ,'easy_correct': active_section.easy_correct             
        ,'easy_unattempted': active_section.easy_unattempted         
        ,'easy_incorrect': active_section.easy_incorrect           
        ,'easy_time_spent': active_section.easy_time_spent          
        ,'medium_correct': active_section.medium_correct           
        ,'medium_unattempted': active_section.medium_unattempted       
        ,'medium_incorrect': active_section.medium_incorrect         
        ,'medium_time_spent': active_section.medium_time_spent        
        ,'hard_correct': active_section.hard_correct             
        ,'hard_unattempted': active_section.hard_unattempted         
        ,'hard_incorrect': active_section.hard_incorrect           
        ,'hard_time_spent': active_section.hard_time_spent   
        ,'easy_correct_time_spent'              : active_section.easy_correct_time_spent          
        ,'medium_correct_time_spent'              : active_section.medium_correct_time_spent          
        ,'hard_correct_time_spent'              : active_section.hard_correct_time_spent          

    }
    return obj

def check_question_response(value,question_type):
    output = None
    error_message = "No Errors"
    error = False
    try:
        value = json.loads(value)   
        if value:
            if question_type == 'mcq_multiple':
                try:
                    print "1"
                    if (type(value['answer']) is list): 
                        try:
                            print "2"
                            if len(value['answer']) > 0:
                                print "3"
                                check = int(value['answer'][0])
                                print int(value['answer'][0])
                                output = value
                                print output
                            else:
                                print "4"
                                output = None
                        except:
                            print "6"
                            error = True
                            error_message = 'correct_dict should be a list of integer ids'
                    else:
                        print "7"
                        error = True
                        error_message = 'correct_dict should be a list of integer ids'
                except:
                    print "8"
                    error = True
                    error_message = 'Incorrect correct_dict | format : ' + str(correct_answer_dict_mcq_multiple)

            elif question_type == 'chooseorder':
                try:
                    if (type(value['answer']) is list): 
                        try:
                            if len(value['answer']) > 0:
                                check = int(value['answer'][0])
                                output = value
                            else:
                                output = None
                        except:
                            error = True
                            error_message = 'correct_dict should be a list of integer ids'
                    else:
                        error = True
                        error_message = 'correct_dict should be a list of integer ids'
                except:
                    error = True
                    error_message = 'Incorrect correct_dict | format : ' + str(correct_answer_dict_mcq_multiple)


            elif question_type == "mcq_single":
                try:
                    if value['answer'] != "":
                        check = int(value['answer'])
                        output = value
                    else:
                        output = None
                except:
                    error = True
                    error_message = 'Incorrect correct_dict | format : ' + str(correct_answer_dict_mcq_single)

            elif question_type == 'word':
                try:
                    answer = value['answer']
                    if (type(answer) is unicode):
                        try:
                            if value['answer'] != "":
                                answer = str(value['answer'])
                                output = value
                            else:
                                output = None
                        except:
                            error = True
                            error_message = "Error in answer type served"
                    else:
                        error = True
                        error_message = 'correct_dict should be a dict of string'
                except:
                    error = True
                    error_message = 'Incorrect correct_dict | format : ' + str(correct_answer_worddict)

            elif question_type == 'essay':
                try:
                    answer = value['answer']
                    if (type(answer) is unicode):
                        try:
                            if value['answer'] != "":
                                answer = str(value['answer'])
                                output = value
                            else:
                                output = None
                        except:
                            error = True
                            error_message = "Error in answer type served"
                    else:
                        error = True
                        error_message = 'correct_dict should be a dict of string'
                except:
                    error = True
                    error_message = 'Incorrect correct_dict | format : ' + str(correct_answer_worddict)

            elif question_type == "number":
                try:
                    answer = value['answer']
                    if (type(answer) is unicode):
                        try:
                            if value['answer'] != "":
                                answer = float(value['answer'])
                                output = value
                            else:
                                output = None
                        except:
                            error = True
                            error_message = "Cant' have a string in number question"
                    else:
                        error = True
                        error_message = 'correct_dict should be a dict of string'
                except:
                    error = True
                    error_message = 'Incorrect correct_dict | format : ' + str(correct_answer_numberdict)
            else:
                output = None
        else:
            output = None
    except:
        error = True
        error_message = "correct_dict value not a json"
    return {'output':output,'error': error, 'errormessage':error_message}

def complete_evaluate_test(request):
    obj = {}
    status = False
    message = "Request Recieved"
    filters = {}
    error = False
    error_message_list = []
    sectionout = []

    test_id     = get_param(request, 'test_id', None)
    to_evaluate = get_param(request, 'to_evaluate', None)
    # is_reevaluate = get_param(request, 'is_reevaluate', None)

    if test_id:
        try:
            test = ActiveTests.objects.get(id=test_id)
        except:
            error = True
            error_message_list.append("Invalid test_id")
    else:
        error = True
        error_message_list.append("Missing test_id")

    if not error:
        ts = time.time()
        completed_at = datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
        test.is_complete = True
        test.date_complete = completed_at
        test.save()
        sectionlist = test.activesections_set.all()

        test_marks_blank_negative    = 0
        test_total_correct           = 0
        test_total_incorrect         = 0
        test_total_unattempted       = 0
        test_marks_correct_positive  = 0
        test_marks_incorrect_negative= 0
        test_easy_correct            = 0
        test_easy_unattempted        = 0
        test_easy_incorrect          = 0
        test_easy_time_spent         = 0
        test_easy_correct_time_spent         = 0

        test_medium_correct          = 0
        test_medium_unattempted      = 0
        test_medium_incorrect        = 0
        test_medium_time_spent       = 0
        test_medium_correct_time_spent         = 0

        test_hard_correct            = 0
        test_hard_unattempted        = 0
        test_hard_incorrect          = 0
        test_hard_time_spent         = 0
        test_hard_correct_time_spent         = 0
        test_max_total_marks         = 0




        for sec in sectionlist:
            sec.is_active = False
            questions = None
            questions = sec.activequestions_set.all()

            complete_question_list = []            
            section_marks_blank_negative    = 0
            section_total_correct           = 0
            section_total_incorrect         = 0
            section_total_unattempted       = 0
            section_marks_correct_positive  = 0
            section_marks_incorrect_negative= 0
            section_easy_correct            = 0
            section_easy_unattempted        = 0
            section_easy_incorrect          = 0
            section_easy_time_spent         = 0
            section_easy_correct_time_spent         = 0
            section_medium_correct          = 0
            section_medium_unattempted      = 0
            section_medium_incorrect        = 0
            section_medium_time_spent       = 0
            section_medium_correct_time_spent         = 0
            section_hard_correct            = 0
            section_hard_unattempted        = 0
            section_hard_incorrect          = 0
            section_hard_correct_time_spent         = 0
            section_hard_time_spent         = 0
            max_total_marks                 = 0
            # question_list = []
            for ques in questions:
                section_question = ques.section_question
                question = section_question.question
                if to_evaluate == "1":
                    marks_rewarded = 0
                    max_total_marks = max_total_marks + section_question.positive_marks
                    if question.difficulty_user in ['5','6']:
                        section_hard_time_spent =  int(section_hard_time_spent) + int(ques.time_spent)
                    elif question.difficulty_user in ['3','4']:
                        section_medium_time_spent =  int(section_medium_time_spent) + int(ques.time_spent)
                    else:
                        section_easy_time_spent =  int(section_easy_time_spent) + int(ques.time_spent)
                    

                    if ques.question_status == "answered":
                        question.num_total_answered = question.num_total_answered + 1 
                        is_correct = check_answer(question=question,num_options_mcq=test.num_options_mcq,response=ques.answer_response)
                        ques.is_correct = is_correct
                        if is_correct:
                            marks_rewarded = section_question.positive_marks
                            question.num_correct_answered = question.num_correct_answered + 1 
                            section_total_correct = section_total_correct + 1
                            section_marks_correct_positive = section_marks_correct_positive + marks_rewarded

                            if question.difficulty_user in ['5','6']:
                                section_hard_correct =  section_hard_correct + 1
                                section_hard_correct_time_spent = int(section_hard_correct_time_spent) + int(ques.time_spent)
                            elif question.difficulty_user in ['3','4']:
                                section_medium_correct =  section_medium_correct + 1
                                section_medium_correct_time_spent = int(section_medium_correct_time_spent) + int(ques.time_spent)
                            else:
                                section_easy_correct =  section_easy_correct + 1
                                section_easy_correct_time_spent = int(section_easy_correct_time_spent) + int(ques.time_spent)


                        else:
                            marks_rewarded = -1 * section_question.negative_marks
                            section_total_incorrect = section_total_incorrect + 1
                            section_marks_incorrect_negative = section_marks_incorrect_negative - marks_rewarded

                            if question.difficulty_user in ['5','6']:
                                section_hard_incorrect =  section_hard_incorrect + 1
                            elif question.difficulty_user in ['3','4']:
                                section_medium_incorrect =  section_medium_incorrect + 1
                            else:
                                section_easy_incorrect =  section_easy_incorrect + 1
                            

                    else:
                        section_total_unattempted = section_total_unattempted + 1
                        if question.difficulty_user in ['5','6']:
                            section_hard_unattempted =  section_hard_unattempted + 1
                        elif question.difficulty_user in ['3','4']:
                            section_medium_unattempted =  section_medium_unattempted + 1
                        else:
                            section_easy_unattempted =  section_easy_unattempted + 1


                    ques.marks_rewarded = marks_rewarded
                    # ques.question_topic = question.topic.sub_category
                    ques.save()
                    question.save()
                
                complete_question_list.append(active_question_out(active_question=ques,solution=True,num_options_mcq=test.num_options_mcq))
                # print complete_question_list

            if to_evaluate == "1":
                if test.test_details.is_blank_negative == True and test.test_details.blank_negative_type == "sectional":
                    if (section_total_unattempted - sec.section_details.num_blank_allowed) > 0:
                        section_marks_blank_negative =  (section_total_unattempted - sec.section_details.num_blank_allowed) * sec.section_details.blank_negative_marks

                sec.total_correct           = section_total_correct           
                sec.total_incorrect         = section_total_incorrect         
                sec.total_unattempted       = section_total_unattempted       
                sec.total_questions         = (section_total_correct + section_total_incorrect + section_total_unattempted)
                sec.marks_correct_positive  = section_marks_correct_positive  
                sec.marks_incorrect_negative= section_marks_incorrect_negative
                        
                sec.easy_correct            = section_easy_correct            
                sec.easy_unattempted        = section_easy_unattempted        
                sec.easy_incorrect          = section_easy_incorrect          
                sec.easy_time_spent         = section_easy_time_spent         
                sec.easy_correct_time_spent       = section_easy_correct_time_spent       

                sec.medium_correct          = section_medium_correct          
                sec.medium_unattempted      = section_medium_unattempted      
                sec.medium_incorrect        = section_medium_incorrect        
                sec.medium_time_spent       = section_medium_time_spent       
                sec.medium_correct_time_spent       = section_medium_correct_time_spent       



                sec.hard_correct            = section_hard_correct            
                sec.hard_unattempted        = section_hard_unattempted        
                sec.hard_incorrect          = section_hard_incorrect          
                sec.hard_time_spent         = section_hard_time_spent 
                sec.hard_correct_time_spent = section_hard_correct_time_spent       

                section_score               = round(float(section_marks_correct_positive - section_marks_blank_negative - section_marks_incorrect_negative),2)
                sec.score                   = round(float(section_marks_correct_positive - section_marks_blank_negative - section_marks_incorrect_negative),2)
                sec.max_score               = round(max_total_marks,2)
                if sec.section_details.section_cutoff:
                    sec.cut_off_exam = sec.section_details.section_cutoff
                    if section_score > sec.section_details.section_cutoff:
                        sec.cut_off_cleared = True
                    else:
                        sec.cut_off_cleared = False
                else:
                    sec.cut_off_cleared = True

                if max_total_marks != 0:
                    percentage_marks = (float(section_marks_correct_positive - section_marks_blank_negative - section_marks_incorrect_negative)/float(max_total_marks)) * 100.0
                    percentage_marks_no_negative = (float(section_marks_correct_positive - section_marks_blank_negative)/float(max_total_marks)) * 100.0            
                else:
                    percentage_marks = 0   
                    percentage_marks_no_negative = 0      

                percentage_table = sec.section_details.percentile_table
                
                if percentage_table:
                    upper_limit = 0
                    lower_limit = 0

                    upper_limit_2 = 0
                    lower_limit_2 = 0
                    
                    if percentage_marks < 0:
                        percentile = percentage_table.table[0]['percentile']
                    elif percentage_marks > percentage_table.table[len(percentage_table.table)-1]['marks']:
                        percentile = percentage_table.table[len(percentage_table.table)-1]['percentile']
                    else:
                        prev_marks = -100
                        prev_percentile = 0
                        for cell in percentage_table.table:
                            if percentage_marks <= float(cell['marks']) and percentage_marks > float(prev_marks) :
                                upper_limit = float(cell['percentile'])
                                lower_limit = float(prev_percentile)
                            prev_marks = float(cell['marks'])
                            prev_percentile = float(cell['percentile'])
                        percentile = round(random.uniform(lower_limit,upper_limit),2)

                        # round(answer, 2)

                    if percentage_marks_no_negative < 0:
                        percentile_no_neg = percentage_table.table[0]['percentile']
                    elif percentage_marks_no_negative > percentage_table.table[len(percentage_table.table)-1]['marks']:
                        percentile_no_neg = percentage_table.table[len(percentage_table.table)-1]['percentile']
                    else:
                        prev_marks = -100
                        prev_percentile = 0
                        for cell in percentage_table.table:
                            if percentage_marks_no_negative <= float(cell['marks']) and percentage_marks_no_negative > float(prev_marks) :
                                upper_limit_2 = float(cell['percentile'])
                                lower_limit_2 = float(prev_percentile)
                            prev_marks = float(cell['marks'])
                            prev_percentile = float(cell['percentile'])
                        percentile_no_neg = round(random.uniform(lower_limit_2,upper_limit_2),2)                    


                    avg_marks = None
                    max_marks = None
                    for cell in percentage_table.table:
                        if float(cell['percentile']) == 50:
                            avg_marks = float(cell['marks']) * max_total_marks / 100
                        if float(cell['percentile']) == 100:
                            max_marks = float(cell['marks']) * max_total_marks / 100


                    sec.highest_marks = round(max_marks,2)
                    sec.average_marks = round(avg_marks,2)

                    sec.percentile = round(percentile,2)
                    sec.percentile_no_negative = round(percentile_no_neg,2)
                    


                sec.save()



                test_marks_blank_negative    = test_marks_blank_negative    + section_marks_blank_negative    
                test_total_correct           = test_total_correct           + section_total_correct           
                test_total_incorrect         = test_total_incorrect         + section_total_incorrect         
                test_total_unattempted       = test_total_unattempted       + section_total_unattempted       
                test_marks_correct_positive  = test_marks_correct_positive  + section_marks_correct_positive  
                test_marks_incorrect_negative= test_marks_incorrect_negative+ section_marks_incorrect_negative
                test_easy_correct            = test_easy_correct            + section_easy_correct            
                test_easy_unattempted        = test_easy_unattempted        + section_easy_unattempted        
                test_easy_incorrect          = test_easy_incorrect          + section_easy_incorrect          
                test_easy_time_spent         = int(test_easy_time_spent)         + int(section_easy_time_spent)         
                test_east_correct_time_spent       = int(test_easy_correct_time_spent)       + int(section_easy_correct_time_spent)

                test_medium_correct          = test_medium_correct          + section_medium_correct          
                test_medium_unattempted      = test_medium_unattempted      + section_medium_unattempted      
                test_medium_incorrect        = test_medium_incorrect        + section_medium_incorrect        
                test_medium_time_spent       = int(test_medium_time_spent)       + int(section_medium_time_spent)       
                test_medium_correct_time_spent       = int(test_medium_correct_time_spent)       + int(section_medium_correct_time_spent)

                test_hard_correct            = test_hard_correct            + section_hard_correct            
                test_hard_unattempted        = test_hard_unattempted        + section_hard_unattempted        
                test_hard_incorrect          = test_hard_incorrect          + section_hard_incorrect          
                test_hard_time_spent         = int(test_hard_time_spent)         + int(section_hard_time_spent)         
                test_hard_correct_time_spent       = int(test_hard_correct_time_spent)       + int(section_hard_correct_time_spent)

                test_max_total_marks         = test_max_total_marks         + max_total_marks                 
            sectionout.append(active_section_out(active_section=sec,question_list=complete_question_list))

        if to_evaluate == "1":
            if test.test_details.is_blank_negative == True and test.test_details.blank_negative_type == "overall":
                if (test_total_unattempted - test.test_details.num_blank_allowed) > 0:
                    test_marks_blank_negative =  (test_total_unattempted - test.test_details.num_blank_allowed) * test.test_details.blank_negative_marks

            test.total_correct           = test_total_correct           
            test.total_incorrect         = test_total_incorrect         
            test.total_unattempted       = test_total_unattempted       
            test.total_questions         = (test_total_correct + test_total_incorrect + test_total_unattempted)
            test.marks_correct_positive  = test_marks_correct_positive  
            test.marks_incorrect_negative= test_marks_incorrect_negative
            test.easy_correct            = test_easy_correct            
            test.easy_unattempted        = test_easy_unattempted        
            test.easy_incorrect          = test_easy_incorrect          
            test.easy_time_spent         = test_easy_time_spent  
            test.easy_correct_time_spent       = test_easy_correct_time_spent  

            test.medium_correct          = test_medium_correct          
            test.medium_unattempted      = test_medium_unattempted      
            test.medium_incorrect        = test_medium_incorrect        
            test.medium_time_spent       = test_medium_time_spent  
            test.medium_correct_time_spent       = test_medium_correct_time_spent  

            test.hard_correct            = test_hard_correct            
            test.hard_unattempted        = test_hard_unattempted        
            test.hard_incorrect          = test_hard_incorrect          
            test.hard_time_spent         = test_hard_time_spent
            test.hard_correct_time_spent = test_hard_correct_time_spent  

            test_score                   = round(float(test_marks_correct_positive - test_marks_blank_negative - test_marks_incorrect_negative),2)
            test.score                   = round(float(test_marks_correct_positive - test_marks_blank_negative - test_marks_incorrect_negative),2)
            test.max_score               = round(test_max_total_marks,2)

            if test.test_details.test_cutoff:
                test.cut_off_exam = test.test_details.test_cutoff
                if test_score > test.test_details.test_cutoff:
                    test.cut_off_cleared = True
                else:
                    test.cut_off_cleared = False
            else:
                test.cut_off_cleared = True
            if test_max_total_marks > 0 :
                percentage_marks = (float(test_marks_correct_positive - test_marks_blank_negative - test_marks_incorrect_negative)/float(test_max_total_marks)) * 100.0
                percentage_marks_no_negative = (float(test_marks_correct_positive - test_marks_blank_negative)/float(test_max_total_marks)) * 100.0            
            else:
                percentage_marks = 0 
                percentage_marks_no_negative = 0 

            percentage_table = test.test_details.percentile_table
            
            if percentage_table:
                upper_limit = 0
                lower_limit = 0

                upper_limit_2 = 0
                lower_limit_2 = 0
                
                if percentage_marks < 0:
                    percentile = percentage_table.table[0]['percentile']

                elif percentage_marks > percentage_table.table[len(percentage_table.table)-1]['marks']:
                    percentile = percentage_table.table[len(percentage_table.table)-1]['percentile']

                else:
                    prev_marks = -100
                    prev_percentile = 0
                    for cell in percentage_table.table:
                        if percentage_marks <= float(cell['marks']) and percentage_marks > float(prev_marks) :
                            upper_limit = float(cell['percentile'])
                            lower_limit = float(prev_percentile)
                        prev_marks = float(cell['marks'])
                        prev_percentile = float(cell['percentile'])
                    percentile = round(random.uniform(lower_limit,upper_limit),2)

                if percentage_marks_no_negative < 0:
                    percentile_no_neg = percentage_table.table[0]['percentile']

                elif percentage_marks_no_negative > percentage_table.table[len(percentage_table.table)-1]['marks']:
                    percentile_no_neg = percentage_table.table[len(percentage_table.table)-1]['percentile']

                else:
                    prev_marks = -100
                    prev_percentile = 0
                    for cell in percentage_table.table:
                        if percentage_marks_no_negative <= float(cell['marks']) and percentage_marks_no_negative > float(prev_marks) :
                            upper_limit_2 = float(cell['percentile'])
                            lower_limit_2 = float(prev_percentile)
                        prev_marks = float(cell['marks'])
                        prev_percentile = float(cell['percentile'])
                    percentile_no_neg = round(random.uniform(lower_limit_2,upper_limit_2),2)                    
                test.percentile = round(percentile,2)
                test.percentile_no_negative = round(percentile_no_neg,2)

                avg_marks = None
                max_marks = None
                for cell in percentage_table.table:
                    if float(cell['percentile']) == 50:
                        avg_marks = float(cell['marks']) * max_total_marks / 100
                    if float(cell['percentile']) == 100:
                        max_marks = float(cell['marks']) * max_total_marks / 100

                test.highest_marks = round(max_marks,2)
                test.average_marks = round(avg_marks,2)

            test.save()
            message = "Evaluation Complete!"
            status = True
        else:
            message = "Read analysis!"
            status = True

        testdetails = test.test_details
        if testdetails.category:
            category_out = json.loads(str(testdetails.category))
        else:
            category_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))
        
        if testdetails.percentile_table:
            percentile_table_out = testdetails.percentile_table.table
        else:
            percentile_table_out = None

        testout = {
                 'user'                         :json.loads(str(test.user))
                ,'is_complete'                  :test.is_complete
                ,'id'                           :test.id
                ,'time_elapsed'                 :test.time_elapsed
                ,'test_name'                    :testdetails.test_name                  
                ,'scheduled_for'                :str(testdetails.scheduled_for)              
                ,'is_section_sequence_choose'   :testdetails.is_section_sequence_choose 
                ,'is_sectional_jump'            :testdetails.is_sectional_jump          
                ,'time_calculation'             :testdetails.time_calculation           
                ,'total_time'                   :testdetails.total_time
                ,'is_question_jump'             :testdetails.is_question_jump           
                ,'is_pausable'                  :testdetails.is_pausable    
                ,'is_pausable'                  :testdetails.is_pausable                
                ,'timer_type'                   :testdetails.timer_type 
                ,'category'                     :category_out
                ,'interface_type'               :testdetails.interface_type             
                ,'is_blank_negative'            :testdetails.is_blank_negative          
                ,'blank_negative_type'          :testdetails.blank_negative_type        
                ,'num_blank_allowed'            :testdetails.num_blank_allowed          
                ,'blank_negative_marks'         :testdetails.blank_negative_marks       
                ,'instructions'                 :test.instructions               
                ,'num_options_mcq'              :test.num_options_mcq            
                ,'is_live'                      :testdetails.is_live
                ,'comments'                     :testdetails.comments
                ,'cutoff'                       :testdetails.test_cutoff
                ,'analysis'                     :testdetails.test_analysis
                ,'score'                        : test.score               
                ,'max_score'                    : test.max_score               
                ,'percentile'                   : test.percentile               
                ,'date_start'                   : str(test.date_start)
                ,'date_complete'                : str(test.date_complete)            
                ,'total_questions'              : test.total_questions          
                ,'total_correct'                : test.total_correct            
                ,'total_incorrect'              : test.total_incorrect          
                ,'total_unattempted'            : test.total_unattempted        
                ,'marks_correct_positive'       : test.marks_correct_positive   
                ,'marks_incorrect_negative'     : test.marks_incorrect_negative 
                ,'marks_blank_negative'         : test.marks_blank_negative     
                ,'highest_marks'                : test.highest_marks
                ,'average_marks'                : test.average_marks
                ,'cut_off_cleared'              : test.cut_off_cleared          
                ,'cut_off_exam'                 : test.cut_off_exam             
                ,'percentile_no_negative'       : test.percentile_no_negative   
                ,'easy_correct'                 : test.easy_correct             
                ,'easy_unattempted'             : test.easy_unattempted         
                ,'easy_incorrect'               : test.easy_incorrect           
                ,'easy_time_spent'              : test.easy_time_spent          
                ,'medium_correct'               : test.medium_correct           
                ,'medium_unattempted'           : test.medium_unattempted       
                ,'medium_incorrect'             : test.medium_incorrect         
                ,'medium_time_spent'            : test.medium_time_spent        
                ,'hard_correct'                 : test.hard_correct             
                ,'hard_unattempted'             : test.hard_unattempted         
                ,'hard_incorrect'               : test.hard_incorrect           
                ,'hard_time_spent'              : test.hard_time_spent
                ,'percentile_table'              : percentile_table_out         
                ,'easy_correct_time_spent'              : test.easy_correct_time_spent          
                ,'medium_correct_time_spent'              : test.medium_correct_time_spent          
                ,'hard_correct_time_spent'              : test.hard_correct_time_spent          
            }



        # if is_reevaluate == "1":
        #     pass
        # else:
        #     for sec in sectionlist:
        #         sec.activequestions_set.all().delete()

    obj['result'] = {
            'test':testout,
            'sections':sectionout
        }
    obj['filter'] = filters
    obj['message'] = message
    obj['status'] = status
    obj['error'] = error
    obj['error_list'] = error_message_list
    return HttpResponse(json.dumps(obj), content_type='application/json')


def crud_activetest(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = ActiveTests.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_default)
    if not check_operation['error']:
        if operation == "read":
            out_read_activetest = read_activetest(request) 
            message = out_read_activetest['message']               
            tranObjs = out_read_activetest['output']
            error_message_list.extend(out_read_activetest['error_message_list'])               
            error = out_read_activetest['error']     
            num_pages = out_read_activetest['num_pages']          
            filters = out_read_activetest['filter']     
            total_records = out_read_activetest['total_records']          
            status = out_read_activetest['success']     

        if operation == "delete":
            out_delete_activetest = delete_activetest(request)
            message = out_delete_activetest['message']
            error = out_delete_activetest['error']
            tranObjs = out_delete_activetest['output']
            error_message_list.extend(out_delete_activetest['error_message_list'])
            status = out_delete_activetest['success']          
        
        # if operation == "report":
        #     out_report_activetest = report_activetest(request)
        #     message = out_report_activetest['message']
        #     error = out_report_activetest['error']
        #     tranObjs = out_report_activetest['output']
        #     error_message_list.extend(out_report_activetest['error_message_list'])
        #     status = out_report_activetest['success']          
        
        if not error:
            for trans in tranObjs:
                if trans.user:
                    user_out = json.loads(str(trans.user))
                else:
                    user_out = json.loads(str(json.dumps({'id':'','first_name':'' ,'last_name':'','email':''})))
                
                result.append({
                            'id':trans.id,
                            'user':user_out,
                            'is_complete':trans.is_complete,
                            'score':trans.score,
                            'percentile':trans.percentile,
                            'time_elapsed':trans.time_elapsed,
                            'date_start':str(trans.date_start)[:10],
                            'date_complete':str(trans.date_complete)[:10],
                            'created_at':str(trans.created_at)[:16],
                            'modified_at':str(trans.modified_at)[:16],
                            'test_name':trans.test_details.test_name
                        })                
    else:
        error = check_operation['error']
        message = "Operation Not Specified"
        error_message_list.append(check_operation['errormessage'])
  
    obj['result'] = result
    obj['filter'] = filters
    obj['num_pages'] = num_pages
    obj['total_records'] = total_records
    obj['message'] = message
    obj['status'] = status
    obj['error'] = error
    obj['error_list'] = error_message_list

    return HttpResponse(json.dumps(obj), content_type='application/json')


def delete_activetest(request):
    error = False
    success = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output = ActiveTests.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            test = ActiveTests.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if test:
            test.delete()
            message = "User Test Deleted"
            success = True
        else:
            message = "User Test Not Found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}


def report_activetest(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = ActiveTests.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 

    test_id             = get_param(request, 'test_id', None)
    section_id          = get_param(request, 'section_id',None)
    output = ActiveTests.objects.none()
    message = "Request Recieved"
    if test_id:
        try:
            test = ActiveTests.objects.get(id=test_id)
        except:
            error=True
            error_message_list.append('Incorrect test_id')

    else:
        error = True
        error_message_list.append('Missing test_id')

    if section_id:
        try:
            section = ActiveSections.objects.get(id=section_id)
        except:
            error=True
            error_message_list.append('Incorrect section_id')
    

    if not error: 
        if section_id:
            questions_list = section.activequestions_set.all()
        else:
            questions_list = test.activequestions_set.all()

        # print questions_list
        # category_list = questions_list.values('question_sub_category')
        category_list = []
        for ques in questions_list:
            if ques.question_sub_category not in category_list:
                category_list.append(ques.question_sub_category)
            
        # category_list = map(lambda x : ,questions_list.values('question_sub_category'))
        # category_list = {v['question_sub_category']:v for v in category_list}.values()
        print category_list
        max_accuracy = None
        max_efficiency = None
        for cat in category_list:
            # print dict(cat)
            print cat
            # new_cat = dict(cat)
            # print new_cat.question_sub_category
            sub_question_list = questions_list.filter(question_sub_category = cat)
            # print sub_question_list
            category = sub_question_list[0].question_category
            total_time_spent = sub_question_list.aggregate(Sum('time_spent'))['time_spent__sum']
            total_count      = sub_question_list.count()
            total_count_true = sub_question_list.filter(is_correct = True).count()
            avg_time         = float(total_time_spent)/float(total_count)
            accuracy         = float(total_count_true)/float(total_count)
            if accuracy > max_accuracy:
                max_accuracy = accuracy

            if avg_time > max_efficiency:
                max_efficiency = avg_time
            result.append({
                            'question_sub_category':cat.capitalize() ,
                            'question_category':category.capitalize() ,
                            'total_time_spent':total_time_spent,
                            'total_count':total_count,
                            'total_count_true':total_count_true,
                            'avg_time':round(avg_time,0),
                            'accuracy':round(accuracy,2)
                        })                
        status= True
        message = "Report generated"
    else:
        message = "Errors | Refer Error List!"

    obj['result'] = {'topicreport': result, 'max_accuracy':max_accuracy, 'max_efficiency':max_efficiency}
    obj['filter'] = filters
    obj['num_pages'] = num_pages
    obj['total_records'] = total_records
    obj['message'] = message
    obj['status'] = status
    obj['error'] = error
    obj['error_list'] = error_message_list
    return HttpResponse(json.dumps(obj), content_type='application/json')



def read_activetest(request):
    error = False
    error_message_list = []
    success = False
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    total_records = 0 
    page_num = get_param(request, 'page_num', "1")
    page_size = get_param(request, 'page_size', "10")
    data_id = get_param(request,'data_id',None)    
    search = get_param(request,'search',None) 
    sort_by = get_param(request,'sort_by',None) 
    order = get_param(request,'order_by',None)  
    tranObjs = ActiveTests.objects.none()
    if data_id != None and data_id != "":
        try:
            tranObjs = ActiveTests.objects.filter(id=data_id)
        except:
            error = True
            error_message_list.append("Incorrect data_id")
    else:
        tranObjs = ActiveTests.objects.order_by('-date_complete')
        
        # Filters/Sorting Start
        if search !=None and search !="":
            tranObjs = tranObjs.filter(Q(email__icontains=search) | Q(first_name__icontains=search)  | Q(last_name__icontains=search)  | Q(test_name__icontains=search))
        
        if sort_by !=None and sort_by !="" and sort_by != "none":
            if order == "asc":
                tranObjs = tranObjs.order_by(sort_by)
            else:
                tranObjs = tranObjs.order_by("-" + sort_by)
        # Filters/Sorting End
    # pagination variable
    
    num_pages = 1
    total_records = tranObjs.count()    
    if page_num != None and page_num != "":
        page_num = int(page_num)
        tranObjs = Paginator(tranObjs, int(page_size))
        try:
            tranObjs = tranObjs.page(page_num)
        except:
            tranObjs = tranObjs
        num_pages = int(math.ceil(total_records / float(int(page_size))))
    # data = list(tranObjs)
    message = "Success"
    total_records = total_records

    filters['sort_by'] = [
                            {'value':'created_at','label':'Created At'},
                            {'value':'modified_at','label':'Modified At'}
                        ]
    filters['order_by'] = [
                            {'value':'asc','label':'Ascending'},
                            {'value':'desc','label':'Descending'}
                            ]    

    if not error:
        success = True
        message = "Success!"
        return({
            'output':tranObjs,
            'num_pages':num_pages,
            'total_records':total_records,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'message':message,
            'success': success
        })
    else:
        success = False
        message = "Errors | Refer error list"
        return({
            'output':ActiveTests.objects.none(),
            'num_pages':1,
            'total_records':0,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'success':success,
            'message':message
        })








# answer_option_dict = {
#        "options":[
#             {"id":"1","value":"option 1"},
#             {"id":"2","value":"option 2"},
#             {"id":"3","value":"option 3"},
#             {"id":"4","value":"option 4"},
#             {"id":"5","value":"option 5"},
#             {"id":"6","value":"option 6"},
#         ]
# }
# question_type = "mcq_multiple"
# correct_answer = {
#     'answer':["2","3","4"]
# }
# question_type = "mcq_single"
# correct_answer = {
#     'answer':"3"
# }

# question_type = "chooseorder"
# correct_answer = {
#     'answer':"answer"
# }

# question = {
#     'answer_options':answer_option_dict,
#     'question_type' :question_type,
#     'correct_answer' :correct_answer
# }

# num_options_mcq = 4
# test = {
#     'num_options_mcq':num_options_mcq
# }




def handleanswer_options(question,num_options_mcq):
    answer_option_dict = question.answer_options
    question_type = question.question_type
    correct_answer = question.correct_answer
    num_mcq_allowed = num_options_mcq

    output_answer_options = {}
    output_answer_options['option_dict'] = {}
    output_answer_options['correct_dict'] = {}
    intermediate_answer_options = []
    
    if question_type == "mcq_multiple":
        len_answer_options = len(answer_option_dict['options'])
        if num_mcq_allowed > len_answer_options:
            num_to_remove = 0
        else:
            num_to_remove = len_answer_options - num_mcq_allowed
        removed = 0
        intermediate_answer_options.extend(answer_option_dict['options'])
        out_answer_option = []
        out_correct_answer = []
        out_answer_option.extend(answer_option_dict['options'])
        out_correct_answer.extend(correct_answer['answer'])
        intermediate_answer_options.reverse()
        if removed < num_to_remove:
            for option in intermediate_answer_options:
                # print option              
                if removed < num_to_remove:
                    if option['id'] not in correct_answer['answer']:
                        if option in out_answer_option:
                            out_answer_option.remove(option)
                            removed = removed + 1

        if removed < num_to_remove:
            for option in intermediate_answer_options:
                # print option
                if removed < num_to_remove:
                    if option in out_answer_option:
                        out_answer_option.remove(option)
                        out_correct_answer.remove(option['id'])
                        removed = removed + 1

        output_answer_options['option_dict']['options'] = out_answer_option
        output_answer_options['correct_dict']['answer'] = out_correct_answer
    elif question_type == "mcq_single":
        len_answer_options = len(answer_option_dict['options'])
        if num_mcq_allowed > len_answer_options:
            num_to_remove = 0
        else:
            num_to_remove = len_answer_options - num_mcq_allowed
        removed = 0
        intermediate_answer_options.extend(answer_option_dict['options'])
        out_answer_option = []
        out_correct_answer = []
        out_answer_option.extend(answer_option_dict['options'])
        out_correct_answer = correct_answer['answer']
        intermediate_answer_options.reverse()
        if removed < num_to_remove:
            for option in intermediate_answer_options:
                # print option              
                if removed < num_to_remove:
                    if option['id'] not in correct_answer['answer']:
                        if option in out_answer_option:
                            out_answer_option.remove(option)
                            removed = removed + 1
        output_answer_options['option_dict']['options'] = out_answer_option
        output_answer_options['correct_dict']['answer'] = out_correct_answer
    elif question_type == "chooseorder":
        output_answer_options['option_dict'] = answer_option_dict
        output_answer_options['correct_dict']['answer'] = {}
    else:
        output_answer_options['option_dict'] = {}
        output_answer_options['correct_dict'] = correct_answer
    return output_answer_options








def check_answer(question,num_options_mcq,response):
    output_answer = handleanswer_options(question=question,num_options_mcq=num_options_mcq)
    is_correct = True
    # try:
    if question.question_type not in ['chooseorder','essay']:
        response_answer = response['answer']
        correct_answer  = output_answer['correct_dict']['answer']

    if question.question_type == "mcq_single":
        if correct_answer != response_answer:
            is_correct = False

    elif question.question_type == "mcq_multiple":
        len_response = len(response_answer)
        len_correct  = len(correct_answer)
        if len_response == len_correct:
            for ans in correct_answer:
                if ans not in response_answer:
                    is_correct = False
        else:
            is_correct = False

    elif question.question_type == "word":
        if fuzz.ratio(response_answer.lower(), correct_answer.lower()) <= 90:
            is_correct = False  

    elif question.question_type == "number":
        if float(response_answer) != float(correct_answer):
            is_correct = False
    else:
        is_correct = True

    return is_correct




