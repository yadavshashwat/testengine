from django.shortcuts import render
from overall.views import cleanstring,get_param,random_str_generator
from django.http import HttpResponseRedirect,HttpResponseForbidden,HttpResponse
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q

from django.core.paginator import Paginator
from models import CAUsers
from mailing import views as mailing
import math
import json
from titlecase import titlecase
from overall.views import booleanvar_check, listvar_check, intvar_check, floatvar_check, boolean_fields
from validate_email import validate_email



staff_roles = ['admin','manager','staff']
allowed_roles = ['admin','manager','staff','user']
operations_allowed_user = ['create','update','read','activate']
defaultpassword = 'capassword'
# Create your views here.
# Creating or checking a users existence in the database
# def crud_user(request):
#     obj = {}
#     obj['status'] = False
#     obj['result'] = []
#     obj['message'] = "Request Recieved"
#     obj['filter'] = {}
#     tranObjs = []
#     operation = get_param(request, 'operation', "read")
#     allowed_admin_roles = ['admin','manager','staff']
#     if operation == "read":
#         tranObjs = None
#         page_num = get_param(request, 'page_num', None)
#         page_size = get_param(request, 'page_size', None)
#         search_id = get_param(request,'data_id',None)    
#         usertype = get_param(request,'user_type',None)
#         is_staff = get_param(request,'is_staff',"0") 
#         search = get_param(request,'search',None)    
#         sort_by = get_param(request,'sort_by',None)    
#         order = get_param(request,'order_by',"asc")    
#         if search_id != None and search_id != "":
#             tranObjs = CAUsers.objects.filter(id=search_id)
#         else:
#             tranObjs = CAUsers.objects.all().order_by('first_name')
#             # Filters/Sorting Start
#             if is_staff:
#                 if is_staff == "1":
#                     tranObjs = tranObjs.filter(is_staff = True)
#                 else:
#                     tranObjs = tranObjs.filter(is_staff = False)
            

#             if usertype !=None and usertype !="" and usertype !="none":
#                 usertype_list = usertype.split(",")
#                 tranObjs = tranObjs.filter(user_role__in=usertype_list)

#             if search !=None and search !="":
#                 tranObjs = tranObjs.filter(Q(first_name__icontains=search) | Q(last_name__icontains=search) | Q(email__icontains=search)| Q(user_role__icontains=search))

#             if sort_by !=None and sort_by !="" and sort_by != "none":
#                 if order == "asc":
#                     tranObjs = tranObjs.order_by(sort_by)
#                 else:
#                     tranObjs = tranObjs.order_by("-" + sort_by)
#             # Filters/Sorting End
#         # pagination variable
#         num_pages = 1
#         total_records = len(tranObjs)
#         if page_num != None and page_num != "":
#             page_num = int(page_num)
#             tranObjs = Paginator(tranObjs, int(page_size))
#             try:
#                 tranObjs = tranObjs.page(page_num)
#             except:
#                 tranObjs = tranObjs
#             num_pages = int(math.ceil(total_records / float(int(page_size))))
#         # data = list(tranObjs)
#         obj['message'] = "Success"
#         obj['num_pages'] = num_pages
#         obj['total_records'] = total_records
#         obj['filter']['user_type'] = []
#         # filter list defining
#         if is_staff:
#             if is_staff == "1":
#                 for role in staff_roles:
#                     obj['filter']['user_type'].append({
#                             'value':role,
#                             'label':titlecase(role)
#                             })
#             else:
#                 obj['filter']['user_type'] = [{'value':'user','label':'User'}]
#         else:
#             obj['filter']['user_type'] = [{'value':'user','label':'User'}]
#             obj['filter']['user_type'].append({
#                             'value':role,
#                             'label':titlecase(role)
#                             })

#         obj['filter']['sort_by'] =   [{'value':'','label':'None'},
#                                       {'value':'first_name','label':'First Name'},
#                                       {'value':'last_name','label':'Last Name'},
#                                       {'value':'email','label':'Email'},
#                                       {'value':'user_role','label':'User Role'}]
  
#         obj['filter']['order_by'] = [{'value':'asc','label':'Ascending'},
#                                       {'value':'desc','label':'Descending'}]

#         obj['filter']['is_staff'] = [{'value':'0','label':'User'},
#                                       {'value':'1','label':'Staff'}]


#     if operation == "create":
#         fname            = get_param(request, 'fname', None)
#         lname            = get_param(request, 'lname', None)
#         email            = get_param(request, 'email', None)
#         is_staff         = get_param(request, 'is_staff', "0")
#         user_role        = get_param(request,'user_role',"user")
#         email = email.lower()
#         email = cleanstring(email)
#         fname  = fname.lower()
#         lname  = lname.lower()
#         user_role  = cleanstring(user_role).lower()
#         fname  = cleanstring(fname)
#         lname  = cleanstring(lname)

#         users = CAUsers.objects.filter(email=email)
#         if len(users):
#             obj['message'] = "User Already Exists!"
#         else:
#             user  = create_check_user(firstname=fname, lastname = lname, email=email)

#             if is_staff:
#                 if is_staff == "1":
#                     user.is_staff = True
#                     if user_role not in allowed_admin_roles:
#                         user.user_role = "staff"
#                     else:
#                         user.user_role = user_role

                    
#                 else:
#                     user.is_staff = False
#                     user.user_role = "user"

#             user.save()
#             tranObjs = [user]
#             obj['message'] = "User Created"

#     if operation == "update":
#         data_id          = get_param(request, 'data_id', None)
#         fname            = get_param(request, 'fname', None)
#         lname            = get_param(request, 'lname', None)
#         is_staff         = get_param(request, 'is_staff', "0")
#         user_role        = get_param(request,'user_role',"user")
#         is_activate      = get_param(request,'is_active',"1")

#         fname  = fname.lower()
#         lname  = lname.lower()
#         fname  = cleanstring(fname)
#         lname  = cleanstring(lname)
#         user_role  = cleanstring(user_role).lower()

#         try:
#             user = CAUsers.objects.get(id=data_id)
#         except:
#             user = None
#         obj['message'] = "User Not Found"

#         if user:
#             if is_activate:
#                 if is_activate == "0":
#                     user.active = False
#                 else:
#                     user.active = True

#             user.first_name = fname
#             user.last_name  = lname

#             if is_staff:
#                 if is_staff == "1":
#                     user.is_staff = True
#                     if user_role not in allowed_admin_roles:
#                         user.user_role = "staff"
#                     else:
#                         user.user_role = user_role
#                 else:
#                     user.is_staff = False
#                     user.user_role = "user"

#             user.save()
#             tranObjs = [user]
#             obj['message'] = "User Updated"

#     if operation == "delete":
#         data_id      = get_param(request, 'data_id', None)
#         try:
#             user  = CAUsers.objects.get(id=data_id)
#         except:
#             user = None
#         obj['message'] = "User Not Found"

#         if user:
#             user.active = False
#             user.save()
#             obj['message'] = "User Deleted"

#     for trans in tranObjs:
#         obj['result'].append({
#         'id':trans.id,
#         'first_name':trans.first_name,
#         'last_name':trans.last_name,
#         'email':trans.email,
#         'user_role':trans.user_role,
#         'is_staff':trans.is_staff,
#         'secret_string':trans.secret_string,
#         'auth_token':trans.auth_token,
#         'is_active':trans.active
#     })
#     obj['status'] = True
#     return HttpResponse(json.dumps(obj), content_type='application/json')



# <------------------ CRUD Topics Start --------------------->

def create_update_user(request):
    error = False
    success = False
    error_message_list = []
    output = CAUsers.objects.none()
    message = "Request Recieved"
    operation        = get_param(request, 'operation', None)
    fname            = get_param(request, 'fname', None)
    lname            = get_param(request, 'lname', None)
    email            = get_param(request, 'email', None)
    is_staff         = get_param(request, 'is_staff', None)
    user_role        = get_param(request,'user_role',None)
    data_id          = get_param(request, 'data_id', None)      
    # user fields check and correction
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


    if operation == "create":
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
    
    check_user_role = listvar_check(variable_name="user_role",value=user_role,allowedlist=allowed_roles)
    if not check_user_role['error']:
        user_role = str(user_role)
    else:
        error = True
        error_message_list.append(check_user_role['errormessage'])

    check_is_staff = booleanvar_check(variable_name="is_staff",value=is_staff)
    if not check_is_staff['error']:
        is_staff = check_is_staff['output']
        if is_staff:
            check_user_role = listvar_check(variable_name="user_role",value=user_role,allowedlist=staff_roles)
            if not check_user_role['error']:
                user_role = str(user_role)
            else:
                error = True
                error_message_list.append(check_user_role['errormessage'])
        else:
            user_role = "user"
            
    else:
        error = True 
        error_message_list.append(check_is_staff['errormessage'])


    if operation == "update":
        if data_id:
            try:
                user = CAUsers.objects.get(id=data_id)
            except:
                error = True
                error_message_list = ['invalid data_id']
        else:
            error = True
            error_message_list = ['missing data_id']
        
    if not error: 
        if operation == "create":
            users = CAUsers.objects.filter(email=email)
            if users.count() > 0 :
                message = "User Already Exists!"        
                output = users
                success = False
            else:
                user_new = CAUsers.objects.create(
                            first_name=fname,
                            last_name=lname,
                            email=email,
                            is_staff=is_staff,
                            user_role = user_role
                        )
                user_new.set_password(defaultpassword)
                user_new.secret_string = (user_new.id + random_str_generator())
                user_new.auth_token = (user_new.id + random_str_generator())
                user_new.save()
                output = [user_new]
                success = True
                message = "User Created!"
        else:
            user.first_name        = fname                 
            user.last_name         = lname                 
            user.is_staff          = is_staff
            if not is_staff:
                user.user_role = "user"
            else:
                if user_role in staff_roles:
                    user.user_role = user_role
                else:
                    error = True
                    user.user_role = "staff"
            user.save()
            output = [user]
            success = True
            message = "User Updated!"
    else:
        message = "Errors | Refer Error List!"

    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}


def activate_user(request):
    error = False
    success = False
    error_message_list = []
    output = CAUsers.objects.none()
    message = "Request Recieved"
    data_id          = get_param(request, 'data_id', None)
    is_active        = get_param(request, 'is_active', None)
    if data_id:
        try:
            user = CAUsers.objects.get(id=data_id)
        except:
            error = True
            error_message_list.append("Invalid data_id")
    else:
        error = True
        error_message_list.append("Missing data_id")
        
    check_is_active = booleanvar_check(variable_name="is_active",value=is_active)
    if not check_is_active['error']:
        is_active = check_is_active['output']
    else:
        error = True 
        error_message_list.append(check_is_active['errormessage'])
        
    if not error:
        user.active = is_active
        user.save()
        success = True
        if is_active:
            message = "User Activated!"
        else:
            message = "User Deactivated!"
        output = [user]
    else:
        success = False
        message = "Errors! Refer error list"
    return {'output':output,'message':message,'error':error,'error_message_list':error_message_list,'success':success}



def read_users(request):
    error = False
    success = False
    error_message_list = []
    message = "Request Recieved!"
    filters = {}
    num_pages = 1
    total_records = 0 
    tranObjs = CAUsers.objects.none()
    page_num = get_param(request, 'page_num', "1")
    page_size = get_param(request, 'page_size', "10")
    search_id = get_param(request,'data_id',None)    
    usertype = get_param(request,'user_type',None)
    is_staff = get_param(request,'is_staff',None) 
    search = get_param(request,'search',None)    
    sort_by = get_param(request,'sort_by',None)    
    order = get_param(request,'order_by',"asc")    
    if search_id != None and search_id != "":
        tranObjs = CAUsers.objects.filter(id=search_id)
    else:
        tranObjs = CAUsers.objects.all().order_by('first_name')
        # Filters/Sorting Start
        if is_staff:
            if is_staff == "1":
                tranObjs = tranObjs.filter(is_staff = True)
            else:
                tranObjs = tranObjs.filter(is_staff = False)

        if usertype !=None and usertype !="" and usertype !="none":
            usertype_list = usertype.split(",")
            tranObjs = tranObjs.filter(user_role__in=usertype_list)

        if search !=None and search !="":
            tranObjs = tranObjs.filter(Q(first_name__icontains=search) | Q(last_name__icontains=search) | Q(email__icontains=search)| Q(user_role__icontains=search))

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
    message  = "Success!"
    success = True
    
    filters['user_type'] = []
    # filter list defining
    if is_staff:
        if is_staff == "1":
            for role in staff_roles:
                filters['user_type'].append({
                        'value':role,
                        'label':titlecase(role)
                        })
        else:
            filters['user_type'] = [{'value':'user','label':'User'}]
    else:
        filters['user_type'] = [{'value':'user','label':'User'}]
        for role in staff_roles:
            filters['user_type'].append({
                        'value':role,
                        'label':titlecase(role)
                        })

    filters['sort_by'] = [
                                    {'value':'first_name','label':'First Name'},
                                    {'value':'last_name','label':'Last Name'},
                                    {'value':'email','label':'Email'},
                                    {'value':'user_role','label':'User Role'}]

    filters['order_by'] = [{'value':'asc','label':'Ascending'},
                                    {'value':'desc','label':'Descending'}]

    filters['is_staff'] = [{'value':'0','label':'User'},
                            {'value':'1','label':'Staff'}]

    

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

def crud_user(request):
    obj = {}
    status = False
    result = []
    message = "Request Recieved"
    filters = {}
    tranObjs = CAUsers.objects.none()
    operation = get_param(request, 'operation', None)
    error = False
    error_message_list = []
    num_pages = 1
    total_records = 0 
    
    check_operation = listvar_check(variable_name='operation',value=operation,allowedlist=operations_allowed_user)
    if not check_operation['error']:
        if operation == "read":
            out_read_users = read_users(request) 
            message = out_read_users['message']               
            tranObjs = out_read_users['output']
            error_message_list.extend(out_read_users['error_message_list'])               
            error = out_read_users['error']     
            status = out_read_users['success']     
            num_pages     = out_read_users['num_pages']          
            filters       = out_read_users['filter']     
            total_records = out_read_users['total_records']          

        if operation in ["create","update"]:
            out_create_update_user = create_update_user(request) 
            message = out_create_update_user['message']               
            tranObjs = out_create_update_user['output']
            error_message_list.extend(out_create_update_user['error_message_list'])               
            error = out_create_update_user['error']   
            status = out_create_update_user['success']          

        if operation == "activate":
            out_activate_user = activate_user(request) 
            message = out_activate_user['message']               
            tranObjs = out_activate_user['output']               
            error_message_list.extend(out_activate_user['error_message_list'])               
            error = out_activate_user['error']     
            status = out_activate_user['success']           

        if not error:
            for trans in tranObjs:
                result.append({
                    'id':trans.id,
                    'first_name':trans.first_name,
                    'last_name':trans.last_name,
                    'email':trans.email,
                    'user_role':trans.user_role,
                    'is_staff':trans.is_staff,
                    'secret_string':trans.secret_string,
                    'auth_token':trans.auth_token,
                    'is_active':trans.active
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


# def create_check_user(firstname,lastname,email):
#     if email:
#         users = CAUsers.objects.filter(email=email)
#         if len(users):
#             user_old = users[0]
#             user_old.active = True
#             user_old.save()
#             return user_old
#         else:
#             user_new = CAUsers.objects.create(first_name=firstname,last_name=lastname,email=email)
#             user_new.set_password("careerannafirstlogin")
#             user_new.secret_string = (user_new.id + random_str_generator())
#             user_new.auth_token = (user_new.id + random_str_generator())
#             user_new.save()
#             return user_new

# logging in with password
def login_view_staff(request):
    obj = {}
    obj['status'] = False
    email           = get_param(request, 'email', None)
    password        = get_param(request, 'pass', None)
    secret_string   = get_param(request, 'sec_string', None)
    auth_token      = get_param(request, 'auth_token', None)
    status= False
    print auth_token
    if email:
        email = email.lower()
        email = cleanstring(email)
    obj['result'] = {}
    obj['result']['user'] = {}
    # obj['user'] = {}
    message = ""
    if auth_token:
        try:
            user = CAUsers.objects.get(auth_token=auth_token,active=True)
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            message = "User Found"
            login(request, user)
            obj['result']['user']['auth_token'] = auth_token
            obj['result']['user']['id'] = user.id
            obj['result']['user']['first_name'] = user.first_name
            obj['result']['user']['last_name'] = user.last_name
            obj['result']['user']['email'] = user.email
            obj['result']['user']['user_role'] = user.user_role
            obj['result']['user']['is_staff'] = user.is_staff
            obj['result']['auth'] = True
            message = "Login Success!"
            status = True
            print 1
        except:
            obj['result']['auth'] = False
            message = "Auth Token Expired"
            obj['result']['user'] = None
            status = False
            print 2
    else:
        try:
            user = CAUsers.objects.get(email=email,active=True)
            if user:
                print 3
                user.backend = 'django.contrib.auth.backends.ModelBackend'
                message = "User Found"
                if user.check_password(password):
                    print 4
                    login(request, user)
                    new_string = user.id + random_str_generator()
                    user.auth_token = new_string
                    obj['result']['user']['auth_token'] = new_string
                    obj['result']['user']['id'] = user.id
                    obj['result']['user']['first_name'] = user.first_name
                    obj['result']['user']['last_name'] = user.last_name
                    obj['result']['user']['email'] = user.email
                    obj['result']['user']['user_role'] = user.user_role
                    obj['result']['user']['is_staff'] = user.is_staff
                    obj['result']['auth'] = True
                    message = "Login Success!"
                    status = True
                    user.save()
                elif user.secret_string == secret_string:
                    print 5
                    login(request, user)
                    new_string = user.id + random_str_generator()
                    user.auth_token = new_string
                    obj['result']['user']['auth_token'] = new_string
                    obj['result']['user']['id'] = user.id
                    obj['result']['user']['first_name'] = user.first_name
                    obj['result']['user']['last_name'] = user.last_name
                    obj['result']['user']['email'] = user.email
                    obj['result']['user']['user_role'] = user.user_role
                    obj['result']['user']['is_staff'] = user.is_staff
                    obj['result']['auth'] = True
                    status = True
                    message = "Login Success!"
                    user.save()
                else:
                    print 6
                    message = "Incorrect Password"
                    obj['result']['auth'] = False
                    status = False

            else:
                print 7
                message = "User Doesn't exist"
                obj['result']['auth'] = False
                obj['result']['user'] = None
                status = False
        except:
            print 8
            if email:
                print 9
                message = "User Doesn't exist"
            obj['result']['auth'] = False
            obj['result']['user'] = None
            status = False
    obj['status'] = status
    obj['message'] = message
    response = HttpResponse(json.dumps(obj), content_type='application/json')
    return response

def send_password_reset(request):
    obj = {}
    obj['status'] = False
    email = get_param(request, 'email', None)
    randstring = ""
    try:
        user = CAUsers.objects.get(email=email,active=True)
        if user:
                print 1
                randstring = user.id + random_str_generator(size=6)
                # Mailing function to send email to the user
                message = "Reset Request Success"
                user.secret_string = randstring
                user.save()
                mailing.send_password_reset_email(name=user.first_name, email=user.email, secret_string=randstring.encode('utf-8'))
        else:
            message = "User Doesn't exist"
    except:
        message = "User Doesn't exist"
        obj['user'] = None
    obj['status'] = True
    obj['message'] = message
    response = HttpResponse(json.dumps(obj), content_type='application/json')
    return response

def reset_pass_staff(request):
    obj = {}
    obj['status'] = False
    obj['result'] = {}
    obj['result']['user'] = {}
    obj['result']['auth'] = False

    password        = get_param(request, 'pass', None)
    secret_string   = get_param(request, 'sec_string', None)
    try:
        user = CAUsers.objects.get(secret_string=secret_string,active=True)
        user.set_password(password)
        randstring = user.id + random_str_generator(size=6)
        randstring2 = user.id + random_str_generator(size=6)
        user.secret_string = randstring
        user.auth_token = randstring2
        user.save()

        obj['result']['user']['auth_token'] = randstring2
        obj['result']['user']['id'] = user.id
        obj['result']['user']['first_name'] = user.first_name
        obj['result']['user']['last_name'] = user.last_name
        obj['result']['user']['email'] = user.email
        obj['result']['user']['user_role'] = user.user_role
        obj['result']['user']['is_staff'] = user.is_staff
        obj['result']['auth'] = True
        obj['message'] = "Password Reset Success"
    except:
        obj['message'] = "Invalid Request Please Try Resetting the Password Again"
    obj['status'] = True
    
    return HttpResponse(json.dumps(obj), content_type='application/json')
# logging out

def logout_view_staff(request):
    obj = {}
    obj['status'] = False
    data_id = get_param(request, 'data_id', None)
    
    if request.user.is_anonymous:
        user = CAUsers.objects.get(id=data_id)
        user.auth_token = user.id + random_str_generator()
        user.save()
        # logout(user)
    else:
        print user.first_name
        user.auth_token = user.id + random_str_generator()
        user.save()
        logout(request)
    
    
    obj['result'] = ""
    obj['status'] = True
    obj['message'] = "Logout Success"
    
    response = HttpResponse(json.dumps(obj), content_type='application/json')
    return response



# <------------------ End ------------------------->