from django.shortcuts import render
from django.http import HttpResponseRedirect,HttpResponseForbidden,HttpResponse
from django.core.paginator import Paginator
from django.core import serializers
from models import *
from coursemgmt.models import Courses
from django.db.models import Q
from overall.views import get_param,cleanstring
import math
import json
import time
from datetime import datetime
import operator
from overall.views import booleanvar_check, listvar_check, intvar_check, floatvar_check, boolean_fields
from questionmgmt.views import create_update_question, delete_question, no_evaluable_questions,evaluable_questions
import urllib
from questionmgmt.models import Questions
from testactivity.models import ActiveTests
from validate_email import validate_email

time_calculation_allowed   = ['overall','sectional','untimed']  
time_type_allowed         = ['remaining','elapsed'] 
interface_type_allowed     = ['nmat','general']  
blank_negative_type_allowed = ['overall','sectional']  
operations_allowed_default   = ['create','read','update','delete']
operations_allowed_section = ['create','read','update','delete','copy','validate','order_change','complete','instructions']
operations_allowed_test = ['create','read','update','delete','move','live','validate','instructions','analysis','add_course','remove_course']

section_movement_allowed = ['up','down']
test_category_allowed   = ['overall','sectional','topicwise']
num_options_mcq_allowed = ['2','3','4','5','6','7','8','9','10']


# Create your views here.



# <------------- CRUD Test Folder Start ---------------->

def crud_testfolders(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = TestFolder.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_default)
    if not check_operation['error']:
        if operation == "read":
            out_read_testfolders = read_testfolders(request) 
            message = out_read_testfolders['message']               
            tranObjs = out_read_testfolders['output']
            error_message_list.extend(out_read_testfolders['error_message_list'])               
            error = out_read_testfolders['error']     
            num_pages = out_read_testfolders['num_pages']          
            filters = out_read_testfolders['filter']     
            total_records = out_read_testfolders['total_records']          
            status = out_read_testfolders['success']          
        
        if operation in ["create","update"]:  
            out_create_update_testfolder = create_update_testfolder(request=request)
            message = out_create_update_testfolder['message']
            error = out_create_update_testfolder['error']
            tranObjs = out_create_update_testfolder['output']
            error_message_list.extend(out_create_update_testfolder['error_message_list'])
            status = out_create_update_testfolder['success']          

        if operation == "delete":
            out_delete_testfolder = delete_testfolder(request)
            message = out_delete_testfolder['message']
            error = out_delete_testfolder['error']
            tranObjs = out_delete_testfolder['output']
            error_message_list.extend(out_delete_testfolder['error_message_list'])
            status = out_delete_testfolder['success']          
        
        if not error:
            for trans in tranObjs:
                result.append({
                            'id':trans.id,
                            'folder_name':trans.folder_name,
                            'description':trans.description,
                            'created_at':str(trans.created_at)[:16],
                            'modified_at':str(trans.modified_at)[:16]
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

def create_update_testfolder(request):
    error = False
    error_message_list = []
    output = TestFolder.objects.none()
    success = False
    message = "Request Recieved"
    folder_name  = get_param(request, 'folder_name', None)
    description  = get_param(request,'desc',None)
    operation = get_param(request, 'operation', None)
    data_id      = get_param(request, 'data_id', None)

    if folder_name == None or folder_name == "":
        error = True
        error_message_list.append("Missing folder_name")
    else:
        # folder_name  = cleanstring(folder_name.lower())
        folder_name  = cleanstring(folder_name)
    
    if description == None or description == "":
        pass
        # error = True
        # error_message_list.append("Missing desc")
    else:
        description  = cleanstring(description)
    
    if operation == "update":
        if data_id:
            try:
                testfolder = TestFolder.objects.get(id=data_id)                    
            except:
                error = True
                error_message_list.append("Invalid data_id")
                testfolder = TestFolder.objects.none()
        else:
            error = True
            error_message_list.append("Missing data_id")

    if not error:
        if operation == "create":
            testfolder = TestFolder.objects.filter(folder_name=folder_name)
            if testfolder.count() > 0:
                message = "Test Bank already exists"
                success = False                
                output = testfolder
            else:
                testfoldernew = TestFolder.objects.create(
                    folder_name            = folder_name,
                    description            = description,
                )
                output = [testfoldernew]
                success = True
                message = "Test Bank Created"
        else:
            if TestFolder.objects.filter(folder_name = folder_name).count() > 1 :
                success = False
                message = "Test bank already exist"
                output = []
            elif TestFolder.objects.filter(folder_name = folder_name).count() == 1 :                
                if testfolder.id == TestFolder.objects.filter(folder_name = folder_name)[0].id:
                    testfolder.folder_name            = folder_name
                    testfolder.description            = description
                    testfolder.save()
                    output = [testfolder]
                    message = "Test Bank Updated"
                    success = True
                else:  
                    success = False
                    message = "Test bank already exist"
                    output = []
            else:
                testfolder.folder_name            = folder_name
                testfolder.description            = description
                testfolder.save()
                output = [testfolder]
                message = "Test Bank Updated"
                success = True
 
 
            # if TestFolder.objects.filter(folder_name = folder_name).count() > 0 :
            #     success = False
            #     message = "Test Bank already exist"
            #     output = []
            # else:
            
            #     testfolder.folder_name            = folder_name
            #     testfolder.description            = description
            #     testfolder.save()
            #     output = [testfolder]
            #     message = "Test Bank Updated"
            #     success = True
    else:
        message = "Error | Refer error list"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}    

def read_testfolders(request):
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
    tranObjs = TestFolder.objects.none()
    if data_id != None and data_id != "":
        try:
            tranObjs = TestFolder.objects.filter(id=data_id)
        except:
            error = True
            error_message_list.append("Incorrect data_id")
    else:
        tranObjs = TestFolder.objects.all().order_by('folder_name')
        # Filters/Sorting Start
        if search !=None and search !="":
            tranObjs = tranObjs.filter(Q(folder_name__icontains=search) | Q(description__icontains=search))
        
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
                            {'value':'folder_name','label':'Folder Name'},
                            {'value':'description','label':'Description'}
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
            'output':TestFolder.objects.none(),
            'num_pages':1,
            'total_records':0,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'success':success,
            'message':message
        })

def delete_testfolder(request):
    error = False
    success = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output = TestFolder.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            testfolder = TestFolder.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if testfolder:
            testfolder.delete()
            message = "Test Bank Deleted"
            success = True
        else:
            message = "Test Bank Not Found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

# <------------- CRUD Test Folder End ---------------->
#<----------------- Test Category CRUD Start --------------------------->
def create_update_testcategory(request):
    error = False
    success = False
    error_message_list = []
    output = TestCategory.objects.none()
    message = "Request Recieved"
    operation          = get_param(request, 'operation', None)
    category           = get_param(request, 'category', None)      
    sub_category       = get_param(request, 'sub_category', None)      
    description        = get_param(request, 'description', None)  
    data_id        = get_param(request, 'data_id', None)      
    # user fields check and correction
    if sub_category:
        sub_category = cleanstring(sub_category.lower())
    else:
        error = True
        error_message_list.append("Missing sub_category")                               

    if description:
        description = cleanstring(description)
    else:
        pass
        # error = True
        # error_message_list.append("Missing description")                               

        
    check_category = listvar_check(variable_name="",value=category, allowedlist=test_category_allowed)     
    if not check_category['error']:
        category = check_category['output']
    else:
        error = check_category['error']
        error_message_list.append(check_category['errormessage'])

    if operation == "update":
        if data_id:
            try:
                testcategory = TestCategory.objects.get(id=data_id)
            except:
                error = True
                error_message_list = ['invalid data_id']
        else:
            error = True
            error_message_list = ['missing data_id']
        
    if not error: 
        if operation == "create":
            testcategorys = TestCategory.objects.filter(category=category,sub_category=sub_category)
            if testcategorys.count() > 0:
                message = "Category Already Exists!"        
                output = testcategorys
                success = False
            else:
                testcategory = TestCategory.objects.create(
                    category                   = category                 
                    ,sub_category              = sub_category             
                    ,description               = description                 
                )
                output = [testcategory]
                success = True
                message = "Test Category Created!"
        else:
            testcategory.category           = category                 
            testcategory.sub_category       = sub_category             
            testcategory.description        = description
            testcategory.save()
            output = [testcategory]
            success = True
            message = "Test Category Updated!"
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def delete_testcategory(request):
    error = False
    success = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output = TestCategory.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            testcat = TestCategory.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if testcat:
            testcat.delete()
            message = "Test Category Deleted"
            success = True
        else:
            message = "Test not found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def read_testcategory(request):
    output = TestCategory.objects.none()
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    total_records = 0 

    page_num = get_param(request, 'page_num', "1")
    page_size = get_param(request, 'page_size', "10")
    search = get_param(request,'search',None) 
    sort_by = get_param(request,'sort_by',None) 
    order = get_param(request,'order_by',None)    
    category = get_param(request,'category',None) 
    data_id = get_param(request,'data_id',None)    
    
    if data_id != None and data_id != "":
        tranObjs = TestCategory.objects.filter(id=data_id)
    else:
        tranObjs = TestCategory.objects.all()

        if category !=None and category !="" and category != "none":
            category_list = category.split(",")
            tranObjs = tranObjs.filter(category__in=category_list)

        # Filters/Sorting Start
        if search !=None and search !="":
            tranObjs = tranObjs.filter(Q(category__icontains=search) | Q(sub_category__icontains=search))

        if sort_by !=None and sort_by !="" and sort_by != "none":
            if order == "asc":
                tranObjs = tranObjs.order_by(sort_by)
            else:
                tranObjs = tranObjs.order_by("-" + sort_by)
        # Filters/Sorting End
    # pagination variable

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
    message  = "Success!"
    success = True
    filters['category'] = []

    for item in test_category_allowed:
        filters['category'].append({
            'value':item,
            'label':(item).title()
            })

    filters['sort_by'] = [
                        {'value':'category','label':'Category'},
                        {'value':'sub_category','label':'Sub Category'},
                       ]
    filters['order_by'] = [{'value':'asc','label':'Ascending'},
                           {'value':'desc','label':'Descending'}]
    

    return({
        'output':tranObjs,
        'num_pages':num_pages,
        'total_records':total_records,
        'error':error,
        'error_message_list':error_message_list,
        'filter':filters,
        'message':message,
        'success':success
    })

def crud_testcategory(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = TestCategory.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_default)
    if not check_operation['error']:
        if operation == "read":
            out_read_testcategory = read_testcategory(request) 
            message = out_read_testcategory['message']               
            tranObjs = out_read_testcategory['output']
            error_message_list.extend(out_read_testcategory['error_message_list'])               
            error = out_read_testcategory['error']     
            status = out_read_testcategory['success']     
            num_pages     = out_read_testcategory['num_pages']          
            filters       = out_read_testcategory['filter']     
            total_records = out_read_testcategory['total_records']          

        if operation in ["create","update"]:
            out_create_update_testcategory = create_update_testcategory(request) 
            message = out_create_update_testcategory['message']               
            tranObjs = out_create_update_testcategory['output']
            error_message_list.extend(out_create_update_testcategory['error_message_list'])               
            error = out_create_update_testcategory['error']   
            status = out_create_update_testcategory['success']          

        if operation == "delete":
            out_delete_testcategory = delete_testcategory(request) 
            message = out_delete_testcategory['message']               
            tranObjs = out_delete_testcategory['output']               
            error_message_list.extend(out_delete_testcategory['error_message_list'])               
            error = out_delete_testcategory['error']     
            status = out_delete_testcategory['success']           

        if not error:
            for trans in tranObjs:
                result.append({
                        'id':trans.id,
                        'category':trans.category,
                        'sub_category':trans.sub_category,
                        'description':trans.description
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

#<----------------- Test Category CRUD End --------------------------->
#<----------------- Test CRUD Start --------------------------->
def crud_test(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = Tests.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    warning = []
    critical_errors = []
    user_email = None
    
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_test)
    if not check_operation['error']:

        if operation == "read":
            out_read_tests = read_tests(request) 
            message = out_read_tests['message']               
            tranObjs = out_read_tests['output']
            error_message_list.extend(out_read_tests['error_message_list'])               
            error = out_read_tests['error']     
            num_pages = out_read_tests['num_pages']          
            filters = out_read_tests['filter']  
            status = out_read_tests['success']        
            total_records = out_read_tests['total_records']  
            user_email =  out_read_tests['user_email']  
            

        if operation in ["create","update"]:
            out_create_update_test = create_update_test(request) 
            message = out_create_update_test['message']               
            tranObjs = out_create_update_test['output']
            error_message_list.extend(out_create_update_test['error_message_list'])               
            error = out_create_update_test['error']   
            status = out_create_update_test['success']     

        if operation == "delete":
            out_delete_test = delete_test(request) 
            message = out_delete_test['message']               
            tranObjs = out_delete_test['output']               
            error_message_list.extend(out_delete_test['error_message_list'])               
            error = out_delete_test['error']     
            status = out_delete_test['success']             

        if operation == "remove_course":
            out_add_remove_course = add_remove_course(request) 
            message = out_add_remove_course['message']               
            tranObjs = out_add_remove_course['output']               
            error_message_list.extend(out_add_remove_course['error_message_list'])               
            error = out_add_remove_course['error']     
            status = out_add_remove_course['success']             

        if operation == "add_course":            
            out_add_remove_course = add_remove_course(request) 
            message = out_add_remove_course['message']               
            tranObjs = out_add_remove_course['output']               
            error_message_list.extend(out_add_remove_course['error_message_list'])               
            error = out_add_remove_course['error']     
            status = out_add_remove_course['success']             


        if operation == "move":
            out_move_test = move_test(request)
            message = out_move_test['message']
            error = out_move_test['error']
            tranObjs = out_move_test['output']
            error_message_list.extend(out_move_test['error_message_list'])
            status = out_move_test['success']  
            
        if operation == "validate":  
            out_validate_test = validate_test(request=request)
            message = out_validate_test['message']
            error = out_validate_test['error']
            tranObjs = out_validate_test['output']
            error_message_list.extend(out_validate_test['error_message_list'])
            status = out_validate_test['success']          

        if operation == "live":  
            out_live_test = live_test(request=request)
            message = out_live_test['message']
            error = out_live_test['error']
            tranObjs = out_live_test['output']
            error_message_list.extend(out_live_test['error_message_list'])
            status = out_live_test['success']     
            warning = out_live_test['warnings']     
            critical_errors = out_live_test['critical_errors']       

        if operation == "instructions":  
            out_update_instructions = update_instructions(request=request)
            message = out_update_instructions['message']
            error = out_update_instructions['error']
            tranObjs = out_update_instructions['output']
            error_message_list.extend(out_update_instructions['error_message_list'])
            status = out_update_instructions['success']          

        if operation == "analysis":  
            out_add_analysis = add_analysis(request=request)
            message = out_add_analysis['message']
            error = out_add_analysis['error']
            tranObjs = out_add_analysis['output']
            error_message_list.extend(out_add_analysis['error_message_list'])
            status = out_add_analysis['success']          


        if not error:
            for trans in tranObjs:
                if trans.created_by:
                    user_out = json.loads(str(trans.created_by))
                else:
                    user_out = json.loads(str(json.dumps({'id':'','first_name':'' ,'last_name':'','email':''})))

                if trans.folder:
                    folder_out = json.loads(str(trans.folder))
                else:
                    folder_out = json.loads(str(json.dumps({'id':'','folder_name':''})))

                if trans.category:
                    category_out = json.loads(str(trans.category))
                else:
                    category_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))
                
                courses_out = []
                courses =  Courses.objects.filter(id__in = trans.courses)
                # try:
                for course in courses:
                    courses_out.append({'id':course.id, 'course_name':course.course_name_english})
                # courses_out = [{'id':'sample','course_name':'sample'}]
                sections_out = map(lambda x : json.loads(str(x)),trans.sections_set.all().order_by('order'))
                # sections_out = json.loads(str(trans.sections_set.all()))
                # num_sections = len(sections_out)
                num_questions = 0 
                for section in trans.sections_set.all():
                    num_questions = section.sectionquestions_set.all().count() + num_questions
                if trans.percentile_table:
                    percentile_out = json.loads(str(trans.percentile_table))
                else:
                    percentile_out = json.loads(str(json.dumps({'id':'','table_name':''})))

                activetest_out = None
                if user_email:
                    try:
                        user = CAUsers.objects.get(email=user_email)
                    except:
                        user = None
                    activetest_out = ActiveTests.objects.filter(user = user, test_details = trans)
                    if activetest_out.count() > 0:
                        activetest_out = json.loads(str(activetest_out[0]))   
                    else:
                        activetest_out = None

                result.append({
                    'id'                            :trans.id
                    ,'test_name'                    :trans.test_name                  
                    ,'scheduled_for'                :str(trans.scheduled_for)  
                    ,'num_questions'              :num_questions 
                    ,'folder'                       :folder_out
                    ,'is_section_sequence_choose'   :trans.is_section_sequence_choose 
                    ,'is_sectional_jump'            :trans.is_sectional_jump          
                    ,'time_calculation'             :trans.time_calculation           
                    ,'total_time'                   :trans.total_time                 
                    ,'is_question_jump'             :trans.is_question_jump           
                    # ,'is_calculator'                :trans.is_calculator              
                    ,'is_pausable'                  :trans.is_pausable    
                    ,'is_pausable'                  :trans.is_pausable                
                    ,'timer_type'                   :trans.timer_type 
                    ,'category'                     :category_out
                    ,'interface_type'               :trans.interface_type             
                    ,'num_options_mcq'              :trans.num_options_mcq            
                    ,'is_blank_negative'            :trans.is_blank_negative          
                    ,'blank_negative_type'          :trans.blank_negative_type        
                    ,'num_blank_allowed'            :trans.num_blank_allowed          
                    ,'blank_negative_marks'         :trans.blank_negative_marks       
                    ,'instructions'                 :trans.instructions               
                    ,'created_at'                   :(str(trans.created_at)[:16])                 
                    ,'created_by'                   :user_out
                    # ,'edit_log'                     :trans.edit_log                   
                    ,'modified_at'                  :(str(trans.modified_at)[:16])
                    ,'is_live'                      :trans.is_live
                    ,'comments'                     :trans.comments
                    ,'used_in_courses'              :courses_out 
                    ,'sections'                     :sections_out
                    ,'num_sections'                 :len(sections_out)   
                    ,'cutoff'                       :trans.test_cutoff
                    ,'analysis'                     :trans.test_analysis
                    ,'percentile'                   :percentile_out
                    ,'active_test'                  :activetest_out
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
    obj['critical_errors'] = critical_errors
    obj['warnings'] = warning
    return HttpResponse(json.dumps(obj), content_type='application/json')


def add_remove_course(request):
    error = False
    error_message_list = []
    success = False
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    output = []
    total_records = 0 
    test_id = get_param(request,'test_id',None)    
    course_id = get_param(request,'course_id',None)    
    operation = get_param(request,'operation',None)    
    tranObjs = Tests.objects.none()
    if test_id:    
        try:
            test_id_list = test_id.split(",")
            test_list = Tests.objects.filter(id__in = test_id_list)
        except:
            test_id_list = []
            error = True
            error_message_list.append('Invalid test_id')
    else:
        error = True
        error_message_list.append('Missing test_id')

    if course_id:    
        try:
            course = Courses.objects.get(id = course_id)
        except:
            error = True
            error_message_list.append('Invalid course_id')
    else:
        error = True
        error_message_list.append('Missing course_id')


    if not error:
        counter = 0
        for test in test_list:
            course_ids = test.courses
            if operation == "add_course":
                if course_id not in course_ids:
                    counter = counter + 1
                    print course_ids
                    course_ids.append(course.id)
                    # print course_ids
                    test.courses = course_ids
                    output.append(test)
                    test.save()
            elif operation == "remove_course":
                if course_id in course_ids:
                    counter = counter + 1
                    course_ids.remove(course.id)
                    test.courses = course_ids
                    test.save()
            else:
                pass
            # test.save()
        if operation == "add_course":
            message = "Added " + str(counter) + "/" + str(len(test_list)) + " tests to course"
        elif operation == "remove_course":
            message = "Removed Test"
            output = []
        else:
            pass
        success = True
    else:
        success = False
        error = True
        message = "Errors | Refer error list"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def validate_test(request):
    error = False
    error_message_list = []
    success = False
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    output = []
    total_records = 0 
    test_name = get_param(request,'test_name',None)    
    tranObjs = Tests.objects.none()
    if test_name != None and test_name != "":
        test_name = cleanstring(test_name)
        try:
            tranObjs = Tests.objects.filter(test_name=test_name)[0]
            success = False
            output = [tranObjs]
            message = "Test name already used"
        except:
            success = True
            output = Tests.objects.none()
            message = "Valid Test Name"
    else:
        error = True
        error_message_list.append("Missing test_name")

    if not error:
        return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}
    else:
        message = "Errors | Refer error list"
        return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}


def update_instructions(request):
    error = False
    error_message_list = []
    output = Tests.objects.none()
    success = False
    message = "Request Recieved"
    instructions  = get_param(request, 'instructions', None)      
    data_id = get_param(request, 'data_id', None)      
    if data_id:
        try:
            test = Tests.objects.get(id=data_id)
        except:
            error = True
            error_message_list.append("Incorrect data_id")
    else:
        error = True
        error_message_list.append("Missing data_id")

    if instructions:
        try:
            instructions = json.loads(instructions)
            try:
                if len(instructions):
                    instruction_test = instructions[0]
            except:
                error = True
                error_message_list.append('Incorrect instructions | values: ["Sample Instruction"]')

        except:
            error = True
            error_message_list.append('Incorrect instructions | values: ["Sample Instruction"]')
    else:
        error = True
        error_message_list.append('Missing instructions | If no instruction send an empty list')

    if not error:
        test.instructions = instructions
        test.save()
        message = "Instructions Updated"
        success = True
        output = [test]
    else:
        message = "Error! | Refer Error List"
        success = False
    
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def add_analysis(request):
    error = False
    error_message_list = []
    output = Tests.objects.none()
    success = False
    message = "Request Recieved"
    analysis  = get_param(request, 'analysis', None)      
    data_id = get_param(request, 'data_id', None)      
    if data_id:
        try:
            test = Tests.objects.get(id=data_id)
        except:
            error = True
            error_message_list.append("Incorrect data_id")
    else:
        error = True
        error_message_list.append("Missing data_id")

    if not error:
        test.test_analysis = analysis
        test.save()
        message = "Analysis Updated"
        success = True
        output = [test]
    else:
        message = "Error! | Refer Error List"
        success = False
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}


def delete_test(request):
    error = False
    error_message_list = []
    success = False    
    data_id      = get_param(request, 'data_id', None)
    output = Tests.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            test = Tests.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if test:
            questions = Questions.objects.filter(tests__in = test.id)
            for ques in questions:
                test_list = ques.tests
                final_test_list = filter(lambda a: a != test.id, test_list)
                ques.tests = final_test_list
                ques.save()

            success = True
            test.delete()
            message = "Test Deleted"
        else:
            success = False
            message = "Test not found"
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def live_test(request):
    error = False
    success = False
    error_message_list = []
    output = []
    message = "Request Recieved"
    test_ids   = get_param(request, 'test_ids', None)
    is_live     = get_param(request, 'is_live', None)
    validate =  get_param(request,'validate',None)
    check_is_live = booleanvar_check(variable_name="is_live",value=is_live)
    critical_error_list = []
    warning_list = []

    if not check_is_live['error']:
        is_live = check_is_live['output']
    else:
        error = True 
        error_message_list.append(check_is_live['errormessage'])
        
    check_validate = booleanvar_check(variable_name="validate",value=validate)
    if not check_validate['error']:
        validate = check_validate['output']
    else:
        error = True 
        error_message_list.append(check_validate['errormessage'])

    if not error:
        if test_ids:
            test_id_list = test_ids.split(",")

            for test_id in test_id_list:
                try:
                    test = Tests.objects.get(id=test_id)
                    if is_live:
                        if not test.category:
                            critical_error_list.append("Test category not defined")
                            
                        if not test.timer_type:
                            critical_error_list.append("Timer type not defined")

                        if not test.time_calculation:
                            critical_error_list.append("Time calculation not defined")
                        elif test.time_calculation == "overall":
                            if not test.total_time or test.total_time <= 0:
                                critical_error_list.append("Total test time not defined in an overall time calculation test")

                        if not test.interface_type:
                            critical_error_list.append("Interface type not defined")

                        if not test.num_options_mcq:
                            critical_error_list.append("Number of MCQ options not defined")

                        if test.is_blank_negative:
                            if not test.blank_negative_type:
                                critical_error_list.append("Blank negative type not defined in a blank-negative type test")
                            elif test.blank_negative_type == "overall":
                                if not test.num_blank_allowed or test.num_blank_allowed < 0:
                                    critical_error_list.append("Num blanks allowed not defined in a blank-negative type test")

                                if not test.blank_negative_marks or test.blank_negative_marks <= 0:
                                    critical_error_list.append("Blank negative marks not defined in a blank-negative type test")

                        if not test.test_cutoff:
                            warning_list.append("No test cutoff defined for the test")

                        if not test.percentile_table:
                            warning_list.append("No percentile table defined for the test")

                        if len(test.instructions) == 0:
                            warning_list.append("No test instructions shared")

                        if not test.test_analysis:
                            warning_list.append("No test analysis given")

                        sections = test.sections_set.all()
                        if sections.count() == 0:
                            critical_error_list.append("No sections defined in the test")

                        for sec in sections:
                            section_name = sec.name
                            if not sec.percentile_table:
                                warning_list.append("No percentile table defined for the section - " + section_name)

                            if not sec.section_cutoff:
                                warning_list.append("No cutoff defined for the section - " + section_name)

                            if len(sec.instructions) == 0:
                                warning_list.append("No section instructions defined for the section - " + section_name)

                            if test.time_calculation == "sectional":
                                if not sec.section_time or sec.section_time <= 0 :
                                    critical_error_list.append("Sectional test time not defined in the tests for the section - " + section_name)

                            if test.is_blank_negative:
                                if test.blank_negative_type == "sectional":
                                    if not sec.num_blank_allowed or sec.num_blank_allowed < 0:
                                        critical_error_list.append("Num blanks allowed not defined in a sectional blank-negative type test for the section - " + section_name)

                                    if not sec.blank_negative_marks or sec.blank_negative_marks <= 0:
                                        critical_error_list.append("Num blank negative marks not defined in a blank-negative type test for the section - " + section_name)

                            questions = sec.sectionquestions_set.all()
                            total_questions = questions.count()
                            if total_questions == 0:
                                critical_error_list.append("No questions defined in the section - " + section_name)
                            num_incomplete = 0
                            num_no_negative = 0 
                            num_no_positive = 0 
                            num_diff = 0 

                            for ques in questions:
                                # print "here it came again"
                                if not ques.question.topic or not ques.question.difficulty_user:
                                    num_incomplete = num_incomplete + 1
                                if ques.positive_marks <= 0:
                                    num_no_positive = num_no_positive + 1
                                if ques.negative_marks <= 0:
                                    num_no_negative = num_no_negative + 1

                                if sec.is_eval_manual:
                                    if ques.question.question_type in evaluable_questions:
                                        num_diff = num_diff + 1
                                else:
                                    if ques.question.question_type in no_evaluable_questions:
                                        num_diff = num_diff + 1

                            if num_incomplete > 0:
                                critical_error_list.append("Found " + str(num_incomplete) + " of "+ str(total_questions) +" questions with incomplete data in sections - " + section_name)

                            if num_no_positive > 0:
                                critical_error_list.append("Found " + str(num_no_positive) + " of "+ str(total_questions) +" questions with no positive marks in sections - " + section_name)

                            if num_no_negative > 0:
                                warning_list.append("Found " + str(num_no_negative) + " of "+ str(total_questions) +" questions with no negative marks in sections - " + section_name)

                            if num_diff > 0:
                                if sec.is_eval_manual:
                                    critical_error_list.append("Found " + str(num_diff) + " of "+ str(total_questions) +" evaluable questions with in non evaluable sections - " + section_name)
                                else:
                                    critical_error_list.append("Found " + str(num_diff) + " of "+ str(total_questions) +" non evaluable questions with in an evaluable sections - " + section_name)


                    if not validate and len(critical_error_list) == 0:
                        test.is_live = is_live
                        test.save()
                        if is_live:
                            sections = test.sections_set.all()
                            for section in sections:
                                section.is_complete = True
                                section.save()
                            allquestions = Questions.objects.filter(tests__in=[test_id])
                            for quest in allquestions:
                                print "came here"
                                quest.is_live = True
                                quest.save()
                        output.append(test)
                except:
                    error = True
                    # print "here it came"
                    error_message_list.append("Incorrect test_id : " + str(test_id))
        else:
            error = True
            error_message_list.append("Missing test_ids")

        if not error:
            if validate:
                message = "Test validation complete"
                success = True                
            else:
                if is_live:
                    if len(critical_error_list) == 0 :
                        message = "Test Live"
                        success = True                
                    else:
                        message = "Critical Errors in Test"
                        success = False
                else:
                    message = "Test/s Offline"
                    success = True        
        else:
            message = "Errors | Refer Error List!"
            success = False
    else:
        message = "Errors | Refer Error List!"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success,'critical_errors':critical_error_list,'warnings':warning_list}


def create_update_test(request):
    error = False
    error_message_list = []
    output = Tests.objects.none()
    success = False
    message = "Request Recieved"
    operation = get_param(request, 'operation', None)
    is_question_jump           = get_param(request, 'is_question_jump', None)      
    # is_calculator              = get_param(request, 'is_calculator', None)      
    is_pausable                = get_param(request, 'is_pausable', None)      
    is_section_sequence_choose = get_param(request, 'is_section_sequence_choose', None)      
    is_sectional_jump          = get_param(request, 'is_sectional_jump', None)      
    data_id                    = get_param(request, 'data_id', None)      
    test_name                  = get_param(request, 'test_name', None)      
    scheduled_for              = get_param(request, 'scheduled_for', None)      
    folder_id                  = get_param(request, 'folder_id', None)
    category_id                = get_param(request, 'category_id', None)      
    time_calculation           = get_param(request, 'time_calculation', None) 
    total_time                 = get_param(request, 'total_time', None)      
    timer_type                 = get_param(request, 'timer_type', None)    
    interface_type             = get_param(request, 'interface_type', None)      
    num_options_mcq            = get_param(request, 'num_options_mcq', None)      
    is_blank_negative          = get_param(request, 'is_blank_negative', None)      
    blank_negative_type        = get_param(request, 'blank_negative_type', None)      
    num_blank_allowed          = get_param(request, 'num_blank_allowed', None)      
    blank_negative_marks       = get_param(request, 'blank_negative_marks', None)      
    comments                   = get_param(request, 'comments', None)
    test_cutoff                = get_param(request, 'test_cutoff', None)
    course_ids                 = get_param(request, 'course_ids', None)
    percentile_id              = get_param(request, 'percentile_id', None)

    if scheduled_for:
        try:
            scheduled_for = datetime.strptime(scheduled_for, "%Y-%m-%d").strftime("%Y-%m-%d")
        except:
            error = True
            error_message_list.append("Incorrect scheduled_for | value : %Y-%m-%d")                               
    else:
        error = True
        error_message_list.append("Missing scheduled_for")                               
    # user fields check and correction
    if test_name:
        test_name = cleanstring(test_name)
    else:
        error = True
        error_message_list.append("Missing test_name")                               

    if category_id:
        try:
            category = TestCategory.objects.get(id=category_id)
        except:
            error = True
            error_message_list.append("Incorrect category_id")
    else:
        error = True
        error_message_list.append("Missing category_id")
        
    percentile = None
    if percentile_id:
        try:
            percentile = PercentileTables.objects.get(id=percentile_id)
        except:
            error = True
            error_message_list.append("Incorrect percentile_id")


    check_is_section_sequence_choose = booleanvar_check(variable_name="is_section_sequence_choose",value=is_section_sequence_choose)     
    if not check_is_section_sequence_choose['error']:
        is_section_sequence_choose = check_is_section_sequence_choose['output']
    else:
        error = check_is_section_sequence_choose['error']
        error_message_list.append(check_is_section_sequence_choose['errormessage'])

    check_is_question_jump = booleanvar_check(variable_name="is_question_jump",value=is_question_jump)     
    if not check_is_question_jump['error']:
        is_question_jump = check_is_question_jump['output']
        if is_question_jump:
            check_is_sectional_jump = booleanvar_check(variable_name="is_sectional_jump",value=is_sectional_jump)     
            if not check_is_sectional_jump['error']:
                if is_section_sequence_choose:
                    is_sectional_jump = False
                else:
                    is_sectional_jump = check_is_sectional_jump['output']
            else:
                error = check_is_sectional_jump['error']
                error_message_list.append(check_is_sectional_jump['errormessage'])
        else:
            is_sectional_jump = False
    else:
        error = check_is_question_jump['error']
        error_message_list.append(check_is_question_jump['errormessage'])


    check_is_pausable = booleanvar_check(variable_name="is_pausable",value=is_pausable)     
    if not check_is_pausable['error']:
        is_pausable = check_is_pausable['output']
    else:
        error = check_is_pausable['error']
        error_message_list.append(check_is_pausable['errormessage'])

    check_interface_type = listvar_check(variable_name="interface_type",value=interface_type, allowedlist=interface_type_allowed,missing_allowed=True)     
    if not check_interface_type['error']:
        interface_type = check_interface_type['output']
    else:
        if check_interface_type['is_missing']:
            fields_missing = fields_missing + 1
        else:
            error = True
            error_message_list.append(check_interface_type['errormessage'])


    check_timer_type = listvar_check(variable_name="timer_type",value=timer_type,allowedlist=time_type_allowed,missing_allowed=True)       
    if not check_timer_type['error']:
        timer_type = check_timer_type['output']
    else:
        if check_timer_type['is_missing']:
            fields_missing = fields_missing + 1
        else:
            error = check_timer_type['error']
            error_message_list.append(check_timer_type['errormessage'])

    check_num_options_mcq = listvar_check(variable_name="num_options_mcq",value=num_options_mcq,allowedlist=num_options_mcq_allowed,missing_allowed=True)     
    if not check_num_options_mcq['error']:
        num_options_mcq = (check_num_options_mcq['output'])
    else:
        if check_num_options_mcq['is_missing']:
            fields_missing = fields_missing + 1
        else:
            error = check_num_options_mcq['error']
            error_message_list.append(check_num_options_mcq['errormessage'])


    check_time_calculation = listvar_check(variable_name="time_calculation",value=time_calculation,allowedlist=time_calculation_allowed,missing_allowed=True)     
    if not check_time_calculation['error']:
        time_calculation = check_time_calculation['output']

        if time_calculation == "overall":
            check_total_time = intvar_check(variable_name="total_time",value=total_time,missing_allowed=True)     
            if not check_total_time['error']:
                total_time = check_total_time['output']
            else:
                if check_total_time['is_missing']:
                    fields_missing = fields_missing + 1
                else:
                    error = check_total_time['error']
                    error_message_list.append(check_total_time['errormessage'])

        else:
            total_time = None
    else:
        if check_time_calculation['is_missing']:
            fields_missing = fields_missing + 1
        else:
            error = check_time_calculation['error']
            error_message_list.append(check_time_calculation['errormessage'])


    check_test_cutoff = floatvar_check(variable_name="test_cutoff",value=test_cutoff,missing_allowed=True)     
    if not check_test_cutoff['error']:
        test_cutoff = check_test_cutoff['output']
    else:
        if check_test_cutoff['is_missing']:
            fields_missing = fields_missing + 1
        else:
            error = check_test_cutoff['error']
            error_message_list.append(check_test_cutoff['errormessage'])


    check_is_blank_negative = booleanvar_check(variable_name="is_ gative",value=is_blank_negative)     
    if not check_is_blank_negative['error']:
        is_blank_negative = check_is_blank_negative['output']
        if is_blank_negative:
            check_blank_negative_type = listvar_check(variable_name="blank_negative_type",value=blank_negative_type,allowedlist=blank_negative_type_allowed,missing_allowed=True)     
            if not check_blank_negative_type['error']:
                blank_negative_type = check_blank_negative_type['output']
                if blank_negative_type == "overall":
                    check_num_blank_allowed = intvar_check(variable_name="num_blank_allowed",value=num_blank_allowed,missing_allowed=True)     
                    if not check_num_blank_allowed['error']:
                        num_blank_allowed = check_num_blank_allowed['output']
                    else:
                        if check_num_blank_allowed['is_missing']:
                            fields_missing = fields_missing + 1
                        else:
                            error = check_num_blank_allowed['error']
                            error_message_list.append(check_num_blank_allowed['errormessage'])

                    check_blank_negative_marks = floatvar_check(variable_name="blank_negative_marks",value=blank_negative_marks,missing_allowed=True)     
                    if not check_blank_negative_marks['error']:
                        blank_negative_marks = check_blank_negative_marks['output']
                    else:
                        if check_blank_negative_marks['is_missing']:
                            fields_missing = fields_missing + 1
                        else:
                            error = check_blank_negative_marks['error']
                            error_message_list.append(check_blank_negative_marks['errormessage'])
                else:
                    num_blank_allowed = None
                    blank_negative_marks = None
            else:
                if check_blank_negative_type['is_missing']:
                    fields_missing = fields_missing + 1
                else:
                    error = check_blank_negative_type['error']
                    error_message_list.append(check_blank_negative_type['errormessage'])
        else:
            blank_negative_type = "overall"
            num_blank_allowed = None
            blank_negative_marks = None

    else:
        error = check_is_blank_negative['error']
        error_message_list.append(check_is_blank_negative['errormessage'])

    if course_ids:    
        try:
            course_id_list = course_ids.split(",")
            course_list = Courses.objects.filter(id__in = course_id_list)
        except:
            course_id_list = []
            error = True
            error_message_list.append('Invalid course_ids')
    else:
        course_id_list = []

    if operation == "update":
        if data_id:
            try:
                test = Tests.objects.get(id=data_id)
            except:
                error = True
                error_message_list = ['invalid data_id']
        else:
            error = True
            error_message_list = ['missing data_id']

        # check_is_live = booleanvar_check(variable_name="is_live",value=is_live)     
        # if not check_is_live['error']:
        #     is_live = check_is_live['output']
        # else:
        #     error = check_is_live['error']
        #     error_message_list.append(check_is_live['errormessage'])

    else:
        if folder_id:
            try:
                folder    = TestFolder.objects.get(id=folder_id)
            except:
                error = True
                error_message_list.append("Incorrect folder_id")               
        else:
            error = True
            error_message_list.append("Missing folder_id")         
    
    # auto set fields                                
    ts = time.time()
    created_at = datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')


    if request.user.is_anonymous:
        # edit_log = [{'user':{'id':'','first_name':'' ,'last_name':'','email':''},
        #             'time':created_at}]
        created_by = None                 
    else:
        # edit_log = [{'user':json.loads(str(request.user)),
        #             'time':created_at}]
        created_by = request.user

    if not error: 
        if operation == "create":
            test_check = Tests.objects.filter(test_name=test_name)

            if time_calculation  == "sectional" and is_sectional_jump:
                success = False
                message = "Section jump test can't have sectional time!"


            elif test_check.count() == 0:            
                test = Tests.objects.create(
                test_name                   = test_name                 
                ,scheduled_for              = scheduled_for             
                ,folder                     = folder                 
                ,is_section_sequence_choose = is_section_sequence_choose
                ,is_sectional_jump          = is_sectional_jump         
                ,time_calculation           = time_calculation          
                ,total_time                 = total_time                
                ,is_question_jump           = is_question_jump          
                ,is_pausable                = is_pausable               
                ,timer_type                 = timer_type
                ,category                   = category                
                ,interface_type             = interface_type            
                ,num_options_mcq            = num_options_mcq                       
                ,is_blank_negative          = is_blank_negative         
                ,blank_negative_type        = blank_negative_type       
                ,num_blank_allowed          = num_blank_allowed         
                ,test_cutoff                = test_cutoff         
                ,blank_negative_marks       = blank_negative_marks      
                ,percentile_table           = percentile      
                ,courses                    = course_id_list
                ,created_by                 = created_by
                # ,edit_log                   = edit_log
                # ,modified_at                = created_at            
                )
                
                output = [test]
                message = "Test Created!"
                success = True
            else:
                output = test_check
                message = "Invalid Test Name"
                success = False
        else:
            if time_calculation  == "sectional" and is_sectional_jump:
                success = False
                message = "Section jump test can't have sectional time!"

            elif Tests.objects.filter(test_name = test_name).count() > 1:
                success = False
                message = "Test name already exist"
                output = []
            elif Tests.objects.filter(test_name = test_name).count() == 1 :
                if test.id == Tests.objects.filter(test_name = test_name)[0].id:
                    test.test_name           = test_name                
                    test.scheduled_for              = scheduled_for             
                    test.is_section_sequence_choose = is_section_sequence_choose
                    test.is_sectional_jump          = is_sectional_jump         
                    test.time_calculation           = time_calculation          
                    test.total_time                 = total_time                
                    test.is_question_jump           = is_question_jump          
                    test.is_pausable                = is_pausable               
                    test.timer_type                 = timer_type      
                    test.category                   = category                
                    test.interface_type             = interface_type            
                    test.num_options_mcq            = num_options_mcq      
                    test.test_cutoff                = test_cutoff           
                    test.is_blank_negative          = is_blank_negative         
                    test.blank_negative_type        = blank_negative_type       
                    test.num_blank_allowed          = num_blank_allowed         
                    test.blank_negative_marks       = blank_negative_marks  
                    test.percentile_table           = percentile          
                    test.comments                   = comments   
                    test.courses                    = course_id_list
                    test.save()
                    output = [test]
                    message = "Test Updated!"
                    success = True

                else:  
                    success = False
                    message = "Test name already exist"
                    output = []
            else:
                test.test_name           = test_name                
                test.scheduled_for              = scheduled_for             
                test.is_section_sequence_choose = is_section_sequence_choose
                test.is_sectional_jump          = is_sectional_jump         
                test.time_calculation           = time_calculation          
                test.total_time                 = total_time                
                test.is_question_jump           = is_question_jump          
                test.is_pausable                = is_pausable               
                test.timer_type                 = timer_type      
                test.category                   = category                
                test.interface_type             = interface_type            
                test.num_options_mcq            = num_options_mcq      
                test.test_cutoff                = test_cutoff           
                test.is_blank_negative          = is_blank_negative         
                test.blank_negative_type        = blank_negative_type       
                test.num_blank_allowed          = num_blank_allowed         
                test.blank_negative_marks       = blank_negative_marks  
                test.percentile_table           = percentile          
                test.comments                   = comments   
                test.courses                    = course_id_list
                test.save()
                output = [test]
                message = "Test Updated!"
                success = True
            
            # if Tests.objects.filter(test_name = test_name).count() > 0 :
            #     success = False
            #     message = "Test name already exist"
            #     output = []
            # else:                
            #     test.test_name           = test_name                
            #     test.scheduled_for              = scheduled_for             
            #     test.is_section_sequence_choose = is_section_sequence_choose
            #     test.is_sectional_jump          = is_sectional_jump         
            #     test.time_calculation           = time_calculation          
            #     test.total_time                 = total_time                
            #     test.is_question_jump           = is_question_jump          
            #     test.is_pausable                = is_pausable               
            #     test.timer_type                 = timer_type      
            #     test.category                   = category                
            #     test.interface_type             = interface_type            
            #     test.num_options_mcq            = num_options_mcq      
            #     test.test_cutoff                = test_cutoff           
            #     # test.is_eval_manual             = is_eval_manual            
            #     test.is_blank_negative          = is_blank_negative         
            #     test.blank_negative_type        = blank_negative_type       
            #     test.num_blank_allowed          = num_blank_allowed         
            #     test.blank_negative_marks       = blank_negative_marks  
            #     test.percentile_table           = percentile          
            #     # test.modified_at                = created_at   
            #     test.comments                   = comments   
            #     test.courses                    = course_id_list
            #     # log = test.edit_log
            #     # log.append(edit_log[0])
            #     # test.edit_log                   = log

            #     test.save()
            #     output = [test]
            #     message = "Test Updated!"
            #     success = True
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}



def read_tests(request):
    output = Tests.objects.none()
    error = False
    error_message_list = []
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    total_records = 0 
    success = False
    folder_list = []
    page_num = get_param(request, 'page_num', "1")
    page_size = get_param(request, 'page_size', "10")
    search = get_param(request,'search',None) 
    sort_by = get_param(request,'sort_by',None) 
    order = get_param(request,'order_by',None)    




    data_id = get_param(request,'data_id',None)    
    test_name = get_param(request,'test_name',None)    
    folder_id = get_param(request,'folder_id',None)
    folder_name = get_param(request,'folder_name',None)
    is_live     = get_param(request,'is_live',None)        
    is_section_sequence_choose = get_param(request,'is_section_sequence_choose',None)        
    is_sectional_jump = get_param(request,'is_sectional_jump',None)        
    is_question_jump = get_param(request,'is_question_jump',None)          
    is_pausable = get_param(request,'is_pausable',None)        
    is_blank_negative = get_param(request,'is_blank_negative',None)        
    num_options_mcq = get_param(request,'num_options_mcq',None)        
    blank_negative_type = get_param(request,'blank_negative_type',None)        
    sub_category = get_param(request,'sub_category',None) 
    time_calculation = get_param(request,'time_calculation',None)        
    timer_type = get_param(request,'timer_type',None)        
    interface_type = get_param(request,'interface_type',None)  
    scheduled_for_start = get_param(request,'scheduled_for_start',None)        
    scheduled_for_end = get_param(request,'scheduled_for_end',None)  

    course_id  = get_param(request,'course_id',None)      
    is_adminpanel =  get_param(request,'is_adminpanel',"1")
    user_email = get_param(request,'user_email',None)

    if data_id != None and data_id != "":
        tranObjs = Tests.objects.filter(id=data_id)
    else:
        tranObjs = Tests.objects.all()

        if folder_id !=None and  folder_id !="":
            folder_id_list = folder_id.split(",")
            folder_id_list_new = [None if x == 'none' else x for x in folder_id_list]
            tranObjs = tranObjs.filter(folder__id__in = folder_id_list_new)

        if folder_name != None and folder_name != "" and folder_name !="allbanks":
            # print folder_name
            try:
                folder_name = cleanstring(folder_name)
                # print folder_name
                # folder_name = str(folder_name)
                folder = TestFolder.objects.get(folder_name=folder_name)
                # print folder.id
                tranObjs = tranObjs.filter(folder__id = folder.id)
            except:
                error = True
                error_message_list.append('Incorrect Folder name')

        if test_name != None and test_name != "" and test_name !="allbanks":
            # print folder_name
            try:
                test_name = cleanstring(test_name)
                tranObjs = tranObjs.filter(test_name=test_name)
            except:
                error = True
                error_message_list.append('Incorrect test_name')

        if course_id != None and  course_id !="":
            course_id_list = course_id.split(",")
            tranObjs = tranObjs.filter(Q(courses__in=course_id_list))


        # Filters/Sorting Start
        if scheduled_for_start !=None and  scheduled_for_start !="" and scheduled_for_start != "none" and  scheduled_for_end !=None and  scheduled_for_end !="" and scheduled_for_end != "none":    
            try:
                # print scheduled_for_start
                # print scheduled_for_end
                scheduled_for_start = datetime.strptime(scheduled_for_start, "%Y-%m-%d")
                scheduled_for_end = datetime.strptime(scheduled_for_end, "%Y-%m-%d")
                
                tranObjs = tranObjs.filter(scheduled_for__range=(scheduled_for_start, scheduled_for_end))
            except:
                error = True
                success = False
                error_message_list.append("Incorrect scheduled_for_start | scheduled_for_end | value : %Y-%m-%d")                               

        if is_section_sequence_choose !=None and is_section_sequence_choose !=""  and is_section_sequence_choose != "none":
            if is_section_sequence_choose == "1":
                tranObjs = tranObjs.filter(is_section_sequence_choose=True)
            else:
                tranObjs = tranObjs.filter(is_section_sequence_choose=False)

        if is_sectional_jump !=None and is_sectional_jump !=""  and is_sectional_jump != "none":
            if is_sectional_jump == "1":
                tranObjs = tranObjs.filter(is_sectional_jump=True)
            else:
                tranObjs = tranObjs.filter(is_sectional_jump=False)

        if is_live !=None and is_live !=""  and is_live != "none":
            if is_live == "1":
                tranObjs = tranObjs.filter(is_live=True)
            else:
                tranObjs = tranObjs.filter(is_live=False)

        if is_question_jump !=None and is_question_jump !=""  and is_question_jump != "none":
            if is_question_jump == "1":
                tranObjs = tranObjs.filter(is_question_jump=True)
            else:
                tranObjs = tranObjs.filter(is_question_jump=False)

        # if is_calculator !=None and is_calculator !=""  and is_calculator != "none":
        #     if is_calculator == "1":
        #         tranObjs = tranObjs.filter(is_calculator=True)
        #     else:
        #         tranObjs = tranObjs.filter(is_calculator=False)

        if is_pausable !=None and is_pausable !=""  and is_pausable != "none":
            if is_pausable == "1":
                tranObjs = tranObjs.filter(is_pausable=True)
            else:
                tranObjs = tranObjs.filter(is_pausable=False)

        if is_blank_negative !=None and is_blank_negative !=""  and is_blank_negative != "none":
            if is_blank_negative == "1":
                tranObjs = tranObjs.filter(is_blank_negative=True)
            else:
                tranObjs = tranObjs.filter(is_blank_negative=False)

        if num_options_mcq !=None and num_options_mcq !=""  and num_options_mcq != "none":
            num_options_mcq_list = num_options_mcq.split(",")
            num_options_mcq_list = map(lambda x : int(x),num_options_mcq_list)
            tranObjs = tranObjs.filter(num_options_mcq__in=num_options_mcq_list)

        if blank_negative_type !=None and blank_negative_type !=""  and blank_negative_type != "none":
            blank_negative_type_list = blank_negative_type.split(",")
            tranObjs = tranObjs.filter(blank_negative_type__in=blank_negative_type_list)


        if sub_category !=None and sub_category !=""  and sub_category != "none":
            sub_category_list = sub_category.split(",")
            tranObjs = tranObjs.filter(category__id__in = sub_category_list)


        if time_calculation !=None and time_calculation !=""  and time_calculation != "none":
            time_calculation_list = time_calculation.split(",")
            tranObjs = tranObjs.filter(time_calculation__in=time_calculation_list)

        if timer_type !=None and timer_type !=""  and timer_type != "none":
            timer_type_list = timer_type.split(",")
            tranObjs = tranObjs.filter(timer_type__in=timer_type_list)

        if interface_type !=None and interface_type !=""  and interface_type != "none":
            interface_type_list = interface_type.split(",")
            tranObjs = tranObjs.filter(interface_type__in=interface_type_list)


        if search !=None and search !="":
            tranObjs = tranObjs.filter(test_name__icontains=search)

        if sort_by !=None and sort_by !="" and sort_by != "none":
            if order == "asc":
                tranObjs = tranObjs.order_by(sort_by)
            else:
                tranObjs = tranObjs.order_by("-" + sort_by)
        else:
            tranObjs = tranObjs.order_by("scheduled_for")
        # Filters/Sorting End
    # pagination variable

    if course_id:
        if is_adminpanel !=None and is_adminpanel !=""  and is_adminpanel != "none":
            if is_adminpanel == "0":
                if user_email:
                    user_email = cleanstring(user_email.lower())
                    if validate_email(user_email):
                        pass
                    else:
                        error = True
                        error_message_list.append("Invalid user_email")                                   
                else:
                    error = True
                    error_message_list.append("Missing user_email") 
            else:
                user_email = None

        
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
    
    filters['is_section_sequence_choose']= [{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    # filters['courses'] = [{'value':'sampleid','label':'Course Sample'},{'value':'sampleid2','label':'Course Sample 2'}]
    filters['courses'] = map(lambda x :{'value':x.id,'label':x.course_name_english}, Courses.objects.all())
    filters['is_sectional_jump']= [{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    filters['is_question_jump']=[{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    filters['is_pausable']=[{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    filters['is_live']=[{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    filters['is_blank_negative']= [{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    filters['num_options_mcq']=map(lambda x :{'value':x,'label':x},num_options_mcq_allowed)
    filters['blank_negative_type']= map(lambda x :{'value':x,'label':x.title()},blank_negative_type_allowed)
    filters['folders'] = [{'value':'none','label':'None'}]
    folders = TestFolder.objects.all()
    for folder in folders:
        filters['folders'].append({
            'value':folder.id,
            'label':folder.folder_name
        })
 
    filters['percentile'] = map(lambda x :{'value':x.id,'label':str(x.table_name).title() },PercentileTables.objects.all())
    filters['time_calculation']= map(lambda x :{'value':x,'label':x.title()},time_calculation_allowed)
    filters['timer_type']=map(lambda x :{'value':x,'label':x.title()},time_type_allowed)
    filters['interface_type']= map(lambda x :{'value':x,'label':x.title()},interface_type_allowed)
    filters['sub_category'] = map(lambda x :{'id':x.id,'category':x.category.title(),'sub_category':x.sub_category.title() },TestCategory.objects.all())
    filters['category']= map(lambda x :{'value':x,'label':x.title()},test_category_allowed)
    filters['assigned_to'] = map(lambda x :{'value':x.id,'label':str((x.first_name).title() + " " + (x.last_name).title()) },CAUsers.objects.filter(is_staff=True,is_active=True))             
    filters['is_eval_manual'] = [{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    filters['is_calculator']=[{'value':'0','label':'No'},{'value':'1','label':'Yes'}]

    filters['sort_by'] = [
                        {'value':'test_name','label':'Test Name'},
                        {'value':'scheduled_for','label':'Scheduled For'},
                        {'value':'total_time','label':'Total Time'},
                        {'value':'created_at','label':'Created At'},
                        {'value':'modified_at','label':'Modified At'},                                
                       ]
    filters['order_by'] = [{'value':'asc','label':'Ascending'},
                           {'value':'desc','label':'Descending'}]
    if not error:
        message  = "Success!"
        success = True
        return({
            'output':tranObjs,
            'num_pages':num_pages,
            'total_records':total_records,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'success':success,
            'message':message,
            'user_email':user_email
        })
    else:
        message  = "Error | Refer Error List"
        success = False
        return({
            'output':Tests.objects.none(),
            'num_pages':1,
            'total_records':0,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'success':success,
            'message':message,
            'user_email':user_email
        })

def move_test(request):
    output = []
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    folder_id = get_param(request,'folder_id',None)    
    test_ids = get_param(request,'test_ids',None)

    if folder_id:
        try:
            folder = TestFolder.objects.get(id=folder_id)
        except:
            error = True
            error_message_list.append("Incorrect folder_id")
    else:
        error = True
        error_message_list.append("Missing folder_id")

    if not error:
        if test_ids:
            test_id_list = test_ids.split(",")
            for test_id in test_id_list:
                try:
                    test = Tests.objects.get(id=test_id)
                    test.folder = folder
                    sections = test.sections_set.all()
                    for section in sections:
                        section.folder = folder
                        section.save()

                    test.save()
                    output.append(test)
                except:
                    error = True
                    error_message_list.append("Incorrect test_id : " + str(test_id))
        else:
            error = True
            error_message_list.append("Missing test_ids")

        if not error:
            message = "All Tests Moved"
            success = True
        else:
            message = "Errors | Refer Error List!"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

#<----------------- Test CRUD End --------------------------->

#<----------------- Section CRUD Start --------------------------->
def crud_section(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = Sections.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 

    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_section)
    if not check_operation['error']:
        if operation == "read":
            out_read_sections = read_sections(request) 
            message = out_read_sections['message']               
            tranObjs = out_read_sections['output']
            error_message_list.extend(out_read_sections['error_message_list'])               
            error = out_read_sections['error']     
            num_pages = out_read_sections['num_pages']          
            filters = out_read_sections['filter']     
            total_records = out_read_sections['total_records']   
            status = out_read_sections['success']   

        if operation in ["create","update"]:
            out_create_update_section = create_update_section(request) 
            message = out_create_update_section['message']               
            tranObjs = out_create_update_section['output']
            error_message_list.extend(out_create_update_section['error_message_list'])
            error = out_create_update_section['error']  
            status = out_create_update_section['success']         

        if operation == "delete":
            out_delete_section = delete_section(request) 
            message = out_delete_section['message']               
            tranObjs = out_delete_section['output']               
            error_message_list.extend(out_delete_section['error_message_list'])               
            error = out_delete_section['error']   
            status = out_delete_section['success']               

        if operation == "copy":
            out_copy_section = copy_section(request)
            message = out_copy_section['message']
            error = out_copy_section['error']
            tranObjs = out_copy_section['output']
            error_message_list.extend(out_copy_section['error_message_list'])
            status = out_copy_section['success']   

        if operation == "order_change":
            out_order_section_change = order_section_change(request)
            message = out_order_section_change['message']
            error = out_order_section_change['error']
            tranObjs = out_order_section_change['output']
            error_message_list.extend(out_order_section_change['error_message_list'])
            status = out_order_section_change['success']   

        if operation == "validate":  
            out_validate_section = validate_section(request=request)
            message = out_validate_section['message']
            error = out_validate_section['error']
            tranObjs = out_validate_section['output']
            error_message_list.extend(out_validate_section['error_message_list'])
            status = out_validate_section['success']       
        
        if operation == "complete":  
            out_complete_section = complete_section(request=request)
            message = out_complete_section['message']
            error = out_complete_section['error']
            tranObjs = out_complete_section['output']
            error_message_list.extend(out_complete_section['error_message_list'])
            status = out_complete_section['success']    
        
        if operation == "instructions":  
            out_update_section_instructions = update_section_instructions(request=request)
            message = out_update_section_instructions['message']
            error = out_update_section_instructions['error']
            tranObjs = out_update_section_instructions['output']
            error_message_list.extend(out_update_section_instructions['error_message_list'])
            status = out_update_section_instructions['success']          


        if not error:
            for trans in tranObjs:
                if trans.assigned_to:
                    user_out = json.loads(str(trans.assigned_to))
                else:
                    user_out = json.loads(str(json.dumps({'id':'','first_name':'' ,'last_name':'','email':''})))

                if trans.folder:
                    folder_out = json.loads(str(trans.folder))
                    path = '/testengine/adminpanel/test-bank/' + trans.folder.folder_name + '/' + trans.test.test_name + '/' + trans.id + '/'
                else:
                    folder_out = json.loads(str(json.dumps({'id':'','folder_name':''})))
                    path = '/testengine/adminpanel/test-bank/allbanks/' + trans.test.test_name + '/' + trans.id + '/'
                if trans.percentile_table:
                    percentile_out = json.loads(str(trans.percentile_table))
                else:
                    percentile_out = json.loads(str(json.dumps({'id':'','table_name':''})))

                if trans.to_complete_date:
                    to_complete_date = (str(trans.to_complete_date)[:10])
                else:
                    to_complete_date = trans.to_complete_date
                
                result.append({
                            'id'                    :trans.id
                            ,'name'                 :trans.name                    
                            ,'created_at'           :(str(trans.created_at)[:16])                 
                            ,'modified_at'          :(str(trans.modified_at)[:16])             
                            # ,'edit_log'             :trans.edit_log                
                            ,'to_complete_date'     :to_complete_date
                            ,'test'                 :json.loads(str(trans.test))
                            ,'folder'               :folder_out                    
                            ,'assigned_to'          :user_out             
                            ,'created_by'           :trans.created_by     
                            # ,'number_questions'     :(trans.number_questions)        
                            ,'is_eval_manual'       :trans.is_eval_manual
                            ,'is_calculator'        :trans.is_calculator
                            ,'section_time'         :trans.section_time            
                            ,'order'                :trans.order
                            ,'number_questions'     :trans.sectionquestions_set.all().count()
                            ,'num_blank_allowed'    :trans.num_blank_allowed       
                            ,'blank_negative_marks' :trans.blank_negative_marks    
                            ,'default_positive_marks':trans.default_positive_marks    
                            ,'is_complete'           :trans.is_complete    
                            ,'default_negative_marks':trans.default_negative_marks    
                            ,'instructions'         :trans.instructions
                            ,'path'                 :path
                            ,'cutoff'               :trans.section_cutoff
                            ,'sub_section_name'     :trans.sub_section_name
                            ,'percentile'           :percentile_out

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

def update_section_instructions(request):
    error = False
    error_message_list = []
    output = Sections.objects.none()
    success = False
    message = "Request Recieved"
    instructions  = get_param(request, 'instructions', None)      
    data_id = get_param(request, 'data_id', None)      
    if data_id:
        try:
            section = Sections.objects.get(id=data_id)
        except:
            error = True
            error_message_list.append("Incorrect data_id")
    else:
        error = True
        error_message_list.append("Missing data_id")

    if instructions:
        try:
            instructions = json.loads(instructions)
            try:
                if len(instructions):
                    instruction_test = instructions[0]
            except:
                error = True
                error_message_list.append('Incorrect instructions | values: ["Sample Instruction"]')

        except:
            error = True
            error_message_list.append('Incorrect instructions | values: ["Sample Instruction"]')
    else:
        error = True
        error_message_list.append('Missing instructions | If no instruction send an empty list')

    if not error:
        section.instructions = instructions
        section.save()
        message = "Instructions Updated"
        success = True
        output = [section]
    else:
        message = "Error! | Refer Error List"
        success = False

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}


def complete_section(request):
    error = False
    success = False
    error_message_list = []
    output = []
    message = "Request Recieved"
    section_ids   = get_param(request, 'section_ids', None)
    is_complete     = get_param(request, 'is_complete', None)        
    check_is_complete = booleanvar_check(variable_name="is_complete",value=is_complete)
    if not check_is_complete['error']:
        is_complete = check_is_complete['output']
    else:
        error = True 
        error_message_list.append(check_is_complete['errormessage'])
        
    if not error:
        if section_ids:
            section_id_list = section_ids.split(",")

            for section_id in section_id_list:
                try:
                    section = Sections.objects.get(id=section_id)
                    section.is_complete = is_complete
                    section.save()
                    output.append(section)
                except:
                    error = True
                    error_message_list.append("Incorrect test_id : " + str(section_id))
        else:
            error = True
            error_message_list.append("Missing section_ids")

        if not error:
            if is_complete:
                message = "Section/s Marked Complete"
            else:
                message = "Section/s Marked Pending"
            success = True
        else:
            message = "Errors | Refer Error List!"
            success = False
    else:
        message = "Errors | Refer Error List!"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}


def validate_section(request):
    error = False
    error_message_list = []
    success = False
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    output = []
    total_records = 0 
    section_name = get_param(request,'section_name',None)    
    test_id = get_param(request,'test_id',None)    
    tranObjs = Sections.objects.none()
    test = Tests.objects.none()
    if test_id:
        try:
            test = Tests.objects.get(id=test_id)
        except:
            error = True
            error_message_list.append('Invalid test_id')    
    else:
        error = True
        error_message_list.append('Missing test_id')

    if not error:
        if section_name != None and section_name != "":
            section_name = cleanstring(section_name)
            try:
                tranObjs = Sections.objects.filter(name=section_name,test=test)[0]
                success = False
                output = [tranObjs]
                message = "Section name already used"
            except:
                success = True
                output = Tests.objects.none()
                message = "Valid Section Name"
        else:
            error = True
            error_message_list.append("Missing section_name")

    if not error:
        return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}
    else:
        message = "Errors | Refer error list"
        return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}



def create_update_section(request):
    error = False
    success = False
    error_message_list = []
    output = Sections.objects.none()
    message                    = "Request Recieved"
    operation                  = get_param(request, 'operation', None)
    # number_questions           = get_param(request, 'number_questions', None)      
    data_id                    = get_param(request, 'data_id', None)      
    assigned_to                = get_param(request, 'assigned_to',None)  
    is_eval_manual             = get_param(request, 'is_eval_manual', None)      
    test_id                    = get_param(request, 'test_id',None)
    to_complete_date           = get_param(request, 'to_complete_date', None) 
    name                       = get_param(request, 'name', None)   
    sub_section_name           = get_param(request, 'sub_section_name', name)   
    num_blank_allowed          = get_param(request, 'num_blank_allowed', None)      
    blank_negative_marks       = get_param(request, 'blank_negative_marks', None)      
    section_time               = get_param(request, 'section_time', None) 
    is_calculator              = get_param(request,'is_calculator',None)           
    def_positive_marks         = get_param(request,'def_positive_marks',1)           
    def_negative_marks         = get_param(request,'def_negative_marks',0)           
    section_cutoff             = get_param(request,'section_cutoff',0)           
    percentile_id              = get_param(request, 'percentile_id', None)
    

    check_def_positive_marks = floatvar_check(variable_name="def_positive_marks",value=def_positive_marks)     
    if not check_def_positive_marks['error']:
        def_positive_marks = check_def_positive_marks['output']
    else:
        error = check_def_positive_marks['error']
        error_message_list.append(check_def_positive_marks['errormessage'])

    check_def_negative_marks = floatvar_check(variable_name="def_negative_marks",value=def_negative_marks)     
    if not check_def_negative_marks['error']:
        def_negative_marks = check_def_negative_marks['output']
    else:
        error = check_def_negative_marks['error']
        error_message_list.append(check_def_negative_marks['errormessage'])

    percentile = None
    if percentile_id:
        try:
            percentile = PercentileTables.objects.get(id=percentile_id)
        except:
            error = True
            error_message_list.append("Incorrect percentile_id")
    

    if assigned_to != "" and assigned_to != None:
        try:
            assigned_to = CAUsers.objects.get(id=assigned_to)
        except:
            error = True
            error_message_list.append("Incorrect assigned_to id")                               
    else:
        assigned_to = None
    field_missing = 0 
    check_section_cutoff = floatvar_check(variable_name="section_cutoff",value=section_cutoff,missing_allowed=True)      
    if not check_section_cutoff['error']:
        section_cutoff = check_section_cutoff['output']
    else:
        if check_section_cutoff['is_missing']:
            fields_missing = fields_missing + 1
        else:
            error = check_section_cutoff['error']
            error_message_list.append(check_section_cutoff['errormessage'])


    if to_complete_date != "" and to_complete_date != None:
        try:
            to_complete_date = datetime.strptime(to_complete_date, "%Y-%m-%d")
        except:
            error = True
            error_message_list.append("Incorrect to_complete_date | value : %Y-%m-%d")                               
    else:
        to_complete_date = None
    
    # user fields check and correction
    if name:
        name = cleanstring(name)
    else:
        error = True
        error_message_list.append("Missing name")     

    if sub_section_name:
        sub_section_name = cleanstring(sub_section_name)
    else:
        error = True
        error_message_list.append("Missing sub_section_name")     


    check_is_calculator = booleanvar_check(variable_name="is_calculator",value=is_calculator)     
    if not check_is_calculator['error']:
        is_calculator = check_is_calculator['output']
    else:
        error = check_is_calculator['error']
        error_message_list.append(check_is_calculator['errormessage'])


    if operation == "create":
        if test_id:
            # print test_id
            try:
                test = Tests.objects.get(id=test_id)
            except:
                test = None
                error = True
                error_message_list.append("Incorrect test_id")                                           
        else:
            error = True
            error_message_list.append("Missing test_id")                               
    else:
        if data_id:
            try:
                section = Sections.objects.get(id=data_id)
                test = section.test
            except:
                error = True
                error_message_list = ['invalid data_id']
        else:
            error = True
            error_message_list = ['missing data_id']
            
    if test:
        if test.is_blank_negative and (test.blank_negative_type == "sectional"):
            check_num_blank_allowed = intvar_check(variable_name="num_blank_allowed",value=num_blank_allowed,missing_allowed=True)     
            if not check_num_blank_allowed['error']:
                num_blank_allowed = check_num_blank_allowed['output']
            else:
                if check_num_blank_allowed['is_missing']:
                    fields_missing = fields_missing + 1
                else:
                    error = check_num_blank_allowed['error']
                    error_message_list.append(check_num_blank_allowed['errormessage'])

            check_blank_negative_marks = floatvar_check(variable_name="blank_negative_marks",value=blank_negative_marks,missing_allowed=True)     
            if not check_blank_negative_marks['error']:
                blank_negative_marks = check_blank_negative_marks['output']
            else:
                if check_blank_negative_marks['is_missing']:
                    fields_missing = fields_missing + 1
                else:
                    error = check_blank_negative_marks['error']
                    error_message_list.append(check_blank_negative_marks['errormessage'])
        else:
            is_blank_negative = False
            num_blank_allowed = None
            blank_negative_type = None 
            blank_negative_marks = None

        if test.time_calculation == "sectional":
            check_section_time = intvar_check(variable_name="section_time",value=section_time)     
            if not check_section_time['error']:
                section_time = check_section_time['output']
            else:
                error = check_section_time['error']
                error_message_list.append(check_section_time['errormessage'])
        else:
            section_time = None
    else:
        if operation == "update":
            error = True
            error_message_list.append('Section not linked to any test')
        
    check_is_eval_manual = booleanvar_check(variable_name="is_eval_manual",value=is_eval_manual)     
    if not check_is_eval_manual['error']:
        is_eval_manual = check_is_eval_manual['output']
    else:
        error = check_is_eval_manual['error']
        error_message_list.append(check_is_eval_manual['errormessage'])

    # check_number_questions = intvar_check(variable_name="number_questions",value=number_questions)     
    # if not check_number_questions['error']:
    #     number_questions = check_number_questions['output']
    # else:
    #     error = check_number_questions['error']
    #     error_message_list.append(check_number_questions['errormessage'])


    
    # auto set fields                                
    ts = time.time()
    created_at = datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
    if request.user.is_anonymous:
        # edit_log = [{'user':{'id':'','first_name':'' ,'last_name':'','email':''},
        #             'time':created_at}]
        created_by = {'id':'','first_name':'' ,'last_name':'','email':''}                 
    else:
        # edit_log = [{'user':json.loads(str(request.user)),
        #             'time':created_at}]
        created_by = json.loads(str(request.user))

    if not error: 
        if operation == "create":
            sections_list = Sections.objects.filter(test=test)
            if sections_list.count() > 0:
                order = sections_list.count() + 1
            else:
                order = 1
            sections_check = Sections.objects.filter(test=test,name = name,sub_section_name=sub_section_name)
            if sections_check.count() > 0:
                success = False
                output = Sections.objects.none()
                message = "Section name already exists in the test"
            else:
                section = Sections.objects.create(
                    # number_questions        = number_questions
                    section_time            = section_time
                    ,num_blank_allowed       = num_blank_allowed
                    ,blank_negative_marks    = blank_negative_marks
                    ,name                    = name
                    ,sub_section_name                    = sub_section_name
                    # ,edit_log                = edit_log
                    ,is_calculator           = is_calculator
                    ,is_eval_manual          = is_eval_manual
                    ,to_complete_date        = to_complete_date
                    ,assigned_to             = assigned_to
                    ,created_by              = created_by
                    ,test                    = test
                    ,default_positive_marks  = def_positive_marks
                    ,default_negative_marks  = def_negative_marks
                    ,order                   = order
                    ,folder                  = test.folder
                    ,section_cutoff          = section_cutoff
                    ,percentile_table           = percentile      
                )
                
                output = [section]
                success = True
                message = "Section Created!"
            # add_del_section_test(section=section,test=test,operation="add")
            
        else:
            # section.number_questions        = number_questions
            section.section_time            = section_time
            section.num_blank_allowed       = num_blank_allowed
            section.blank_negative_marks    = blank_negative_marks
            section.name                    = name
            section.default_positive_marks  = def_positive_marks
            section.default_negative_marks  = def_negative_marks
            section.sub_section_name        = sub_section_name
            section.is_calculator           = is_calculator     
            section.is_eval_manual          = is_eval_manual
            section.to_complete_date        = to_complete_date
            section.assigned_to             = assigned_to
            section.section_cutoff          = section_cutoff
            section.percentile_table           = percentile      
            # log = section.edit_log
            # log.append(edit_log[0])
            # section.edit_log                = log
            section.save()
            output = [section]
            success = True
            message = "Section Updated!"
    else:
        message = "Errors | Refer Error List!"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}
            
def delete_section(request):
    error = False
    success = False
    error_message_list = []    
    data_id      = get_param(request, 'data_id', None)
    output = Sections.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            section = Sections.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if section:
            test = section.test
            order_section = section.order
            sections_list = Sections.objects.filter(test=test,order__gt=order_section)
            for sec in sections_list:
                old_order =  sec.order 
                sec.order = old_order - 1 
                sec.save()

            questions = section.sectionquestions_set.all()
            for ques in questions:
                test_list = ques.question.tests
                if test.id in test_list:
                    test_list.remove(test.id)
                ques.question.tests = test_list 
                ques.question.save()

            # questions = section.sectionquestionst
            # add_del_section_test(section=section,test=test,operation="delete")
            section.delete()
            message = "Section Deleted"
            success = True
        else:
            message = "Section not found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def read_sections(request):
    output = Sections.objects.none()
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    total_records = 0 
    test_name =   get_param(request,'test_name',None)  
    page_num = get_param(request, 'page_num', "1")
    page_size = get_param(request, 'page_size', "10")
    search = get_param(request,'search',None) 
    sort_by = get_param(request,'sort_by',None) 
    order = get_param(request,'order_by',None)    
    data_id = get_param(request,'data_id',None)    
    test_id = get_param(request,'test_id',None)  
    folder_id = get_param(request,'folder_id',None)  
    assigned_ids = get_param(request,'assigned_ids',None)  
    to_complete_date_start =   get_param(request,'to_complete_date_start',None)  
    to_complete_date_end =   get_param(request,'to_complete_date_end',None)  
    is_eval_manual =   get_param(request,'is_eval_manual',None)  
    is_calculator =   get_param(request,'is_calculator',None)  
    is_complete =   get_param(request,'is_complete',None)  
    
    if data_id != None and data_id != "":
        tranObjs = Sections.objects.filter(id=data_id)
    else:
        tranObjs = Sections.objects.all().order_by('order')
        if test_id !=None and  test_id !="" and test_id != "none":
            test_id_list = test_id.split(",")
            try:
                tranObjs = tranObjs.filter(test__id__in = test_id_list)
            except:
                error = True
                error_message_list.append('Incorrect test_id')


        if folder_id !=None and  folder_id !="":
            folder_id_list = folder_id.split(",")
            folder_id_list_new = [None if x == 'none' else x for x in folder_id_list]
            tranObjs = tranObjs.filter(folder__id__in = folder_id_list_new)



        if test_name != None and test_name!= "" and test_name !="none":
            try:
                test = Tests.objects.get(test_name=test_name)
                tranObjs.filter(test=test)
            except:
                error = True
                error_message_list.append('Incorrect test_name')

        if to_complete_date_start !=None and  to_complete_date_start !="" and to_complete_date_start != "none" and  to_complete_date_end !=None and  to_complete_date_end !="" and to_complete_date_end != "none":    
            try:
                to_complete_date_start = datetime.strptime(to_complete_date_start, "%Y-%m-%d")
                to_complete_date_end = datetime.strptime(to_complete_date_end, "%Y-%m-%d")
                
                tranObjs = tranObjs.filter(to_complete_date__range=(to_complete_date_start, to_complete_date_end))
            except:
                error = True
                success = False
                error_message_list.append("Incorrect to_complete_date_start | to_complete_date_end | value : %Y-%m-%d")                               


        if assigned_ids !=None and  assigned_ids !="" and assigned_ids != "none":
            assigned_ids_list    = assigned_ids.split(",")
            try:
                tranObjs        = tranObjs.filter(assigned_to__id__in = assigned_ids_list)
            except:
                error = True
                error_message_list.append('Incorrect assigned_ids')

        if is_eval_manual !=None and is_eval_manual !=""  and is_eval_manual != "none":
            if is_eval_manual == "1":
                tranObjs = tranObjs.filter(is_eval_manual=True)
            else:
                tranObjs = tranObjs.filter(is_eval_manual=False)

        if is_complete !=None and is_complete !=""  and is_complete != "none":
            if is_complete == "1":
                tranObjs = tranObjs.filter(is_complete=True)
            else:
                tranObjs = tranObjs.filter(is_complete=False)

        if is_calculator !=None and is_calculator !=""  and is_calculator != "none":
                if is_calculator == "1":
                    tranObjs = tranObjs.filter(is_calculator=True)
                else:
                    tranObjs = tranObjs.filter(is_calculator=False)

        # Filters/Sorting Start
        if search !=None and search !="":
            tranObjs = tranObjs.filter(name__icontains=search)

        if sort_by !=None and sort_by !="" and sort_by != "none":
            if order == "asc":
                tranObjs = tranObjs.order_by(sort_by)
            else:
                tranObjs = tranObjs.order_by("-" + sort_by)
        # Filters/Sorting End


    # pagination variable

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
    
    
       
    filters['sort_by'] = [
                            {'value':'name','label':'Section Name'},
                            {'value':'to_complete_date','label':'Completion Date'},
                            {'value':'created_at','label':'Created At'},
                            {'value':'modified_at','label':'Modified At'},                                
                         ]
    filters['order_by'] = [
                           {'value':'asc','label':'Ascending'},
                           {'value':'desc','label':'Descending'}
                          ]       
    filters['percentile'] = map(lambda x :{'value':x.id,'label':str(x.table_name).title() },PercentileTables.objects.all())
    filters['is_eval_manual'] = [{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    filters['assigned_to'] = map(lambda x :{'value':x.id,'label':str((x.first_name).title() + " " + (x.last_name).title()) },CAUsers.objects.filter(is_staff=True,is_active=True))             
    filters['is_calculator']=[{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    filters['is_complete'] = [{'value':'0','label':'Pending'},{'value':'1','label':'Complete'}]   
    filters['folders'] = [{'value':'none','label':'None'}]
    folders = TestFolder.objects.all()
    for folder in folders:
        filters['folders'].append({
            'value':folder.id,
            'label':folder.folder_name
        })
 
    # filters['folders'] = map(lambda x :{'value':x.id,'label':str(x.folder_name) },TestFolder.objects.all())
    filters['tests'] = []
    Testlist = Tests.objects.all()
    for t in Testlist:
        filters['tests'].append({
            'value':t.id,
            'label':t.test_name
        })

    if not error:
        message  = "Success!"
        success = True
        return({
            'output':tranObjs,
            'num_pages':num_pages,
            'total_records':total_records,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'message':message,
            'success':success
        })
    else:
        success = False
        message = "Errors | Refer error list!"
        return({
            'output':Sections.objects.none(),
            'num_pages':1,
            'total_records':0,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'message':message,
            'success':success
        })

def copy_section(request):
    output = []
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    test_id = get_param(request,'test_id',None)    
    section_ids = get_param(request,'section_ids',None)
    if test_id:
        try:
            test = Tests.objects.get(id=test_id)
        except:
            error = True
            error_message_list.append("Incorrect test_id")
    else:
        error = True
        error_message_list.append("Missing test_id")

    if not error:
        if section_ids:
            section_id_list = section_ids.split(",")
            for section_id in section_id_list:
                try:
                    sections_list = Sections.objects.filter(test=test)
                    count_sections = sections_list.count()
                    section = Sections.objects.get(id=section_id)
                    questions = section.sectionquestions_set.all()
                    section.id = None
                    section.save()   
                    for ques in questions:
                        ques.id = None
                        test_list = ques.question.tests
                        test_list.append(test.id)
                        ques.question.tests = test_list
                        ques.question.save()
                        ques.section = section    
                        ques.save()
                    print count_sections
                    if count_sections > 0:
                        order = count_sections + 1
                    else:
                        order = 1
                    section.order = order
                    section.folder = test.folder
                    if test.time_calculation == "overall" or test.time_calculation == "untimed":
                        section.section_time = None
                    if not test.is_blank_negative:
                        section.num_blank_allowed = None
                        section.blank_negative_marks = None
                    else:
                        if test.blank_negative_type == "overall":
                            section.num_blank_allowed = None
                            section.blank_negative_marks = None
    
                    
                    section.test = test
                    sections_check = Sections.objects.filter(test=test,name = section.name)
                    if sections_check.count() > 0:                        
                        section.name = str(section.name)  + " copy" 
                    # add_del_section_test(section_id=section.id,test_id=test_id,operation="add")
                    section.save()
                    output.append(section)
                    
                    # for ques in questions:
                    #     ques.id = None
                    #     ques

                except:
                    error = True
                    error_message_list.append("Incorrect section_id : " + str(section_id))
        else:
            error = True
            error_message_list.append("Missing section_ids")

        if not error:
            message = "Sections Copied"
            success = True
        else:
            message = "Errors | Refer Error List!"
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def order_section_change(request):
    output = Sections.objects.none()
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    # test_id             = get_param(request,'test_id',None)    
    data_id             = get_param(request,'data_id',None)
    up_down             = get_param(request,'up_down',None)
    position            = get_param(request,'position',None)

    if data_id:
        try:
            section = Sections.objects.get(id=data_id)
            test = section.test
            if test == None:
                error = True
                error_message_list.append("Section data_id not in any test")    
        except:
            error = True
            error_message_list.append("Incorrect data_id")
    else:
        error = True
        error_message_list.append("Missing test_id")

    error1=False
    error2 = False
    
    error_message1 = ""
    error_message2 = ""

    check_position      = intvar_check(variable_name="position",value=position)
    if not check_position['error']:
        position = check_position['output']
    else:
        error1 = check_position['error']
        error_message1 = check_position['errormessage']


    check_movement_type = listvar_check(variable_name="up_down",value=up_down, allowedlist=section_movement_allowed)     
    if not check_movement_type['error']:
        up_down = check_movement_type['output']
    else:
        error2 = check_movement_type['error']
        error_message2 = check_movement_type['errormessage']
    

    if error1 and error2:
        error = True
        if error1:
            error_message_list.append(error_message1) 
        else:
            error_message_list.append(error_message2) 

    if not error:
        if data_id:
            if test.sections_set.filter(id=data_id).count() > 0:
                if not error1:
                    # all_sections = test.sections_list
                    if (test.sections_set.all().count() >= (position + 1)) and position >= 0:
                        order = position + 1
                        # priorities between range to be corrected rather than all of them
                        if order >= section.order:
                            sections_list = Sections.objects.filter(test=test,order__range=(section.order,order))
                            change = -1
                        else:
                            sections_list = Sections.objects.filter(test=test,order__range=(order,section.order))
                            change = 1
                        print change
                        for sec in sections_list:
                            if sec == section:
                                print sec.name +" " + str(order)
                                
                                sec.order = order
                            else:
                                print sec.name +" " + str(sec.order + change)
                                new_order = (sec.order + change)
                                sec.order = new_order
                            sec.save()
                        message = ("Section moved to " + str(position))
                    else:
                        error = True
                        error_message_list.append('postion out of index')
                else:
                    all_sections        = Sections.objects.filter(test=test)
                    len_sections        = all_sections.count()
                    order_current    = section.order
                    if up_down == "up" and order_current != 1:
                        order = order_current - 1
                    elif up_down == "down" and order_current != len_sections:
                        order = order_current + 1
                    else:
                        order = order_current           
                    print order
                    print test
                    section_to_change = Sections.objects.get(test=test,order=order)
                    section_to_change.order = order_current
                    section_to_change.save()
                    section.order = order
                    section.save()

                    message = ("Section moved " + str(up_down))

                    # section_to_change = Sections.objects.get(test=test,order=order)
                    # section_to_change.order = order_current
                    # section_to_change.save()
                    # section.order = order
                    # section.save()

                    # message = ("Section moved " + str(up_down))
            else:
                error = True
                error_message_list.append("Missing data_id in given test_id")                
        else:
            error = True
            error_message_list.append("Missing data_id")

        if not error:
            success = True
            output = Sections.objects.filter(test=test).order_by('order')
        else:
            message = "Errors | Refer Error List!"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}


#<----------------- Section CRUD End --------------------------->

#<----------------- Percentile CRUD End --------------------------->

def create_update_table(request):
    error = False
    success = False
    error_message_list = []
    output = PercentileTables.objects.none()
    message = "Request Recieved"
    operation          = get_param(request, 'operation', None)
    table_name         = get_param(request, 'table_name', None)    
    table_dict         =   get_param(request, 'table_dict', None)    
    # marks_gap          =   get_param(request, 'marks_gap', None)    
    data_id            = get_param(request, 'data_id', None)      
    # user fields check and correction

    if table_name:
        table_name = cleanstring(table_name.lower())
    else:
        error = True
        error_message_list.append("Missing table_name")                               

    if table_dict:
        try:
            table_dict = json.loads(table_dict)
        except:
            error = True
            error_message_list.append("Invalid table_dict")   
    else:
        error = True
        error_message_list.append("Missing table_dict")   

    # check_marks_gap      = intvar_check(variable_name="marks_gap",value=marks_gap)
    # if not check_marks_gap['error']:
    #     marks_gap = check_marks_gap['output']
    # else:
    #     error = check_marks_gap['error']
    #     error_message_list.append(check_marks_gap['errormessage'])


    if operation == "update":
        if data_id:
            try:
                table = PercentileTables.objects.get(id=data_id)
            except:
                error = True
                error_message_list = ['invalid data_id']
        else:
            error = True
            error_message_list = ['missing data_id']
        

    if not error: 
        if operation == "create":
            table = PercentileTables.objects.filter(table_name=table_name)
            if table.count() > 0 :
                message = "Table Already Exists!"        
                output = table
                success = False
            else:
                table_new = PercentileTables.objects.create(
                    table_name                   = table_name                 ,
                    table                          = table_dict                 ,
                    # marks_gap                   = marks_gap                 
                )
                output = [table_new]
                success = True
                message = "Table Created!"
        else:
            table.table_name           = table_name                 
            table.table                = table_dict
            # table.marks_gap            = marks_gap
            table.save()
            output = [table]
            success = True
            message = "Table Updated!"
    else:
        message = "Errors | Refer Error List!"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def delete_table(request):
    error   = False
    success = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output = PercentileTables.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            table = PercentileTables.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if table:
            table.delete()
            message = "Table Deleted"
            success = True
        else:
            message = "Table not found"
            success = False
    else:
        message = "Errors | Refer Error List!"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def read_tables(request):
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    total_records = 0 
    tranObjs = PercentileTables.objects.none()
    page_num = get_param(request, 'page_num', "1")
    page_size = get_param(request, 'page_size', "10")
    search = get_param(request,'search',None) 
    sort_by = get_param(request,'sort_by',None) 
    order = get_param(request,'order_by',None)    
    data_id = get_param(request,'data_id',None)    
    
    if data_id != None and data_id != "":
        tranObjs = PercentileTables.objects.filter(id=data_id)
    else:
        tranObjs = PercentileTables.objects.all()


        # Filters/Sorting Start
        if search !=None and search !="":
            tranObjs = tranObjs.filter(Q(table_name__icontains=search))

        if sort_by !=None and sort_by !="" and sort_by != "none":
            if order == "asc":
                tranObjs = tranObjs.order_by(sort_by)
            else:
                tranObjs = tranObjs.order_by("-" + sort_by)
        # Filters/Sorting End
    # pagination variable

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
    message  = "Success!"
    success = True
    filters['sort_by'] = [
                        {'value':'table_name','label':'Name'}
                       ]
    filters['order_by'] = [{'value':'asc','label':'Ascending'},
                           {'value':'desc','label':'Descending'}]
    

    return({
        'output':tranObjs,
        'num_pages':num_pages,
        'total_records':total_records,
        'error':error,
        'error_message_list':error_message_list,
        'filter':filters,
        'message':message,
        'success':success
    })

def crud_table(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = PercentileTables.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_default)
    if not check_operation['error']:
        if operation == "read":
            out_read_tables = read_tables(request) 
            message = out_read_tables['message']               
            tranObjs = out_read_tables['output']
            error_message_list.extend(out_read_tables['error_message_list'])               
            error = out_read_tables['error']     
            status = out_read_tables['success']     
            num_pages     = out_read_tables['num_pages']          
            filters       = out_read_tables['filter']     
            total_records = out_read_tables['total_records']          

        if operation in ["create","update"]:
            out_create_update_table = create_update_table(request) 
            message = out_create_update_table['message']               
            tranObjs = out_create_update_table['output']
            error_message_list.extend(out_create_update_table['error_message_list'])               
            error = out_create_update_table['error']   
            status = out_create_update_table['success']          

        if operation == "delete":
            out_delete_table = delete_table(request) 
            message = out_delete_table['message']               
            tranObjs = out_delete_table['output']               
            error_message_list.extend(out_delete_table['error_message_list'])               
            error = out_delete_table['error']     
            status = out_delete_table['success']           

        if not error:
            for trans in tranObjs:
                result.append({
                        'id':trans.id,
                        'table_name':trans.table_name,
                        'table':trans.table,
                        # 'marks_gap':trans.marks_gap
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


#<----------------- Percentile CRUD End --------------------------->


