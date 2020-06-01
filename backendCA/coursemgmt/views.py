from django.shortcuts import render
from django.http import HttpResponseRedirect,HttpResponseForbidden,HttpResponse
from django.core.paginator import Paginator
from django.core import serializers
from models import *
from django.db.models import Q
from overall.views import get_param,cleanstring
from testmgmt.models import Tests
import math
import json
import time
from datetime import datetime
import operator
from fuzzywuzzy import fuzz
from overall.views import booleanvar_check, listvar_check, intvar_check, floatvar_check


# Create your views here.

operations_allowed_course = ['create','read','update','delete','add','live','copy']
languages = ['english','hindi','tamil','telugu']

def create_update_course(request):
    error = False
    success = False
    error_message_list = []
    output = Courses.objects.none()
    message = "Request Recieved"
    operation          = get_param(request, 'operation', None)
    course_name        = get_param(request, 'course_name', None)    
    display_name       =   get_param(request, 'display_name', None)    
    data_id            = get_param(request, 'data_id', None)      
    # user fields check and correction

    if course_name:
        course_name = cleanstring(course_name)
    else:
        error = True
        error_message_list.append("Missing course_name")                               

    if display_name:
        try:
            display_name = json.loads(display_name)
            new_display_name = {}
            print display_name
            for lang in languages:
                try:
                    print display_name[lang]
                    name_clean = display_name[lang]
                except:
                    name_clean = ''
                new_display_name[lang] = name_clean
            display_name = new_display_name
        except:
            error = True
            error_message_list.append("Invalid display_name dict")                               


    if operation == "update":
        if data_id:
            try:
                course = Courses.objects.get(id=data_id)
            except:
                error = True
                error_message_list = ['invalid data_id']
        else:
            error = True
            error_message_list = ['missing data_id']
        

    if not error: 
        if operation == "create":
            course = Courses.objects.filter(course_name_english=course_name)
            if course.count() > 0 :
                message = "Course Already Exists!"        
                output = course
                success = False
            else:
                course_new = Courses.objects.create(
                    course_name_english                   = course_name                 
                    ,display_name_dictionary              = display_name                          
                )
                output = [course_new]
                success = True
                message = "Course Created!"
        else:
            if Courses.objects.filter(course_name_english = course_name).count() > 1:
                success = False
                message = "Course name already exist"
                output = []
            elif Courses.objects.filter(course_name_english = course_name).count() == 1 :
                if course.id == Courses.objects.filter(course_name_english = course_name)[0].id:
                    course.course_name_english           = course_name                 
                    course.display_name_dictionary       = display_name   
                    course.save()
                    output = [course]
                    success = True
                    message = "Course Updated!"                   
                else:  
                    success = False
                    message = "Course name already exist"
                    output = []
            else:
                course.course_name_english           = course_name                 
                course.display_name_dictionary       = display_name   
                course.save()
                output = [course]
                success = True
                message = "Course Updated!"

    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def delete_course(request):
    error = False
    success = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output = Courses.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            course = Courses.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if course:
            tests = Tests.objects.filter(courses__in = course.id)
            for test in tests:
                course_list = test.courses
                final_course_list = filter(lambda a: a != course.id, course_list)
                test.courses = final_course_list
                test.save()

            course.delete()
            message = "Course Deleted"
            success = True
        else:
            message = "Course not found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}

def copy_course(request):
    error = False
    success = False
    error_message_list = []
    data_id      = get_param(request, 'data_id', None)
    output       = Courses.objects.none()
    message = "Request Recieved"
    if data_id:
        try:
            course = Courses.objects.get(id=data_id)
        except:
            error=True
            error_message_list.append('Incorrect data_id')
    else:
        error = True
        error_message_list.append('Missing data_id')
    if not error: 
        if course:
            old_id = course.id
            tests = Tests.objects.filter(courses__in = [data_id])
            print tests
            course.id = None
            course.save()            
            course_name = course.course_name_english
            while Courses.objects.filter(course_name_english = course_name).count() > 0 :
                course_name = course_name + ' copy'
                print Courses.objects.filter(course_name_english = course_name).count()
                print course_name
            course.course_name_english = course_name

            display_name = course.display_name_dictionary
            display_name['english'] = course_name
            course.display_name_dictionary = display_name
            
            course.save()
            new_id = course.id            
            for test in tests:
                course_list = test.courses
                course_list.append(new_id)
                # final_course_list = filter(lambda a: a != course.id, course_list)
                test.courses = course_list
                test.save()
            message = "Course Copied"
            success = True
            output = [course]
        else:
            message = "Course not found"
            success = False
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}



def read_courses(request):
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    total_records = 0 
    tranObjs = Courses.objects.none()
    page_num = get_param(request, 'page_num', "1")
    page_size = get_param(request, 'page_size', "10")
    search = get_param(request,'search',None) 
    sort_by = get_param(request,'sort_by',None) 
    order = get_param(request,'order_by',None)    
    data_id = get_param(request,'data_id',None)    
    course_name = get_param(request,'course_name',None)           

    if data_id != None and data_id != "":
        tranObjs = Courses.objects.filter(id=data_id)
    elif course_name != None and  course_name !="":
        try:
            tranObjs = Courses.objects.filter(course_name_english=course_name)
        except:
            error = True
            error_message_list.append('Incorrect Course name')

    else:
        tranObjs = Courses.objects.all()


        # Filters/Sorting Start
        if search !=None and search !="":
            tranObjs = tranObjs.filter(Q(course_name_english__icontains=search))

        if sort_by !=None and sort_by !="" and sort_by != "none":
            if order == "asc":
                tranObjs = tranObjs.order_by(sort_by)
            else:
                tranObjs = tranObjs.order_by("-" + sort_by)
        else:
            tranObjs = tranObjs.order_by("course_name_english")

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
    

    filters['languages'] = map(lambda x : {'value':x,'label':x.title()},languages)
    filters['sort_by'] = [
                        {'value':'course_name_english','label':'Course Name'}
                       ]
    filters['order_by'] = [{'value':'asc','label':'Ascending'},
                           {'value':'desc','label':'Descending'}]

    filters['tests'] = map(lambda x : {'value':x.id,'label':x.test_name},Tests.objects.all())
                           



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

def crud_courses(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = Courses.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_course)
    if not check_operation['error']:
        if operation == "read":
            out_read_courses = read_courses(request) 
            message = out_read_courses['message']               
            tranObjs = out_read_courses['output']
            error_message_list.extend(out_read_courses['error_message_list'])               
            error = out_read_courses['error']     
            status = out_read_courses['success']     
            num_pages     = out_read_courses['num_pages']          
            filters       = out_read_courses['filter']     
            total_records = out_read_courses['total_records']          

        if operation in ["create","update"]:
            out_create_update_course = create_update_course(request) 
            message = out_create_update_course['message']               
            tranObjs = out_create_update_course['output']
            error_message_list.extend(out_create_update_course['error_message_list'])               
            error = out_create_update_course['error']   
            status = out_create_update_course['success']          

        if operation == "delete":
            out_delete_course = delete_course(request) 
            message = out_delete_course['message']               
            tranObjs = out_delete_course['output']               
            error_message_list.extend(out_delete_course['error_message_list'])               
            error = out_delete_course['error']     
            status = out_delete_course['success']           

        if operation == "copy":
            out_copy_course = copy_course(request) 
            message = out_copy_course['message']               
            tranObjs = out_copy_course['output']               
            error_message_list.extend(out_copy_course['error_message_list'])               
            error = out_copy_course['error']     
            status = out_copy_course['success']           


        if not error:
            

            for trans in tranObjs:
                TestsOut = Tests.objects.none()
                total_tests = 0
                TestsOut = Tests.objects.filter(courses__in = [trans.id])
                total_tests = TestsOut.count()
                result.append({
                        'id':trans.id,
                        'course_name':trans.course_name_english,
                        'display_name':trans.display_name_dictionary,
                        'created_at':str(trans.created_at)[:16],
                        'modified_at':str(trans.modified_at)[:16],
                        'total_tests':total_tests
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
