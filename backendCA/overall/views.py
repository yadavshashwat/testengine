from django.shortcuts import render
from django.http import HttpResponseRedirect,HttpResponseForbidden,HttpResponse
from models import *

import boto3
import base64
import datetime
import re
import random
import string
import time
from datetime import datetime
import os
import requests
import xlwt

# Create your views here.

bucket_name = "careerannatestengine"
boolean_fields = ['0','1']
# Generic Functions
def cleanstring(query):
    query = query.strip()
    query = re.sub('\s{2,}', ' ', query)
    query = re.sub(r'^"|"$', '', query)
    return query

# <---------------- Get parameters in an api from request  start ------------------->

def get_param(req, param, default):
    req_param = None
    if req.method == 'GET':
        q_dict = req.GET
        if param in q_dict:
            req_param = q_dict[param]
    elif req.method == 'POST':
        q_dict = req.POST
        if param in q_dict:
            req_param = q_dict[param]
    if not req_param and default != None:
        req_param = default
    return req_param

# <---------------- Set Cookie ------------------->

def set_cookie(response, key, value, days_expire = 7):
    if days_expire is None:
        max_age = 365 * 24 * 60 * 60  #one year
    else:
        max_age = days_expire * 24 * 60 * 60
    expires = datetime.datetime.strftime(datetime.datetime.utcnow() + datetime.timedelta(seconds=max_age), "%a, %d-%b-%Y %H:%M:%S GMT")
    response.set_cookie(key, value, max_age=max_age, expires=expires)

# Random String Generator

def random_str_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for x in range(size))


# def upload_image(request):
    
def upload_file(request):
    obj = {}
    obj['status'] = False
    obj['result'] = []
    obj['message'] = "Request Recieved!"
    filetype = get_param(request, 'filetype', None)
    # if request.user.is_authenticated and request.user.is_staff:
    if filetype:
        if filetype=='image':
            given_filename = request.FILES["file"].name
            file = request.FILES["file"]
            destination = open('filename.data', 'wb')
            for chunk in file.chunks():
                destination.write(chunk)
            destination.close()
            s3 = boto3.resource('s3')
            ts = time.time()
            created_at = datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
            final_filename = "img-" + random_str_generator(2) + str(ts).replace(".", "")  + ".jpg" 
            s3.Object(bucket_name, 'images/' + final_filename).put(Body=open('filename.data', 'rb'))
            filepath = "https://s3.amazonaws.com/"+bucket_name+"/images/"+final_filename
            if request.user.is_anonymous:
                fileupload = FileUpload.objects.create(initial_file_name = given_filename,
                                                        final_file_name  = final_filename,
                                                        file_path        = filepath,
                                                        uploaded_at      = created_at,
                                                        file_type        = "image",
                                                        created_by       = None
                                                        )
            else:
                fileupload = FileUpload.objects.create(initial_file_name = given_filename,
                                                        final_file_name  = final_filename,
                                                        file_path        = filepath,
                                                        uploaded_at      = created_at,
                                                        file_type        = "image",
                                                        created_by       = request.user
                                                        )
               
            if os.path.exists('filename.data'):
                os.remove('filename.data')
            obj['status'] = True
            obj['message'] = "Image Uploaded!"
            try:
                if fileupload.created_by:
                    user_out = json.loads(str(fileupload.created_by))
                else:
                    user_out = str(fileupload.created_by)
            except:
                user_out = None

            obj['result'].append(
                {'id':fileupload.id,
                'initial_file_name':fileupload.initial_file_name,
                'final_file_name':fileupload.final_file_name,
                'file_path':fileupload.file_path,
                'uploaded_at':str(fileupload.uploaded_at),
                'file_type':fileupload.file_type,
                'created_by':user_out
                })

    return HttpResponse(json.dumps(obj), content_type='application/json')



    

def intvar_check(variable_name,value,missing_allowed=False):
    output = None
    error_message = "No Errors"
    error = False
    is_missing = False
    if value  != "" and value != None:
        try:
            if value != "":
                output = int(value)
            else:
                output = None
        except:
            error = True
            error_message = 'Incorrect '+variable_name + ' | values: integers'
    else:
        is_missing = True
        if not missing_allowed:
            error = True
            error_message = 'Missing '+ variable_name
        else:
            pass
    return {'output':output,'error': error, 'errormessage':error_message,'is_missing' : is_missing}

def floatvar_check(variable_name,value,missing_allowed=False):
    output = None
    error_message = "No Errors"
    error = False
    is_missing = False
    # print value
    if value  != "" and value != None:
        try:
            if value != "":
                output = float(value)
            else:
                output = None
        except:
            error = True
            error_message = 'Incorrect '+variable_name + ' | values: float'
    else:
        is_missing = True
        if not missing_allowed:
            error = True
            error_message = 'Missing '+ variable_name
        else:
            pass

    return {'output':output,'error': error, 'errormessage':error_message,'is_missing' : is_missing}


def listvar_check(variable_name,value,allowedlist,missing_allowed=False):
    output = None
    error_message = "No Errors"
    error = False
    is_missing = False
    if value  != "" and value != None:
        if value in allowedlist:
            output = str(value)
        else:
            error = True
            error_message = 'Incorrect '+variable_name + ' | values: ' + str(allowedlist)
    else:
        is_missing = True
        if not missing_allowed:
            error = True
            error_message = 'Missing '+ variable_name
        else:
            pass
    return {'output':output,'error': error, 'errormessage':error_message,'is_missing' : is_missing}



def booleanvar_check(variable_name,value):
    output = None
    error_message = "No Errors"
    error = False

    if value  != "" and value != None:
        if value in boolean_fields:
            if value == "1":
                output = True
            else:
                output = False
        else:
            error = True
            error_message = 'Incorrect '+variable_name + ' | values: ' + str(boolean_fields)
    else:
        error = True
        error_message = 'Missing '+ variable_name

    return {'output':output,'error': error, 'errormessage':error_message}


def scrape_unacademy_educator():

    headers = {
        'pragma': 'no-cache',
        'cookie': '_ga=GA1.2.2062822434.1544531351; learnerId=3369216408714; _gid=GA1.2.856448574.1548829871; _fbp=fb.1.1548829872506.1235790251; mp_535208d541f9b5935ef91a365b0439e1_mixpanel=%7B%22distinct_id%22%3A%20%221679d3e14dd31-0857131983cea6-35667607-13c680-1679d3e14de81f%22%2C%22%24device_id%22%3A%20%221679d3e14dd31-0857131983cea6-35667607-13c680-1679d3e14de81f%22%2C%22%24search_engine%22%3A%20%22google%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fwww.google.co.in%2F%22%2C%22%24initial_referring_domain%22%3A%20%22www.google.co.in%22%2C%22mp_keyword%22%3A%20%22https%3A%2F%2Funacademy.com%2Fgoal%2Fupsc-civil-services-examination-ias-preparation%2FKSCGY%2Feducators%22%7D',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
        'accept': '*/*',
        'cache-control': 'no-cache',
        'authority': 'unacademy.com',
        'referer': 'https://unacademy.com/goal/upsc-civil-services-examination-ias-preparation/KSCGY/educators',
    }
    count = 2070
    i = 0
    while i < count:
        params = (
            ('language', 'english'),
            ('limit', '10'),
            ('offset', i),
            ('sort', 'popular'),
        )
        
        response = requests.get('https://unacademy.com/api/v1/topology/users/KSCGY/educators/', headers=headers, params=params)
        jsonout = response.json()
        # print jsonout
        for item in jsonout['results']:
            print item['username']
            UnaAcademyEducators.objects.create(
                username = item['username'],
                first_name= item['first_name'],
                bio= item['bio'],
                last_name=  item['last_name'],
                avatar= item['avatar'],
                followers_count=  item['followers_count'],
                is_following =  item['is_following'],
                permalink = item['permalink'],
                uid = item['uid'],
                courses_count=  item['courses_count'],
                is_educator= item['is_educator'],
                is_verified_educator=  item['is_verified_educator'],
                avg_rating= item['avg_rating'],
            )
        i = i + 10 

def unacademy_educators(request):
    result = []
    transObjs = UnaAcademyEducators.objects.all()
    count =transObjs.count()
    response = HttpResponse(content_type='application/ms-excel')
    response['Content-Disposition'] = 'attachment; filename="educator_list.xls"'
    wb = xlwt.Workbook(encoding='utf-8')    
    ws = wb.add_sheet('Educators')
    row = 0 
    ws.write(row, 0, "username")
    ws.write(row, 1, "first_name")
    ws.write(row, 2, "bio")
    ws.write(row, 3, "last_name")
    ws.write(row, 4, "avatar")
    ws.write(row, 5, "followers_count")
    ws.write(row, 6, "is_following")
    ws.write(row, 7, "permalink")
    ws.write(row, 8, "uid")
    ws.write(row, 9, "is_educator")
    ws.write(row, 10, "is_verified_educator")
    ws.write(row, 11, "avg_rating")
    ws.write(row, 12, "courses_count")
    
    
    for trans in transObjs:
        row = row + 1
        ws.write(row, 0, trans.username)
        ws.write(row, 1, trans.first_name)
        ws.write(row, 2, trans.bio)
        ws.write(row, 3, trans.last_name)
        ws.write(row, 4, trans.avatar)
        ws.write(row, 5, trans.followers_count)
        ws.write(row, 6, trans.is_following)
        ws.write(row, 7, trans.permalink)
        ws.write(row, 8, trans.uid)
        ws.write(row, 9, trans.is_educator)
        ws.write(row, 10, trans.is_verified_educator)
        ws.write(row, 11, trans.avg_rating)
        ws.write(row, 12, trans.courses_count)


    wb.save(response)
    return response



        # result.append({
        #             'username': trans.username , 
        #             'first_name': trans.first_name , 
        #             'bio': trans.bio , 
        #             'last_name': trans.last_name , 
        #             'avatar': trans.avatar , 
        #             'followers_count': trans.followers_count , 
        #             'is_following': trans.is_following , 
        #             'permalink': trans.permalink , 
        #             'uid': trans.uid , 
        #             'courses_count': trans.courses_count , 
        #             'is_educator': trans.is_educator , 
        #             'is_verified_educator': trans.is_verified_educator , 
        #             'avg_rating': trans.avg_rating
        #         })

    # obj = {}
    # obj['result']=result
    # obj['count']=count
    return HttpResponse(json.dumps(result), content_type='application/json')

    # ws.write(row, 0, "id")
    # ws.write(row, 10, "news_type")
