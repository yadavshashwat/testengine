from django.shortcuts import render
from django.http import HttpResponseRedirect,HttpResponseForbidden,HttpResponse
from django.core.paginator import Paginator
from django.core import serializers
from models import *
from django.db.models import Q
from overall.views import get_param,cleanstring
from testmgmt.models import Sections
import math
import json
import time
from datetime import datetime
import operator
from fuzzywuzzy import fuzz
from overall.views import booleanvar_check, listvar_check, intvar_check, floatvar_check
import urllib
# Create your views here.
operations_allowed_question = ['create','read','update','delete','move','live']
operations_allowed_default = ['create','read','update','delete']
operations_allowed_folders = ['create','read','update','delete','move']
operations_allowed_passages = ['create','read','update','delete','validate']
operations_allowed_sec_question = ['create','read','update','delete','copy','order_change','marks_update','live']
question_movement_allowed = ['up','down']
question_types = {
                  'mcq_single':'MCQ Single',
                  'mcq_multiple':'MCQ Multiple',
                  'word':'Word',
                  'number':'Number',
                  'essay':'Essay',
                  'chooseorder':'Choose Order',
                  }

question_types_list = [
                 'mcq_single'
                ,'mcq_multiple'
                ,'word'
                ,'number'
                ,'essay'
                ,'chooseorder'
                ]

single_num_set_question_types = [
                 'mcq_single'
                ,'mcq_multiple'
                ,'word'
                ,'number'
                ,'essay'
                ,'chooseorder'
                ]

evaluable_questions = [
                    'mcq_single'
                    ,'mcq_multiple'
                    ,'word'
                    ,'number'
                    ]

no_evaluable_questions = [
    'chooseorder',
    'essay'
]
difficulty_types_list = [
                 '1'
                ,'2'
                ,'3'
                ,'4'
                ,'5'
                ,'6']


answer_option_dict = {
       "options":[
            {"id":"1","value":"option 1"},
            {"id":"2","value":"option 2"}
        ]
}



correct_answer_dict_mcq_multiple = {
   "answer":["1","2"]
}

correct_answer_dict_mcq_single = {
   "answer":"1"
}

correct_answer_dict_chooseorder = {
   "answer":["1","2"]
}

correct_answer_worddict = {
   "answer":"word"
}

correct_answer_numberdict = {
   "answer":"1213.2312"
}

correct_answer_essay = {
   "answer":"essay"
}


empty_correct_answer_dict_mcq_multiple = {
   "answer":[]
}

empty_correct_answer_dict_mcq_single = {
   "answer":""
}

empty_correct_answer_dict_chooseorder = {
   "answer":[]
}

empty_correct_answer_worddict = {
   "answer":""
}

empty_correct_answer_numberdict = {
   "answer":""
}

empty_correct_answer_essay = {
   "answer":""
}






# <------------------ CRUD Topics Start --------------------->

def create_update_topic(request):
    error = False
    success = False
    error_message_list = []
    output = Topics.objects.none()
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



    if category:
        category = cleanstring(category.lower())
    else:
        error = True
        error_message_list.append("Missing category")                               

    if description:
        description = cleanstring(description)
    else:
        pass
        # error = True
        # error_message_list.append("Missing description")                               


    if operation == "update":
        if data_id:
            try:
                topic = Topics.objects.get(id=data_id)
            except:
                error = True
                error_message_list = ['invalid data_id']
        else:
            error = True
            error_message_list = ['missing data_id']
        
    if not error: 
        if operation == "create":
            topic = Topics.objects.filter(category=category,sub_category=sub_category)
            if topic.count() > 0 :
                message = "Topic Already Exists!"        
                output = topic
                success = False
            else:
                topic_new = Topics.objects.create(
                    category                   = category                 
                    ,sub_category              = sub_category             
                    ,description               = description                 
                )
                output = [topic_new]
                success = True
                message = "Topic Created!"
        else:
            topic.category           = category                 
            topic.sub_category       = sub_category             
            topic.description        = description
            topic.save()
            output = [topic]
            success = True
            message = "Topic Updated!"
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def delete_topic(request):
    error = False
    success = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output = Topics.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            topic = Topics.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if topic:
            topic.delete()
            message = "Topic Deleted"
            success = True
        else:
            message = "Topic not found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def read_topics(request):
    
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    total_records = 0 
    tranObjs = Topics.objects.none()
    page_num = get_param(request, 'page_num', "1")
    page_size = get_param(request, 'page_size', "10")
    search = get_param(request,'search',None) 
    sort_by = get_param(request,'sort_by',None) 
    order = get_param(request,'order_by',None)    
    category = get_param(request,'category',None) 
    data_id = get_param(request,'data_id',None)    
    folder_id = get_param(request,'folder_id',None)    
    
    if data_id != None and data_id != "":
        tranObjs = Topics.objects.filter(id=data_id)
    else:
        tranObjs = Topics.objects.all()

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
    
    category_list = Topics.objects.all()
    filters['category'] = []
    for item in category_list:
        filters['category'].append({
            'value':item.category,
            'label':(item.category).title()
            })
    filters['category'] = {v['value']:v for v in filters['category']}.values()
    filters['category'] = sorted(filters['category'], key=operator.itemgetter('value'))

    filters['sort_by'] = [
                        {'value':'category','label':'Category'},
                        {'value':'sub_category','label':'Topic'},
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

def crud_topics(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = Topics.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_default)
    if not check_operation['error']:
        if operation == "read":
            out_read_topics = read_topics(request) 
            message = out_read_topics['message']               
            tranObjs = out_read_topics['output']
            error_message_list.extend(out_read_topics['error_message_list'])               
            error = out_read_topics['error']     
            status = out_read_topics['success']     
            num_pages     = out_read_topics['num_pages']          
            filters       = out_read_topics['filter']     
            total_records = out_read_topics['total_records']          

        if operation in ["create","update"]:
            out_create_update_topic = create_update_topic(request) 
            message = out_create_update_topic['message']               
            tranObjs = out_create_update_topic['output']
            error_message_list.extend(out_create_update_topic['error_message_list'])               
            error = out_create_update_topic['error']   
            status = out_create_update_topic['success']          

        if operation == "delete":
            out_delete_topic = delete_topic(request) 
            message = out_delete_topic['message']               
            tranObjs = out_delete_topic['output']               
            error_message_list.extend(out_delete_topic['error_message_list'])               
            error = out_delete_topic['error']     
            status = out_delete_topic['success']           

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



# <------------------ CRUD Topics End --------------------->

# <------------------ CRUD Super Folders Start --------------------->


def crud_supfolders(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = QuestionSuperFolder.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_default)
    if not check_operation['error']:
        if operation == "read":
            out_read_folders = read_supfolders(request) 
            message = out_read_folders['message']               
            tranObjs = out_read_folders['output']
            error_message_list.extend(out_read_folders['error_message_list'])               
            error = out_read_folders['error']     
            num_pages = out_read_folders['num_pages']          
            filters = out_read_folders['filter']     
            total_records = out_read_folders['total_records']          
            status = out_read_folders['success']          
        
        if operation in ["create","update"]:  
            out_create_update_folder = create_update_supfolder(request=request)
            message = out_create_update_folder['message']
            error = out_create_update_folder['error']
            tranObjs = out_create_update_folder['output']
            error_message_list.extend(out_create_update_folder['error_message_list'])
            status = out_create_update_folder['success']          

        if operation == "delete":
            out_delete_folder = delete_supfolder(request)
            message = out_delete_folder['message']
            error = out_delete_folder['error']
            tranObjs = out_delete_folder['output']
            error_message_list.extend(out_delete_folder['error_message_list'])
            status = out_delete_folder['success']          
        
        if not error:
            for trans in tranObjs:
                result.append({
                            'id':trans.id,
                            'folder_name':trans.folder_name,
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

def create_update_supfolder(request):
    error = False
    error_message_list = []
    output = QuestionSuperFolder.objects.none()
    success = False
    message = "Request Recieved"
    folder_name  = get_param(request, 'folder_name', None)
    operation = get_param(request, 'operation', None)
    data_id      = get_param(request, 'data_id', None)

    if folder_name == None or folder_name == "":
        error = True
        error_message_list.append("Missing folder_name")
    else:
        # folder_name  = cleanstring(folder_name.lower())
        folder_name  = cleanstring(folder_name)
        
    if operation == "update":
        if data_id:
            try:
                questionfolder = QuestionSuperFolder.objects.get(id=data_id)                    
            except:
                error = True
                error_message_list.append("Invalid data_id")
                questionfolder = QuestionSuperFolder.objects.none()
        else:
            error = True
            error_message_list.append("Missing data_id")

    if not error:
        if operation == "create":
            questionfolder = QuestionSuperFolder.objects.filter(folder_name=folder_name)
            if questionfolder.count() > 0 :
                message = "Question Folder already exists"
                success = False                
                output = QuestionSuperFolder.objects.none()
            else:
                questionfolder_new = QuestionSuperFolder.objects.create(
                    folder_name            = folder_name,
                )
                output = [questionfolder_new]
                success = True
                message = "Question Folder Created"
        else:

            if QuestionSuperFolder.objects.filter(folder_name = folder_name).count() > 1 :
                success = False
                message = "Question folder already exist"
                output = []
            elif QuestionSuperFolder.objects.filter(folder_name = folder_name).count() == 1 :                
                if questionfolder.id == QuestionFolder.objects.filter(folder_name = folder_name)[0].id:
                    questionfolder.folder_name            = folder_name
                    questionfolder.save()
                    output = [questionfolder]
                    message = "Question Folder Updated"
                    success = True
                else:  
                    success = False
                    message = "Question Folder already exist"
                    output = []
            else:
                questionfolder.folder_name            = folder_name
                questionfolder.save()
                output = [questionfolder]
                message = "Question Folder Updated"
                success = True
    else:
        message = "Error | Refer error list"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}    

def read_supfolders(request):
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
    tranObjs = QuestionSuperFolder.objects.none()
    if data_id != None and data_id != "":
        try:
            tranObjs = QuestionSuperFolder.objects.filter(id=data_id)
        except:
            error = True
            error_message_list.append("Incorrect data_id")
    else:
        tranObjs = QuestionSuperFolder.objects.all().order_by('folder_name')
        # Filters/Sorting Start
        if search !=None and search !="":
            tranObjs = tranObjs.filter(Q(folder_name__icontains=search))
        
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
                            {'value':'folder_name','label':'Folder Name'}
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
            'output':QuestionSuperFolder.objects.none(),
            'num_pages':1,
            'total_records':0,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'success':success,
            'message':message
        })


def delete_supfolder(request):
    error = False
    success = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output = QuestionSuperFolder.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            questionfolder = QuestionSuperFolder.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if questionfolder:
            questionfolder.delete()
            message = "Question Folder Deleted"
            success = True
        else:
            message = "Question Folder Not Found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

# <------------------ CRUD Super Folders End --------------------->

# <------------------ CRUD Folders Start --------------------->

def crud_folders(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = QuestionFolder.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_folders)
    if not check_operation['error']:
        if operation == "read":
            out_read_folders = read_folders(request) 
            message = out_read_folders['message']               
            tranObjs = out_read_folders['output']
            error_message_list.extend(out_read_folders['error_message_list'])               
            error = out_read_folders['error']     
            num_pages = out_read_folders['num_pages']          
            filters = out_read_folders['filter']     
            total_records = out_read_folders['total_records']          
            status = out_read_folders['success']          
        
        if operation in ["create","update"]:  
            out_create_update_folder = create_update_folder(request=request)
            message = out_create_update_folder['message']
            error = out_create_update_folder['error']
            tranObjs = out_create_update_folder['output']
            error_message_list.extend(out_create_update_folder['error_message_list'])
            status = out_create_update_folder['success']          

        if operation == "delete":
            out_delete_folder = delete_folder(request)
            message = out_delete_folder['message']
            error = out_delete_folder['error']
            tranObjs = out_delete_folder['output']
            error_message_list.extend(out_delete_folder['error_message_list'])
            status = out_delete_folder['success']    

        if operation == "move":
            out_move_folder = move_folder(request)
            message = out_move_folder['message']
            error = out_move_folder['error']
            tranObjs = out_move_folder['output']
            error_message_list.extend(out_move_folder['error_message_list'])
            status = out_move_folder['success']          

        
        if not error:
            for trans in tranObjs:
                if trans.super_folder:
                    super_folder = json.loads(str(trans.super_folder))
                    path = "/testengine/adminpanel/question-folder/" + trans.super_folder.folder_name + "/" + trans.folder_name + "/"
                else:
                    super_folder = {'id':'','sup_folder_name':''}
                    path = "/testengine/adminpanel/question-folder/allfolders/" + trans.folder_name + "/"
                

                result.append({
                            'id':trans.id,
                            'folder_name':trans.folder_name,
                            'description':trans.description,
                            'created_at':str(trans.created_at)[:16],
                            'modified_at':str(trans.modified_at)[:16],
                            'super_folder':super_folder,
                            'path':path

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


def move_folder(request):
    output = []
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    folder_id = get_param(request,'folder_id',None)    
    bank_ids = get_param(request,'bank_ids',None)

    if folder_id:
        try:
            folder = QuestionSuperFolder.objects.get(id=folder_id)
        except:
            error = True
            error_message_list.append("Incorrect folder_id")
    else:
        error = True
        error_message_list.append("Missing folder_id")

    if not error:
        if bank_ids:
            bank_id_list = bank_ids.split(",")
            for bank_id in bank_id_list:
                try:
                    bank = QuestionFolder.objects.get(id=bank_id)
                    bank.super_folder = folder
                    bank.save()
                    output.append(bank)
                except:
                    error = True
                    error_message_list.append("Incorrect question_id : " + str(bank_id))
        else:
            error = True
            error_message_list.append("Missing bank_ids")

        if not error:
            message = "All Question Banks Moved"
            success = True
        else:
            message = "Errors | Refer Error List!"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}


def create_update_folder(request):
    error = False
    error_message_list = []
    output = QuestionFolder.objects.none()
    success = False
    message = "Request Recieved"
    folder_name  = get_param(request, 'folder_name', None)
    description  = get_param(request,'desc',None)
    operation    = get_param(request, 'operation', None)
    data_id      = get_param(request, 'data_id', None)
    sup_folder_id   = get_param(request, 'sup_folder_id', None)

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
    
    if operation == "create":
        if sup_folder_id != None or sup_folder_id != "":
            try:
                super_folder = QuestionSuperFolder.objects.get(id = sup_folder_id)
            except:
                error = True
                error_message_list.append("Invalid sup_folder_id")
        else:
            error = True
            error_message_list.append("Missing sup_folder_id")

    if operation == "update":
        if data_id:
            try:
                questionfolder = QuestionFolder.objects.get(id=data_id)                    
            except:
                error = True
                error_message_list.append("Invalid data_id")
                questionfolder = QuestionFolder.objects.none()
        else:
            error = True
            error_message_list.append("Missing data_id")

    if not error:
        if operation == "create":
            questionfolder = QuestionFolder.objects.filter(folder_name=folder_name)
            if questionfolder.count() > 0 :
                message = "Question Bank already exists"
                success = False                
                output = QuestionFolder.objects.none()
            else:
                questionfolder_new = QuestionFolder.objects.create(
                    folder_name            = folder_name,
                    description            = description,
                    super_folder           = super_folder
                )
                output = [questionfolder_new]
                success = True
                message = "Question Bank Created"
        else:

            if QuestionFolder.objects.filter(folder_name = folder_name).count() > 1 :
                success = False
                message = "Question bank already exist"
                output = []
            elif QuestionFolder.objects.filter(folder_name = folder_name).count() == 1 :                
                if questionfolder.id == QuestionFolder.objects.filter(folder_name = folder_name)[0].id:
                    questionfolder.folder_name            = folder_name
                    questionfolder.description            = description
                    questionfolder.save()
                    output = [questionfolder]
                    message = "Question Bank Updated"
                    success = True
                else:  
                    success = False
                    message = "Question bank already exist"
                    output = []
            else:
                questionfolder.folder_name            = folder_name
                questionfolder.description            = description
                questionfolder.save()
                output = [questionfolder]
                message = "Question Bank Updated"
                success = True
 
            # if QuestionFolder.objects.filter(folder_name = folder_name).count() > 0 :
            #     success = False
            #     message = "Question Bank already exist"
            #     output = []
            # else:
            #     questionfolder.folder_name            = folder_name
            #     questionfolder.description            = description
            #     questionfolder.save()
            #     output = [questionfolder]
            #     message = "Question Bank Updated"
            #     success = True
    else:
        message = "Error | Refer error list"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}    

def read_folders(request):
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
    sup_folder   = get_param(request, 'sup_folder', None)
    sup_folder_id   = get_param(request, 'sup_folder_id', None)

    tranObjs = QuestionFolder.objects.none()
    if data_id != None and data_id != "":
        try:
            tranObjs = QuestionFolder.objects.filter(id=data_id)
        except:
            error = True
            error_message_list.append("Incorrect data_id")
    else:
        tranObjs = QuestionFolder.objects.all().order_by('folder_name')

        if sup_folder_id !=None and  sup_folder_id !="":
            sup_folder_id_list = sup_folder_id.split(",")
            sup_folder_id_list_new = [None if x == 'none' else x for x in sup_folder_id_list]
            tranObjs = tranObjs.filter(super_folder__id__in = sup_folder_id_list_new)


        if sup_folder != None and sup_folder != "" and sup_folder !="allfolders":
            try:
                folder_name = cleanstring(sup_folder)
                super_folder = QuestionSuperFolder.objects.filter(folder_name = sup_folder)[0]
                tranObjs = tranObjs.filter(super_folder = super_folder)
            except:
                error = True
                error_message_list.append('Incorrect Folder name')

        
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
                            {'value':'created_at','label':'Created At'},
                            {'value':'modified_at','label':'Modified At'}

                        ]
    filters['order_by'] = [
                            {'value':'asc','label':'Ascending'},
                            {'value':'desc','label':'Descending'}
                            ]    

    filters['sup_folders'] = [{'value':'none','label':'None'}]
    folders = QuestionSuperFolder.objects.all()
    for folder in folders:
        filters['sup_folders'].append({
            'value':folder.id,
            'label':folder.folder_name
        })



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
            'output':QuestionFolder.objects.none(),
            'num_pages':1,
            'total_records':0,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'success':success,
            'message':message
        })

def delete_folder(request):
    error = False
    success = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output = QuestionFolder.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            questionfolder = QuestionFolder.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if questionfolder:
            questionfolder.delete()
            message = "Question Bank Deleted"
            success = True
        else:
            message = "Question Bank Not Found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

# <------------------ CRUD Folders End --------------------->

# <------------------ CRUD Passages Start --------------------->

def crud_passages(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = Passages.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_passages)
    if not check_operation['error']:
        if operation == "read":
            out_read_passage = read_passage(request) 
            message = out_read_passage['message']               
            tranObjs = out_read_passage['output']
            error_message_list.extend(out_read_passage['error_message_list'])               
            error = out_read_passage['error']     
            num_pages = out_read_passage['num_pages']          
            filters = out_read_passage['filter']     
            total_records = out_read_passage['total_records']          
            status = out_read_passage['success']          

        
        if operation in ["create","update"]:  
            out_create_update_passage = create_update_passage(request=request)
            message = out_create_update_passage['message']
            error = out_create_update_passage['error']
            tranObjs = out_create_update_passage['output']
            error_message_list.extend(out_create_update_passage['error_message_list'])
            status = out_create_update_passage['success']          

        if operation == "validate":  
            out_validate_passage = validate_passage(request=request)
            message = out_validate_passage['message']
            error = out_validate_passage['error']
            tranObjs = out_validate_passage['output']
            error_message_list.extend(out_validate_passage['error_message_list'])
            status = out_validate_passage['success']          

        if operation == "delete":
            out_delete_passage = delete_passage(request)
            message = out_delete_passage['message']
            error = out_delete_passage['error']
            tranObjs = out_delete_passage['output']
            error_message_list.extend(out_delete_passage['error_message_list'])
            status = out_delete_passage['success']          
        
        if not error:
            for trans in tranObjs:
                result.append({
                        'id':trans.id,
                        'header':trans.header,
                        'passage':trans.passage,
                        'data_table':trans.data_table
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

def create_update_passage(request):
    error = False
    error_message_list = []
    output = Passages.objects.none()
    success = False
    message = "Request Recieved"
    text  = get_param(request,'text',None)
    operation = get_param(request, 'operation', None)
    data_id      = get_param(request, 'data_id', None)
    if text == None or text == "":
        error = True
        error_message_list.append("Missing text")
        
    if operation == "update":
        if data_id:
            try:
                passage = Passages.objects.get(id=data_id)                    
            except:
                error = True
                error_message_list.append("Invalid data_id")
                passage = Passages.objects.none()
        else:
            error = True
            error_message_list.append("Missing data_id")

    if not error:
        if operation == "create":
            passage = Passages.objects.filter(passage=text)
            if passage.count() > 0:
                message = "Passage already exists"
                success = False                
                output = passage
            else:
                passagenew = Passages.objects.create(passage=text)
                output = [passagenew]
                success = True
                message = "Passage Created"
        else:
            passage.passage            = text
            passage.save()
            output = [passage]
            message = "Passage Updated"
            success = True
    else:
        message = "Error | Refer error list"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}    



def validate_passage(request):
    error = False
    error_message_list = []
    success = False
    message = "Request Recieved!"
    filters = {}
    output = []
    num_pages = 1
    total_records = 0 
    data_id = get_param(request,'data_id',None)    
    tranObjs = Passages.objects.none()
    if data_id != None and data_id != "":
        try:
            tranObjs = Passages.objects.get(id=data_id)
            success = True
            output = [tranObjs]
            message = "Valid Passage ID"
        except:
            success = False
            output = Passages.objects.none()
            message = "Invalid Passage ID"
    else:
        error = True
        error_message_list.append("Missing data_id")

    if not error:
        return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}
    else:
        message = "Errors | Refer error list"
        return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def read_passage(request):
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
    tranObjs = Passages.objects.none()
    if data_id != None and data_id != "":
        try:
            tranObjs = Passages.objects.filter(id=data_id)
        except:
            error = True
            error_message_list.append("Incorrect data_id")
    else:
        tranObjs = Passages.objects.all()
        # Filters/Sorting Start
        
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
            'output':Passages.objects.none(),
            'num_pages':1,
            'total_records':0,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'success':success,
            'message':message
        })

def delete_passage(request):
    error = False
    success = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output = Passages.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            passage = Passages.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if passage:
            questions_linked = passage.questions_set.all()
            if questions_linked:
                message = "Passage Linked To Questions Can't Be Deleted"
                success = False
            else:
                passage.delete()
                message = "Passage Deleted"
                success = True            
        else:
            message = "Passage Not Found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}


# <------------------ CRUD Passages End --------------------->


#<----------------- Question CRUD Start --------------------------->

def crud_questions(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = Questions.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_question)
    if not check_operation['error']:
        if operation == "read":
            out_read_questions = read_questions(request) 
            message = out_read_questions['message']               
            tranObjs = out_read_questions['output']
            error_message_list.extend(out_read_questions['error_message_list'])               
            error = out_read_questions['error']     
            num_pages = out_read_questions['num_pages']          
            filters = out_read_questions['filter']     
            total_records = out_read_questions['total_records']          
            status = out_read_questions['success']          
        
        if operation in ["create","update"]:  
            out_create_update_question = create_update_question(request=request)
            message = out_create_update_question['message']
            error = out_create_update_question['error']
            tranObjs = out_create_update_question['output']
            error_message_list.extend(out_create_update_question['error_message_list'])
            status = out_create_update_question['success']          

        if operation == "delete":
            out_delete_question = delete_question(request)
            message = out_delete_question['message']
            error = out_delete_question['error']
            tranObjs = out_delete_question['output']
            error_message_list.extend(out_delete_question['error_message_list'])
            status = out_delete_question['success']          
        
        if operation == "move":
            out_move_question = move_question(request)
            message = out_move_question['message']
            error = out_move_question['error']
            tranObjs = out_move_question['output']
            error_message_list.extend(out_move_question['error_message_list'])
            status = out_move_question['success']          

        if operation == "live":
            out_live_question = live_question(request)
            message = out_live_question['message']
            error = out_live_question['error']
            tranObjs = out_live_question['output']
            error_message_list.extend(out_live_question['error_message_list'])
            status = out_live_question['success']          


        if not error:
            for trans in tranObjs:
                if trans.passage:
                    passage_out = json.loads(str(trans.passage))
                else:
                    passage_out = json.loads(str(json.dumps({'id':'','header':'','text':'','data_table' : []})))
                
                if trans.topic:
                    topic_out = json.loads(str(trans.topic))
                else:
                    topic_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))

                if trans.question_folder:
                    folder_out = json.loads(str(trans.question_folder))
                else:
                    folder_out = json.loads(str(json.dumps({'id':'','folder_name':''})))

                if trans.created_by:
                    user_out = json.loads(str(trans.created_by))
                else:
                    user_out = json.loads(str(json.dumps({'id':'','first_name':'' ,'last_name':'','email':''})))
                test_out = []
                tests =  Tests.objects.filter(id__in = trans.tests)
                # try:
                for test in tests:
                    test_out.append({'test_name':test.test_name, 'is_live':test.is_live,'id':test.id})
                # except:
                #     test_out = []
                    # test_out.append(json.loads(str(test)))
                # test_out = json.loads(str(json.dumps(test_out)))
                try:
                    result.append({
                    'id':trans.id,
                    'question_text':trans.question_text,        
                    'question_type':{"value":trans.question_type,"label":question_types[trans.question_type]},           
                    'topic': topic_out,          
                    'total_num_set_answers':trans.total_num_set_answers,    
                    'difficulty_user':trans.difficulty_user,   
                    # 'to_evaluate':trans.to_evaluate,  
                    'solution':trans.solution,  
                    'is_passage':trans.is_passage, 
                    'passage':passage_out,
                    'num_correct_answered':trans.num_correct_answered,
                    'num_total_answered':trans.num_total_answered,
                    'answer_options':trans.answer_options,
                    'correct_answer':trans.correct_answer,
                    # 'is_random_order':trans.is_random_order,
                    'created_at':str(trans.created_at)[:16],
                    'modified_at':str(trans.modified_at)[:16],
                    'created_by':user_out,
                    'question_folder':folder_out,
                    'is_live':trans.is_live,
                    'tests':test_out
                })
                except:
                    None
                
    
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

def create_update_question(request,question_data=None):
    error = False
    error_message_list = []
    output = Questions.objects.none()
    success = False
    message = "Request Recieved"
    operation               = get_param(request, 'operation', None)
    question_text           = get_param(request, 'question_text', None)
    question_type           = get_param(request, 'question_type', None)
    solution                = get_param(request, 'solution', None)
    topic_id                = get_param(request, 'topic_id', None)
    num_set                 = get_param(request, 'num_set', None)
    difficulty_user         = get_param(request, 'difficulty', None)
    # to_evaluate             = get_param(request, 'to_evaluate', None)
    is_passage              = get_param(request, 'is_passage', None)
    passage_id              = get_param(request, 'passage_id', None)
    answer_options          = get_param(request,'option_dict',None)
    correct_answer          = get_param(request,'correct_dict',None)
    # is_random_order         = get_param(request,'is_random',None)
    data_id                 = get_param(request, 'data_id', None)
    folder_id               = get_param(request,'folder_id',None)
    is_live                 = get_param(request,'is_live',None)
  
    if operation == "create":      
        question_check     = Questions.objects.filter(question_text=question_text,question_type=question_type)
    else:
        question_check = Questions.objects.none()

    fields_missing = 0 
    if question_text == None or question_text == "":
        error = True
        error_message_list.append("Missing question_text")

    if solution == None or solution == "":
        pass
        fields_missing = fields_missing + 1
        # error = True
        # error_message_list.append("Missing solution")
    topic = None
    if topic_id:
        try:
            topic = Topics.objects.get(id=topic_id)
        except:
            error = True
            error_message_list.append("Incorrect topic_id")
    else:
        pass
        fields_missing = fields_missing + 1
        # error = True
        # error_message_list.append("Missing topic_id")

        
    check_is_passage = booleanvar_check(variable_name="is_passage",value=is_passage)
    if not check_is_passage['error']:
        is_passage = check_is_passage['output']
        if is_passage:
            if passage_id:
                try:
                    passage = Passages.objects.get(id=passage_id)
                except:
                    error = True
                    error_message_list.append("Invalid passage_id")
            else:
                error = True
                error_message_list.append("Missing passage_id")
        else:
            passage = None
    else:
        error = True 
        error_message_list.append(check_is_passage['errormessage'])

    check_is_live = booleanvar_check(variable_name="is_live",value=is_live)
    if not check_is_live['error']:
        is_live = check_is_live['output']
        if fields_missing > 0 :
            is_live = False
    else:
        error = True 
        error_message_list.append(check_is_live['errormessage'])

    # check_is_random_order = booleanvar_check(variable_name="is_random_order",value=is_random_order)
    # if not check_is_random_order['error']:
    #     is_random_order = check_is_random_order['output']
    # else:
    #     error = True 
    #     error_message_list.append(check_is_random_order['errormessage'])

    if request.user.is_anonymous:
        user = None
    else:
        user = request.user
    
    check_difficulty_user = listvar_check(variable_name="difficulty_user",value=difficulty_user,allowedlist=difficulty_types_list,missing_allowed=True)
    if not check_difficulty_user['error']:
        difficulty_user = str(difficulty_user)
    else:
        if check_difficulty_user['is_missing']:
            fields_missing = fields_missing + 1
        else:
            error = True
            error_message_list.append(check_difficulty_user['errormessage'])

    check_question_type = listvar_check(variable_name="question_type",value=question_type,allowedlist=question_types_list)
    if not check_question_type['error']:
        question_type = str(question_type)
        if question_type in single_num_set_question_types:
            num_set = 1
        check_answer_dict = answer_dict_check(value=answer_options,question_type=question_type)
        if not check_answer_dict['error']:
            answer_options = check_answer_dict['output']
        else:
            error = True
            error_message_list.append(check_answer_dict['errormessage'])
        
        check_correct_answer = correct_dict_check(value=correct_answer,question_type=question_type)
        if not check_correct_answer['error']:
            correct_answer = check_correct_answer['output']
        else:
            error = True
            error_message_list.append(check_correct_answer['errormessage'])
    else:
        error = True
        error_message_list.append(check_question_type['errormessage'])

    if operation == "create":   
        if folder_id:
            try:
                folder = QuestionFolder.objects.get(id=folder_id)
            except:
                error = True
                error_message_list.append("Incorrect folder_id")
        else:
            error = True
            error_message_list.append("Missing folder_id")
    else:
        if question_data == None:
            if data_id:
                try:
                    question = Questions.objects.get(id=data_id)
                    # if question.question_type != question_type:
                        # error = True
                        # error_message_list.append("Question Type Can't be Updated")
                        
                except:
                    error = True
                    error_message_list.append("Question Not Found")
                    message = "Question Not Found"
                    question = None
            else:
                error = True
                error_message_list.append("Missing data_id")
        else:
            try:
                question = question_data
                # if question.question_type != question_type:
                #     error = True
                #     error_message_list.append("Question Type Can't be Updated")
            except:
                error = True
                error_message_list.append("Question Not Found")
                message = "Question Not Found"
                question = None


    ts = time.time()
    created_at = datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')

    if not error:
        if operation == "create":

            if question_check.count() > 0 and fields_missing > 0:
                message = "Question Created with warning : Similar question already exists and missing fields!"
            elif fields_missing > 0:
                message = "Question Created with warning : Missing fields!"
            elif question_check.count() > 0:
                message = "Question Created with warning : Similar question already exists!"
            else:
                message = "Question Created"

            question = Questions.objects.create(
                question_text            = question_text,
                question_type            = question_type,
                topic                    = topic,
                total_num_set_answers    = num_set,
                difficulty_user          = difficulty_user,
                # to_evaluate              = to_evaluate,
                solution                 = solution,
                is_passage               = is_passage,
                passage                  = passage,
                answer_options           = answer_options,
                correct_answer           = correct_answer,
                is_live                  = is_live,
                # is_random_order        = is_random_order,
                # created_at               = created_at,
                # modified_at              = created_at,
                created_by               = user,
                question_folder          = folder,
            )
            output = [question]
            # for q in question_check:
            #     print q.question_text
            # print question_check.count()
            success = True
        else:
            question.question_text            = question_text
            question.question_type            = question_type
            question.topic                    = topic
            question.total_num_set_answers    = num_set
            question.is_live                  = is_live
            question.difficulty_user          = difficulty_user

            questions_list = SectionQuestions.objects.filter(question=question)
            print questions_list.count()
            for ques in questions_list:
                ques.topic = topic
                ques.difficulty_user = difficulty_user
                ques.question_type = question_type
                ques.save()


            # question.to_evaluate              = to_evaluate
            question.is_passage               = is_passage
            question.solution                 = solution
            question.passage                  = passage
            question.answer_options           = answer_options
            question.correct_answer           = correct_answer
            # question.is_random_order          = is_random_order
            # question.modified_at              = created_at
            question.save()
            output = [question]
            message = "Question Updated"
            success = True
    else:
        message = "Error | Refer error list"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}    

def answer_dict_check(value,question_type):
    output = None
    error_message = "No Errors"
    error = False
    try:
        value = json.loads(value)
        if question_type in ['mcq_single','mcq_multiple','chooseorder']:
            if value:
                try:
                    if value['options'][0]['id'] == "1": 
                        if len(value['options']) > 1:
                            output = value
                        else:
                            error = True
                            error_message = "option_dict number of options can't be less than 2"    
                    else:
                        error = True
                        error_message = 'option_dict list ids should start with 1'
                except:
                    error = True
                    error_message = 'Incorrect option_dict | format : ' + str(answer_option_dict)   
            else:                
                error = True
                error_message = 'Missing option_dict'
        
        else:
            if not (type(value) is dict):
                error = True
                error_message = 'option_dict should be {}'
                output = None
    except:
        error = True
        error_message = "option_dict value not a json"
    return {'output':output,'error': error, 'errormessage':error_message}


def correct_dict_check(value,question_type):
    output = None
    error_message = "No Errors"
    error = False
    try:
        value = json.loads(value)
        # print value
        if question_type in evaluable_questions:
            if value:
                if question_type == 'mcq_multiple':
                    try:
                        if (type(value['answer']) is list): 
                            try:
                                check = int(value['answer'][0])
                                output = value
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
                        check = int(value['answer'])
                        output = value
                    except:
                        error = True
                        error_message = 'Incorrect correct_dict | format : ' + str(correct_answer_dict_mcq_single)
                elif question_type == 'word':
                    try:
                        answer = value['answer']
                        if (type(answer) is unicode):
                            if question_type == "number":
                                try:
                                    answer = float(value['answer'])
                                    output = value
                                except:
                                    error = True
                                    error_message = "Cant' have a string in number question"
                            else:
                                output = value
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
                                answer = float(value['answer'])
                                output = value
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
                error = True
                error_message = 'Missing correct_dict'
        else:
            output = None
    except:
        error = True
        error_message = "correct_dict value not a json"
    return {'output':output,'error': error, 'errormessage':error_message}



def delete_question(request):
    error = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output = Questions.objects.none()
    message = "Request Recieved"
    success = False
    if data_id:
        try:
            question = Questions.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if question:
            questions_linked = question.sectionquestions_set.all()
            try:
                if questions_linked:
                    message = "Question Linked To Tests Can't Be Deleted"
                    success = False
                    # To Be Checked After Question Add
                else:
                    question.delete()
                    message = "Question Deleted"
                    success = True
            except:
                    question.delete()
                    message = "Question Deleted"
        else:
            message = "Question not found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}


def live_question(request):
    error = False
    success = False
    error_message_list = []
    output = []
    message = "Request Recieved"
    question_ids   = get_param(request, 'question_ids', None)
    is_live        = get_param(request, 'is_live', None)        
    check_is_live = booleanvar_check(variable_name="is_live",value=is_live)
    if not check_is_live['error']:
        is_live = check_is_live['output']
    else:
        error = True 
        error_message_list.append(check_is_live['errormessage'])
        
    made_live = 0 
    if not error:
        if question_ids:
            question_id_list = question_ids.split(",")

            for quest_id in question_id_list:
                try:
                    question = Questions.objects.get(id=quest_id)
                    # add check to see if question is in test
                    if is_live:
                        if question.topic != None and question.solution != None and question.solution != "" and question.difficulty_user != None and question.difficulty_user != "":
                            question.is_live = is_live
                            made_live = made_live + 1
                    else:
                        question.is_live = is_live
                        made_live = made_live + 1

                    question.save()
                    output.append(question)
                except:
                    error = True
                    error_message_list.append("Incorrect question_id : " + str(quest_id))
        else:
            error = True
            error_message_list.append("Missing question_ids")

        if not error:
            if made_live > 0:
                if is_live:
                    message = str(made_live) + " of " + str(len(question_id_list)) +" Question/s Live "
                else:
                    message = str(made_live) + " of " + str(len(question_id_list)) +" Question/s Offline"
                success = True
            else:
                success = False
                if is_live:
                    message = "Question Details Incomplete"
                else:
                    message = str(made_live) + " of " + str(len(question_id_list)) +" Question/s Offline"
        else:
            message = "Errors | Refer Error List!"
            success = False
    else:
        message = "Errors | Refer Error List!"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}

def live_sectionquestion(request):
    error = False
    success = False
    error_message_list = []
    output = []
    message = "Request Recieved"
    question_ids   = get_param(request, 'question_ids', None)
    is_live        = get_param(request, 'is_live', None)        
    check_is_live = booleanvar_check(variable_name="is_live",value=is_live)
    if not check_is_live['error']:
        is_live = check_is_live['output']
    else:
        error = True 
        error_message_list.append(check_is_live['errormessage'])
        
    made_live = 0 
    if not error:
        if question_ids:
            question_id_list = question_ids.split(",")

            for quest_id in question_id_list:
                try:
                    sectionQuestion = SectionQuestions.objects.get(id=quest_id)
                    question= sectionQuestion.question
                    # add check to see if question is in test
                    if is_live:
                        if question.topic != None and question.solution != None and question.solution != "" and question.difficulty_user != None and question.difficulty_user != "":
                            question.is_live = is_live
                            made_live = made_live + 1
                    else:
                        question.is_live = is_live
                        made_live = made_live + 1

                    question.save()
                    # sectionQuestion = SectionQuestions.objects.get(id=quest_id)
                    output.append(sectionQuestion)
                except:
                    error = True
                    error_message_list.append("Incorrect question_id : " + str(quest_id))
        else:
            error = True
            error_message_list.append("Missing question_ids")

        if not error:
            if made_live > 0:
                if is_live:
                    message = str(made_live) + " of " + str(len(question_id_list)) +" Question/s Live "
                else:
                    message = str(made_live) + " of " + str(len(question_id_list)) +" Question/s Offline"
                success = True
            else:
                success = False
                if is_live:
                    message = "Question Details Incomplete"
                else:
                    message = str(made_live) + " of " + str(len(question_id_list)) +" Question/s Offline"
        else:
            message = "Errors | Refer Error List!"
            success = False
    else:
        message = "Errors | Refer Error List!"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}



def read_questions(request):
    output = Questions.objects.none()
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
    folder_id = get_param(request,'folder_id',None)    
    search = get_param(request,'search',None)    
    sort_by = get_param(request,'sort_by',None)    
    order = get_param(request,'order_by',None) 
    folder_name = get_param(request,'folder_name',None)  
    question_type = get_param(request,'question_type',None)   
    test_id = get_param(request,'test_id',None)   
    test_exclude = get_param(request,'test_exlude_id',None)   
    difficulty = get_param(request,'difficulty',None)   
    is_passage = get_param(request,'is_passage',None)   
    is_live = get_param(request,'is_live',None)   
    # to_evaluate = get_param(request,'to_evaluate',None)   
    # is_random = get_param(request,'is_random',None)   
    topic_id = get_param(request,'topic_id',None)   

    if data_id != None and data_id != "":
        tranObjs = Questions.objects.filter(id=data_id)
    else:
        tranObjs = Questions.objects.all()
        # Filters/Sorting Start
        if folder_id !=None and  folder_id !="":
            folder_id_list = folder_id.split(",")
            folder_id_list_new = [None if x == 'none' else x for x in folder_id_list]
            # for foldid in folder_id_list:
            #     if foldid == "none":
            #         folder_id_list_new.append(None)
            #     else:
            #         folder_id_list_new.append()

            tranObjs = tranObjs.filter(question_folder__id__in = folder_id_list_new)
        
        if folder_name != None and folder_name != "" and folder_name !="allbanks":
            try:
                # folder_name = cleanstring(urllib.unquote(folder_name).decode('utf8')).lower()
                folder_name = cleanstring(folder_name)
                folder = QuestionFolder.objects.get(folder_name=folder_name)
                tranObjs = tranObjs.filter(question_folder__id = folder.id)
            except:
                error = True
                error_message_list.append('Incorrect Folder name')

        if test_id != None and  test_id !="":
            test_id_list = test_id.split(",")
            if "none" in test_id_list:
                tranObjs = tranObjs.filter(Q(tests__in=test_id_list) | Q (in_test=False))
            else:
                tranObjs = tranObjs.filter(tests__in=test_id_list)    

        if test_exclude != None and  test_exclude !="":
            test_exlude_list = test_exclude.split(",")
            tranObjs = tranObjs.exclude(tests__in=test_exlude_list)


        if search !=None and search !=""  and search != "none":
            tranObjs = tranObjs.filter(question_text__icontains=search)
        
        if sort_by !=None and sort_by !="" and sort_by != "none":
            if order == "asc":
                tranObjs = tranObjs.order_by(sort_by)
            else:
                tranObjs = tranObjs.order_by("-" + sort_by)

        if question_type !=None and question_type !=""  and question_type != "none":
            question_type_list = question_type.split(",")
            tranObjs = tranObjs.filter(question_type__in=question_type_list)

        # if question_type !=None and question_type !=""  and question_type != "none":            
        #     question_type_list = question_type.split(",")
        #     tranObjs = tranObjs.filter(question_type__in=question_type_list)


        if difficulty !=None and difficulty !=""  and difficulty != "none":
            difficulty_list = difficulty.split(",")
            # difficulty_list = map(lambda x : int(x),difficulty_list)
            tranObjs = tranObjs.filter(difficulty_user__in=difficulty_list)

        if is_passage !=None and is_passage !=""  and is_passage != "none":
            if is_passage == "1":
                tranObjs = tranObjs.filter(is_passage=True)
            else:
                tranObjs = tranObjs.filter(is_passage=False)

        if is_live != None and is_live !=""  and is_live != "none":
            if is_live == "1":
                tranObjs = tranObjs.filter(is_live=True)
            else:
                tranObjs = tranObjs.filter(is_live=False)

        # if to_evaluate !=None and to_evaluate !=""  and to_evaluate != "none":
        #     if to_evaluate == "1":
        #         tranObjs = tranObjs.filter(to_evaluate=True)
        #     else:
        #         tranObjs = tranObjs.filter(to_evaluate=False)

        # if is_random !=None and is_random !=""  and is_random != "none":
        #     if is_random == "1":
        #         tranObjs = tranObjs.filter(is_random_order=True)
        #     else:
        #         tranObjs = tranObjs.filter(is_random_order=False)

        if topic_id !=None and topic_id !=""  and topic_id != "none":
            topic_id_list = topic_id.split(",")
            
            tranObjs = tranObjs.filter(topic__id__in = topic_id_list)
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
                                {'value':'question_type','label':'Question Type'},
                                {'value':'topic','label':'Topic'},
                                {'value':'difficulty_user','label':'Difficulty'},
                                {'value':'created_at','label':'Created At'},
                                {'value':'modified_at','label':'Modified At'},
                                ]

    filters['order_by'] = [{'value':'asc','label':'Ascending'},
                                {'value':'desc','label':'Descending'}]
    filters['question_type'] = []

    for ques_type in question_types_list:
        filters['question_type'].append({'value':ques_type,'label':question_types[ques_type]})

    filters['difficulty'] = [
                                {'value':'1','label':'1'},
                                {'value':'2','label':'2'},
                                {'value':'3','label':'3'},
                                {'value':'4','label':'4'},
                                {'value':'5','label':'5'},
                                {'value':'6','label':'6'},
                                ]

    filters['is_passage'] = [{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    filters['is_live'] = [{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    filters['tests'] = [{'value':'none','label':'None'}]
    filters['tests_exclude'] = []
    Testlist = Tests.objects.all()
    for t in Testlist:
        filters['tests'].append({
            'value':t.id,
            'label':t.test_name
        })

    for t2 in Testlist:
        filters['tests_exclude'].append({
            'value':t2.id,
            'label':t2.test_name
        })
    # filters['tests'] = map(lambda x :{'value':x.id,'label':x.test_name},Tests.objects.all())
    
    
    filters['topics'] = []
    topics = Topics.objects.all()
    # for topic in topics:
    #     filters['topics'].append({
    #         'value':topic.id,
    #         'label':(topic.category).title() + " | " + (topic.sub_category).title()
    #     })
    for topic in topics:
        filters['topics'].append({
            'value':topic.id,
            'label':(topic.sub_category).title()
        })

    filters['category'] = []
    for item in topics:
        filters['category'].append({
            'value':item.category,
            'label':(item.category).title()
            })
    filters['category'] = {v['value']:v for v in filters['category']}.values()
    filters['category'] = sorted(filters['category'], key=operator.itemgetter('value'))
    filters['sub_category'] = map(lambda x :{'id':x.id,'category':x.category.title(),'sub_category':x.sub_category.title() },Topics.objects.all())
    

    filters['folders'] = [{'value':'none','label':'None'}]
    folders = QuestionFolder.objects.all()
    for folder in folders:
        filters['folders'].append({
            'value':folder.id,
            'label':folder.folder_name
        })



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
            'output':Questions.objects.none(),
            'num_pages':1,
            'total_records':0,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'success':success,
            'message':message
        })

def move_question(request):
    output = []
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    folder_id = get_param(request,'folder_id',None)    
    question_ids = get_param(request,'question_ids',None)

    if folder_id:
        try:
            folder = QuestionFolder.objects.get(id=folder_id)
        except:
            error = True
            error_message_list.append("Incorrect folder_id")
    else:
        error = True
        error_message_list.append("Missing folder_id")

    if not error:
        if question_ids:
            question_id_list = question_ids.split(",")
            for quest_id in question_id_list:
                try:
                    question = Questions.objects.get(id=quest_id)
                    question.question_folder = folder
                    question.save()
                    output.append(question)
                except:
                    error = True
                    error_message_list.append("Incorrect question_id : " + str(quest_id))
        else:
            error = True
            error_message_list.append("Missing question_ids")

        if not error:
            message = "All Questions Moved"
            success = True
        else:
            message = "Errors | Refer Error List!"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success': success}


#<----------------- Question CRUD End --------------------------->



def check_api(request):
    check = get_param(request, 'check', None)
    if check:
        check = 1
    return HttpResponse(json.dumps(check), content_type='application/json')


#<----------------- Section Question CRUD Start --------------------------->




def crud_sectionquestions(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = SectionQuestions.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    operation = get_param(request, 'operation', None)
    section_id = get_param(request, 'section_id', None)
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_sec_question)
    error = check_operation['error']
    if section_id:
        try:
            section = Sections.objects.get(id=section_id)
        except:
            error = True
            error_message_list.append('Incorrect section_id')
    else:
        error = True
        error_message_list.append('Missing section_id')

    if not error:
        if operation == "read":
            # To Do
            out_read_section_questions = read_section_questions(request=request,section=section) 
            message = out_read_section_questions['message']               
            tranObjs = out_read_section_questions['output']
            error_message_list = out_read_section_questions['error_message_list']               
            error = out_read_section_questions['error']     
            num_pages = out_read_section_questions['num_pages']          
            filters = out_read_section_questions['filter']     
            total_records = out_read_section_questions['total_records']          
            status = out_read_section_questions['success']          

        if operation == "create":
            # section questions length check
            # len_questions = section.sectionquestions_set.all().value('id').count()
            # num_questions_allowed = section.number_questions
            # if len_questions <= num_questions_allowed:
            out_create_update_question = create_update_question(request=request)
            status = out_create_update_question['success']          
            message = out_create_update_question['message']
            error = out_create_update_question['error']
            question_out = out_create_update_question['output']
            error_message_list.extend(out_create_update_question['error_message_list'])
            if not error:
                out_create_update_sectionquestion = create_update_sectionquestion(request=request,question=question_out,section=section)
                message = out_create_update_sectionquestion['message']
                error = out_create_update_sectionquestion['error']
                tranObjs = out_create_update_sectionquestion['output']
                error_message_list.extend(out_create_update_sectionquestion['error_message_list'])
                status = out_create_update_sectionquestion['success']
            # else:
            #     message = "Section Question Limit Reached | Remove existing to add new"
            #     error = False
            #     status = False
            #     tranObjs = SectionQuestions.objects.none()
            #     error_message_list = []

        if operation == "update":
            data_id = get_param(request,'data_id',None)
            if data_id:
                try:
                    question = SectionQuestions.objects.get(id=data_id)
                    question_data = question.question
                except:
                    error = True
                    error_message_list.append("Incorrect data_id")
            else:
                error = True
                error_message_list.append("Missing data_id")

            if not error:
                out_create_update_question = create_update_question(request=request,question_data=question_data)
                message = out_create_update_question['message']
                error = out_create_update_question['error']
                status = out_create_update_question['success']          
                question_out = out_create_update_question['output']
                error_message_list.extend(out_create_update_question['error_message_list'])
                if not error:
                    out_create_update_sectionquestion = create_update_sectionquestion(request=request,question=question_out,section=section,section_question=question)
                    message = out_create_update_sectionquestion['message']
                    error = out_create_update_sectionquestion['error']
                    tranObjs = out_create_update_sectionquestion['output']
                    error_message_list.extend(out_create_update_sectionquestion['error_message_list'])
                    status = out_create_update_sectionquestion['success']

        if operation == "marks_update":
            out_marks_update_sectionquestion = marks_update_sectionquestion(request)
            message = out_marks_update_sectionquestion['message']
            error = out_marks_update_sectionquestion['error']
            tranObjs = out_marks_update_sectionquestion['output']
            error_message_list.extend(out_marks_update_sectionquestion['error_message_list'])
            status = out_marks_update_sectionquestion['success']

        if operation == "live":
            out_live_question = live_sectionquestion(request)
            message = out_live_question['message']
            error = out_live_question['error']
            tranObjs = out_live_question['output']
            error_message_list.extend(out_live_question['error_message_list'])
            status = out_live_question['success']          

        if operation == "copy":
            # len_questions = section.sectionquestions_set.all().value('id').count()
            # num_questions_allowed = section.number_questions
            # Question Additon Limit Based on Parameters
            # if len_questions < num_questions_allowed:
            question_ids = get_param(request,'question_ids',None)

            if question_ids:
                question_id_list = question_ids.split(",")
                try:
                    # print question_id_list
                    question_out = Questions.objects.filter(id__in=question_id_list)
                    # print question_out
                    print "reached here 1"
                    out_create_update_sectionquestion = create_update_sectionquestion(request=request,question=question_out,section=section)
                    message = out_create_update_sectionquestion['message']
                    error = out_create_update_sectionquestion['error']
                    tranObjs = out_create_update_sectionquestion['output']
                    error_message_list.extend(out_create_update_sectionquestion['error_message_list'])
                    status = out_create_update_sectionquestion['success']
                except:
                    error = True
                    error_message_list.append("Invalid question_ids")
            else:
                error = True
                error_message_list.append('Missing question_ids')
            # else:
            #     message = "Section Question Limit Reached | Remove existing to add new"
            #     error = False
            #     tranObjs = Sections.objects.none()
            #     error_message_list = []

        if operation == "delete":
            out_delete_section_question = delete_section_question(request) 
            message = out_delete_section_question['message']               
            tranObjs = out_delete_section_question['output']               
            error_message_list.extend(out_delete_section_question['error_message_list'])               
            error = out_delete_section_question['error']   
            status = out_delete_section_question['success']               
        
        if operation == "order_change":
            out_order_question_change = order_question_change(request)
            message = out_order_question_change['message']
            error = out_order_question_change['error']
            tranObjs = out_order_question_change['output']
            error_message_list.extend(out_order_question_change['error_message_list'])
            status = out_order_question_change['success']   

    

        if not error:
            for trans in tranObjs:
                print trans
                question = trans.question
                if question.passage:
                    passage_out = json.loads(str(question.passage))
                else:
                    passage_out = json.loads(str(json.dumps({'id':'','header':'','text':'','data_table' : []})))
                
                if trans.topic:
                    topic_out = json.loads(str(trans.topic))
                else:
                    topic_out = json.loads(str(json.dumps({'id':'','category':'','sub_category':''})))

                if question.question_folder:
                    folder_out = json.loads(str(question.question_folder))
                else:
                    folder_out = json.loads(str(json.dumps({'id':'','folder_name':''})))

                if question.created_by:
                    user_out = json.loads(str(question.created_by))
                else:
                    user_out = json.loads(str(json.dumps({'id':'','first_name':'' ,'last_name':'','email':''})))
                
                test_out = []
                tests =  Tests.objects.filter(id__in = question.tests)
                for test in tests:
                    test_out.append({'test_name':test.test_name, 'is_live':test.is_live,'id':test.id})

                # section_question = trans.sectionquestions_set.filter(question__id__in =  trans.id)
                # print "check"
                # print section_question
                
                try:
                    result.append({
                    'id':trans.id,
                    'section':json.loads(str(section)),
                    'question_id':question.id,
                    'is_live':question.is_live,
                    'question_text':question.question_text,        
                    'question_type':{"value":trans.question_type,"label":question_types[trans.question_type]},           
                    'topic': topic_out,          
                    'total_num_set_answers':question.total_num_set_answers,    
                    'difficulty_user':trans.difficulty_user,   
                    'solution':question.solution,  
                    'is_passage':trans.is_passage, 
                    'passage':passage_out,
                    'num_correct_answered':question.num_correct_answered,
                    'num_total_answered':question.num_total_answered,
                    'answer_options':question.answer_options,
                    'correct_answer':question.correct_answer,
                    'created_at':str(question.created_at)[:16],
                    'modified_at':str(question.modified_at)[:16],
                    'created_by':user_out,
                    'question_folder':folder_out,                    
                    'positive_marks':trans.positive_marks,
                    'negative_marks':trans.negative_marks,
                    'order':trans.order,
                    'tests':test_out
                    # 'order':'1'
                })
                except:
                    None
                
    else:
        message = "Error | Refer Error List"
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

def create_update_sectionquestion(request,question,section,section_question=None):
    output = SectionQuestions.objects.none()
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    positive_marks = get_param(request, 'positive_marks', section.default_positive_marks)
    negative_marks = get_param(request,'negative_marks' , section.default_negative_marks)
    operation      = get_param(request,'operation', None)
    # print section.default_negative_marks
    # print negative_marks
    print "reached here 2"
    if operation in ["create","copy","update"]:
        # num_questions_allowed = section.number_questions
        num_added = 0
        check_positive_marks = floatvar_check(variable_name="positive_marks",value=positive_marks)     
        if not check_positive_marks['error']:
            positive_marks = check_positive_marks['output']
        else:
            error = check_positive_marks['error']
            error_message_list.append(check_positive_marks['errormessage'])

        check_negative_marks = floatvar_check(variable_name="negative_marks",value=negative_marks)     
        if not check_negative_marks['error']:
            negative_marks = check_negative_marks['output']
        else:
            error = check_negative_marks['error']
            error_message_list.append(check_negative_marks['errormessage'])
        
        if not error:
            
            number_questions = SectionQuestions.objects.filter(section = section).count()
            if number_questions > 0 :
                order = number_questions + 1
            else:
                order =  1

            if operation in ["create","copy"]:
                question_id_list = []
                print len(question)
                for ques in question:
                    section_question = None
                    check_existing = SectionQuestions.objects.filter(section=section, question=ques)
                    # print 'here'
                    print "reached here 3"
                    if check_existing.count() > 0:
                        pass
                    else:
                        print "reached here 4"
                        
                        section_question = SectionQuestions.objects.create(
                                        topic                    = ques.topic
                                        ,is_passage              = ques.is_passage
                                        ,difficulty_user         = ques.difficulty_user
                                        ,question_type           = ques.question_type
                                        ,positive_marks          = positive_marks
                                        ,negative_marks          = negative_marks
                                        ,section                 = section
                                        ,question                = ques
                                        # ,section_answer_options  = section_answer_options
                                        # ,section_correct_answer  = section_correct_answer
                                        ,order                   = order
                                        )   
                        print "reached here 5"
                        testlist = ques.tests
                        # if section.test.id not in testlist:
                        testlist.append(section.test.id)
                        ques.tests = testlist
                        ques.in_test = True

                        ques.save()
                        num_added = num_added + 1
                        order = order + 1
                        question_id_list.append(section_question.id)
        
                output = SectionQuestions.objects.filter(id__in = question_id_list)
                if operation == "create":
                    message = "Succefully added question"
                else:
                    message = "Succefully added "+ str(num_added) + " of "+ str(len(question)) + " question/s"
                success = True
            else:
                try:
                    section_question = section_question
                    question = question[0]
                    section_question.positive_marks     = positive_marks
                    section_question.negative_marks     = negative_marks
                    section_question.topic              = question.topic
                    section_question.is_passage         = question.is_passage
                    section_question.difficulty_user    = question.difficulty_user
                    section_question.question_type      = question.question_type
                    section_question.topic              = question.topic
                    section_question.save()
                    success = True
                    message = "Question Updated"
                except:
                    error = True
                    error_message_list.append("question not found for the given test")
                    success = False
                    message = "Errors | Refer Error List"
                output = [section_question]
        else:
            if operation == "create":
                for ques in question:
                    ques.delete()
            error = True
            message = "Errors | Refer Error List"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

            
def delete_section_question(request):
    error = False
    success = False
    error_message_list = []    
    data_id      = get_param(request, 'data_id', None)
    output = SectionQuestions.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            question = SectionQuestions.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if question:
            section = question.section
            order_question = question.order
            questions_list = SectionQuestions.objects.filter(section=section,order__gt=order_question)
            for ques in questions_list:
                old_order =  ques.order 
                ques.order = old_order - 1 
                ques.save()
            question_bank = question.question
            testlist = question_bank.tests
            if section.test.id in testlist:
                # testlist.append(section.test.id)
                testlist.remove(section.test.id)
                question_bank.tests = testlist
                if len(testlist):
                    question_bank.in_test = True
                else:
                    question_bank.in_test = False
            
            question_bank.save()
            # add_del_section_test(section=section,test=test,operation="delete")
            question.delete()
            message = "Question Deleted"
            success = True
        else:
            message = "Question not found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def order_question_change(request):
    output = SectionQuestions.objects.none()
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    # test_id             = get_param(request,'test_id',None)    
    data_id             = get_param(request,'data_id',None)
    up_down             = get_param(request,'up_down',None)
    position            = get_param(request,'position',None)
    page_num = get_param(request, 'page_num', "1")
    page_size = get_param(request, 'page_size', "10")


    if data_id:
        try:
            question = SectionQuestions.objects.get(id=data_id)
            section = question.section
            if section == None:
                error = True
                error_message_list.append("Question data_id not in any section")    
        except:
            error = True
            error_message_list.append("Incorrect data_id")
    else:
        error = True
        error_message_list.append("Missing data_id")

    error1=False
    error2 = False
    
    error_message1 = ""
    error_message2 = ""

    check_position = intvar_check(variable_name="position",value=position)
    if not check_position['error']:
        position = check_position['output']
    else:
        error1 = check_position['error']
        error_message1 = check_position['errormessage']


    check_movement_type = listvar_check(variable_name="up_down",value=up_down, allowedlist=question_movement_allowed)     
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
        if section.sectionquestions_set.filter(id=data_id).count() > 0:
            if not error1:
                if (section.sectionquestions_set.all().count() >= (position + 1)) and position >= 0:
                    order = position + 1
                    if order >= question.order:
                        questions_list = SectionQuestions.objects.filter(section=section,order__range=(question.order,order))
                        change = -1
                    else:
                        questions_list = SectionQuestions.objects.filter(section=section,order__range=(order,question.order))
                        change = 1
                    # print change
                    for ques in questions_list:
                        if ques == question:
                            # print sec.name +" " + str(order)
                            ques.order = order
                        else:
                            # print sec.name +" " + str(sec.order + change)
                            new_order = (ques.order + change)
                            ques.order = new_order
                        ques.save()
                    message = ("Question moved to " + str(position))
                else:
                    error = True
                    error_message_list.append('postion out of index')
            else:
                all_questions        = SectionQuestions.objects.filter(section=section)
                len_questions        = all_questions.count()
                order_current        = question.order
                if up_down == "up" and order_current != 1:
                    order = order_current - 1
                elif up_down == "down" and order_current != len_questions:
                    order = order_current + 1
                else:
                    order = order_current                        
                question_to_change = SectionQuestions.objects.get(section=section,order=order)
                question_to_change.order = order_current
                question_to_change.save()
                question.order = order
                question.save()

                message = ("Question moved " + str(up_down))
        else:
            error = True
            error_message_list.append("Missing data_id in given section") 
        if not error:
            success = True
            output = SectionQuestions.objects.filter(section=section).order_by('order')   
            total_records = output.count()    
            if page_num != None and page_num != "":
                page_num = int(page_num)
                output = Paginator(output, int(page_size))
                try:
                    output = output.page(page_num)
                except:
                    output = output

        else:
            message = "Errors | Refer Error List!"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def read_section_questions(request,section):
    output = SectionQuestions.objects.none()
    error = False
    error_message_list = []
    success = False
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    total_records = 0 
    tranObjs = SectionQuestions.objects.none()
    # section_id = get_param(request,'section_id',None)   
    page_num = get_param(request, 'page_num', "1")
    page_size = get_param(request, 'page_size', "10")
    data_id = get_param(request,'data_id',None)   
    # folder_id = get_param(request,'folder_id',None)    
    search = get_param(request,'search',None)    
    sort_by = get_param(request,'sort_by',None)    
    order = get_param(request,'order_by',None) 
    folder_name = get_param(request,'folder_name',None)  
    question_type = get_param(request,'question_type',None)   
    difficulty = get_param(request,'difficulty',None)   
    is_passage = get_param(request,'is_passage',None)   
    topic_id = get_param(request,'topic_id',None)   
    

    if data_id != None and data_id != "":
        tranObjs = SectionQuestions.objects.filter(id=data_id)
    else:
        # print section.id
        tranObjs = SectionQuestions.objects.filter(section = section).order_by('order')

        # if search !=None and search !=""  and search != "none":
        #     tranObjs = tranObjs.filter(question_text__icontains=search)
        
        if sort_by !=None and sort_by !="" and sort_by != "none":
            if sort_by == "order":
                if order == "asc":
                    tranObjs = tranObjs.order_by(sort_by)
                else:
                    tranObjs = tranObjs.order_by("-" + sort_by)
            else:
                if order == "asc":
                    tranObjs = tranObjs.order_by(sort_by)
                else:
                    tranObjs = tranObjs.order_by("-" + sort_by)

        if question_type !=None and question_type !=""  and question_type != "none":
            question_type_list = question_type.split(",")
            tranObjs = tranObjs.filter(question_type__in=question_type_list)

        if difficulty !=None and difficulty !=""  and difficulty != "none":
            difficulty_list = difficulty.split(",")
            # difficulty_list = map(lambda x : int(x),difficulty_list)
            tranObjs = tranObjs.filter(difficulty_user__in=difficulty_list)

        if is_passage !=None and is_passage !=""  and is_passage != "none":
            if is_passage == "1":
                tranObjs = tranObjs.filter(is_passage=True)
            else:
                tranObjs = tranObjs.filter(is_passage=False)

        if topic_id !=None and topic_id !=""  and topic_id != "none":
            topic_id_list = topic_id.split(",")
            tranObjs = tranObjs.filter(topic__id__in = topic_id_list)
        # Filters/Sorting End
    # pagination variable
    print "3"
    # print tranObjs
    # for item in tranObjs:
    #     print item

    # total_records = 1
    # num_pages = 10
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
                                {'value':'question_type','label':'Question Type'},
                                {'value':'topic','label':'Topic'},
                                {'value':'difficulty_user','label':'Difficulty'},
                                {'value':'order','label':'#Number'},
                                # {'value':'created_at','label':'Created At'},
                                # {'value':'modified_at','label':'Modified At'},
                                ]

    filters['order_by'] = [{'value':'asc','label':'Ascending'},
                                {'value':'desc','label':'Descending'}]
    filters['question_type'] = []

    for ques_type in question_types_list:
        filters['question_type'].append({'value':ques_type,'label':question_types[ques_type]})

    filters['difficulty'] = [
                                {'value':'1','label':'1'},
                                {'value':'2','label':'2'},
                                {'value':'3','label':'3'},
                                {'value':'4','label':'4'},
                                {'value':'5','label':'5'},
                                {'value':'6','label':'6'},
                                ]

    filters['is_passage'] = [{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    # filters['is_live'] = [{'value':'0','label':'No'},{'value':'1','label':'Yes'}]
    # filters['tests'] = [{'value':'sampleid','label':'Test Sample'},{'value':'sampleid2','label':'Test Sample 2'}]

    
    filters['topics'] = []
    topics = Topics.objects.all()
    for topic in topics:
        filters['topics'].append({
            'value':topic.id,
            'label':(topic.sub_category).title()
        })

    filters['category'] = []
    for item in topics:
        filters['category'].append({
            'value':item.category,
            'label':(item.category).title()
            })
    filters['category'] = {v['value']:v for v in filters['category']}.values()
    filters['category'] = sorted(filters['category'], key=operator.itemgetter('value'))
    filters['sub_category'] = map(lambda x :{'id':x.id,'category':x.category.title(),'sub_category':x.sub_category.title() },Topics.objects.all())
    

    filters['folders'] = [{'value':'none','label':'None'}]
    folders = QuestionFolder.objects.all()
    for folder in folders:
        filters['folders'].append({
            'value':folder.id,
            'label':folder.folder_name
        })


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
            'output':Questions.objects.none(),
            'num_pages':1,
            'total_records':0,
            'error':error,
            'error_message_list':error_message_list,
            'filter':filters,
            'success':success,
            'message':message
        })
    
def marks_update_sectionquestion(request):
    output = SectionQuestions.objects.none()
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    question_ids   = get_param(request, 'question_ids', None)
    positive_marks = get_param(request, 'positive_marks', None)
    negative_marks = get_param(request,'negative_marks' , None)
    check_positive_marks = floatvar_check(variable_name="positive_marks",value=positive_marks)     
    if not check_positive_marks['error']:
        positive_marks = check_positive_marks['output']
    else:
        error = check_positive_marks['error']
        error_message_list.append(check_positive_marks['errormessage'])

    check_negative_marks = floatvar_check(variable_name="negative_marks",value=negative_marks)     
    if not check_negative_marks['error']:
        negative_marks = check_negative_marks['output']
    else:
        error = check_negative_marks['error']
        error_message_list.append(check_negative_marks['errormessage'])

    if question_ids:
        question_id_list = question_ids.split(",")
        try:
            questions = SectionQuestions.objects.filter(id__in = question_id_list)
        except:
            error=True
            error_message_list.append("Incorrect question_ids")            
    else:
        error = True
        error_message_list.append("Missing question_ids")

    if not error:
        question_id_list = []
        for ques in questions:
            ques.positive_marks = positive_marks
            ques.negative_marks = negative_marks
            ques.save()
            question_id_list.append(ques.id)
        message = "Marks updated"
        success = True
        output = SectionQuestions.objects.filter(id__in = question_id_list)
    else:
        success = False
        message = "Errors | Refer Error List!"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

#<----------------- Section Question CRUD End --------------------------->