from django.test import TestCase

# Create your tests here.
from lxml.html import document_fromstring
import json
import requests
import re
import urllib
from questionmgmt.models import *
from overall.views import cleanstring
from testmgmt.models import *

def mid(s, offset, amount):
    return s[offset:amount]



# Question Import From Edoola
cookies = {
    '_ga': 'GA1.2.1987318299.1552012683',
    'csrftoken': 'X8N1ihKyss6YWIt3XVMykXkg0SiAwLUg',
    'sessionid': '5j46t463kdscty8l13ysx3h6nks3flot',
    '_gid': 'GA1.2.1880984369.1554111483',
}

headers = {
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
    'Accept': '*/*',
    'Referer': 'http://careeranna.edoola.com/manage/content/',
    'X-Requested-With': 'XMLHttpRequest',
    'Connection': 'keep-alive',
}

test_bank_folders  = ['2018 CAT','IPM 2019','MHCET2017','MICAT']

# Folders Download
def download_folders():
    obj = {}
    response_folders = requests.get('http://careeranna.edoola.com/manage/content/', headers=headers, cookies=cookies)
    output_folderlist = response_folders.content
    doc_folders = document_fromstring(output_folderlist)
    folder_table = (doc_folders.xpath("//table[contains(@id, 'folder_table')]/tr/td"))
    list_folders = []

    for folder in folder_table:
        folderobj = {}
        folder_name = ""
        folder_id = ""
        folder_id = folder.xpath("./@id")[0]
        folder_name = cleanstring(folder.text_content()).replace("1. ", "") 
        i = 0 
        if folder_name != "Blank" and folder_name != "Default Folder" and folder_name != "External Content" and folder_name != "" and folder_name != "Licensed Content" :

            if folder_name in test_bank_folders:
                folder_type = "test_bank"
            else:
                folder_type = "question_bank"

            EdoolaFolders.objects.create(
                folder_id=folder_id,
                folder_name=folder_name,
                folder_type = folder_type
            )
            i = i + 1  
            print i

# download_folders()

# Tests Download in a folder
def download_tests_infolder(folder_id='1962',folder_name="Name",folder_type="question_bank"):
    obj = {}
    params = (
        ('folder_id', folder_id),
    )
    response_tests = requests.get('http://careeranna.edoola.com/manage/content/list/', headers=headers, params=params, cookies=cookies)
    output_testlist = response_tests.content
    doc_test = document_fromstring(output_testlist)
    tests_table = (doc_test.xpath("//table[contains(@class,'table')]/tr"))

    list_tests = []
    row = 0
    for test in tests_table:
        try:
            td = test.xpath("./td")
            test_obj = {}
            vanilla_link = td[0].xpath("./a/@href")[0]
            test_name = td[0].text_content()
            type = td[1].text_content()
            date_modified = td[2].text_content()
            question_count = td[3].text_content()
            score_count = td[4].text_content()
            questions_link = ("http://careeranna.edoola.com" + vanilla_link.replace("/detail/", '/questions/'))
            details_link = ("http://careeranna.edoola.com" + vanilla_link)
            test_details_link = questions_link
            test_obj = {"name":cleanstring(test_name),
                        "details_link":details_link,
                        "question_link":questions_link,
                        "type":cleanstring(type),
                        "date_modified":cleanstring(date_modified),
                        "score_count":score_count,
                        "question_count":question_count}
            # list_tests.append(test_obj)
            if type != "Grouped Tests":
                EdoolaTests.objects.create(
                        folder_name        = folder_name,
                        folder_id          = folder_id,
                        test_name          = cleanstring(test_name),
                        details_link       = details_link,
                        question_link      = questions_link,
                        type               = cleanstring(type),
                        folder_type        = folder_type
                )
        except:
            print "Error"
            None

def scrape_all_tests():
    folders = EdoolaFolders.objects.all()
    total = folders.count()
    i = 0
    for folder in folders:
        download_tests_infolder(
            folder_id=folder.folder_id,
            folder_name=folder.folder_name,
            folder_type=folder.folder_type
        )
        i = i + 1
        folder.scraped = True
        folder.save()
        print str(i) + '/' + str(total)

# scrape_all_tests()

def download_questions(test):
    question_link = test.question_link
    type = test.folder_type
    test_name = test.test_name
    folder_name = test.folder_name
    test.active = True
    test.save()

    obj = {}
    section_name = ""
    page_num = 1
    params = (
        ('page', str(page_num)),
    )
    questions_list = []
    response_questions = requests.get(question_link, headers=headers, params=params, cookies=cookies)
    ques_content = response_questions._content
    question_json = json.loads(ques_content)
    page = question_json['paged_questions']['page']
    has_next = page['has_next']
    questions_list = question_json['paged_questions']['questions']
    # i = 1
    print len(questions_list)  

    while has_next:
        page_num = page_num + 1
        params = (
            ('page', str(page_num)),
        )
        response_questions = requests.get(question_link,headers=headers, params=params, cookies=cookies)
        ques_content = response_questions._content
        question_json = json.loads(ques_content)
        page = question_json['paged_questions']['page']
        has_next = page['has_next']
        new_questions = question_json['paged_questions']['questions']
        questions_list.extend(new_questions)
        # i = i + 1
        print len(questions_list)  
    # pure_question = []
    # passages = []
    for ques in questions_list:
        if ques['type_label'] == "Passage":
            existing_passage = EdoolaPassages.objects.filter(passage_slug=ques['slug'])
            if existing_passage.count() > 0 :
                pass
            else:
                EdoolaPassages.objects.create(passage            = ques['question'],
                                            passage_id           = ques['id'],
                                            passage_slug         = ques['slug']
                                            )
        elif ques['type_label'] == "Section":
            section_name = ques['subject_category']
        else:
            is_passage = False
            if ques['main_question_slug'] != "":
                is_passage = True
            EdoolaQuestions.objects.create(
                question           = ques['question'],
                edoola_id          = ques['id'],
                edoola_slug        = ques['slug'],
                is_passage         = is_passage,
                passage_id         = ques['main_question_id'],
                passage_slug       = ques['main_question_slug'],
                bank_type          = type,
                qpaper_id          = ques['question_paper'],
                test_name          = test_name,
                section_name       = section_name,
                solution           = ques['solution'],
                type_label         = ques['type_label'],
                type_id            = ques['type'],
                choices            = ques['choices'],
                all_answers        = ques['all_answers'],
                answer_text        = ques['answer_text'],
                answer             = ques['answer'],
                max_marks          = ques['max_marks'],
                negative_marks     = ques['negative_marks'],
                edoola_folder_name = folder_name,
                question_link      = question_link,
                test               = test
            )

    test.scraped = True
    test.active = False
    test.save()
    # print (test.folder_name + ' : ' + test.test_name)


def scrape_all_questions():
    all_tests = EdoolaTests.objects.filter(scraped=False)
    total = all_tests.count()
    i = 0
    for test in all_tests:
        # print str(test.folder_name)
        # print str(test.test_name)
        download_questions(
            test = test
        )
        i = i + 1
        print str(i) + '/' + str(total) + ' | '+ str(test.folder_name.encode('utf-8')) + ' : ' + str(test.test_name.encode('utf-8'))



def create_passages():
    all_passages = EdoolaPassages.objects.filter(copied = False)
    # all_passages = EdoolaPassages.objects.all()
    total = all_passages.count()
    i = 0 
    images_c = 0 
    for passage in all_passages:
        # download_question_image
        passage_text = passage.passage
        if passage_text:
            doc_text = document_fromstring(passage_text)
            images =  (doc_text.xpath("//img/@src"))
            for image in images:
                new_image = download_question_image(link=image)
                images_c = images_c + 1
                passage_text = passage_text.replace(image,new_image)
                # print image + ' | ' + new_image
            # print passage_text
        else:
            passage_text = "Empty"
        new_passage = Passages.objects.create(
            passage = passage_text
        )
        passage.new_passage_id = new_passage.id
        passage.copied = True
        passage.save()
        i = i + 1
        print str(i) + "/" + str(total)
    print "Total images : " + str(images_c)

correct_answer_dict_mcq_single = {
   "answer":"1"
}

answer_option_dict = {
       "options":[
            {"id":"1","value":"To Fill"},
            {"id":"2","value":"To Fill"}
        ]
}

mapping = {
    'A':1,
    'B':2,
    'C':3,
    'D':4,
    'E':5,
    'F':6,
    'G':7,
    'H':8,
    'I':9,
    'J':10,
    'K':11,
    'L':12,
    'M':13,
    'N':14,
    'O':15,
    'P':16,
    'Q':17,
    'R':18,
    'S':19,
    'T':20,
    'U':21,
    'V':22,
    'W':23,
    'X':24,
    'Y':25,
    'Z':26
}

def insert_questions():
    all_questions = EdoolaQuestions.objects.filter(handled_in_new_qb = False)
    total = all_questions.count()
    i = 0 
    images_c = 0 
    for question in all_questions:
        problem = None
        question_text            = question.question
        # print str(question_text)
        try:
            if question_text:
                # print question_text
                doc_text = document_fromstring(question_text)
                images =  (doc_text.xpath("//img/@src"))
                for image in images:
                    # print image
                    try:
                        new_image = download_question_image(link=image)
                        question_text = question_text.replace(image,new_image)
                        images_c = images_c + 1 
                    except:
                        problem = "missing image on link"
            
            # print ' id: '+ str(question.edoola_id)
            handled = True
            if question.type_id == "2" or question.type_id == "3":
                question_type = "mcq_single"
                options = question.choices
                new_option_dict = {}
                new_option_dict['options'] = []
                new_options = []
                new_option_dict['options'] = new_options

                correct_answer_dict = {}
                correct_answer_dict['answer'] = ''

                if options:
                    for option in options:
                        try:
                            qid = mapping[option[0]]
                        except:
                            qid = option[0]

                        optionvalue = option[1]
                        if optionvalue:
                            doc_option = document_fromstring(optionvalue)
                            imagesop =  (doc_option.xpath("//img/@src"))
                            for image in imagesop:
                                # print image
                                try:
                                    new_image = download_question_image(link=image)
                                    optionvalue = optionvalue.replace(image,new_image)
                                    images_c = images_c + 1 
                                except:
                                    problem = "missing image on link"

                                    
                        new_options.append(
                            {
                            "id":str(qid),
                            "value":optionvalue
                            }
                        )
                    new_option_dict['options'] = new_options
                    # correct_answer_dict = {}

                    try:
                        qaans = mapping[question.all_answers]
                    except:
                        if question.all_answers:
                            qaans = question.all_answers
                        else:
                            qaans = ''
                    try:
                        correct_answer_dict['answer'] = str(qaans)
                    except:
                        correct_answer_dict['answer'] = ''                
                else:
                    new_option_dict = answer_option_dict

            elif question.type_id == "1":
                question_type = "word"
                new_option_dict = None
                correct_answer_dict = {}
                if question.all_answers:
                    correct_answer_dict['answer'] = question.all_answers
                else:
                    correct_answer_dict['answer'] = ""

            elif question.type_id == "8":
                question_type = "number"
                new_option_dict = None
                correct_answer_dict = {}
                if question.all_answers:
                    try:
                        correct_answer_dict['answer'] = float(question.all_answers)
                    except:
                        print question.all_answers.encode('utf-8')
                        problem = "number to word"
                        correct_answer_dict['answer'] = str(question.all_answers.encode('utf-8'))
                        question_type = "word"
                else:
                    correct_answer_dict['answer'] = ""

            elif question.type_id == "6":
                question_type = "essay"
                new_option_dict = None
                correct_answer_dict = None

            elif question.type_id == "11":
                question_type = "chooseorder"
                new_option_dict = answer_option_dict
                correct_answer_dict = None
            else:
                new_option_dict = None
                correct_answer_dict = None
                print question.type_label
                handled = False
                problem = "question type not handled"
                

            solution = question.solution
            if solution:
                doc_solution = document_fromstring(solution)
                imagessol =  (doc_solution.xpath("//img/@src"))
                for image in imagessol:
                    # print image
                    try:
                        new_image = download_question_image(link=image)
                        solution = solution.replace(image,new_image)
                        images_c = images_c + 1 
                    except:
                        problem = "missing image on link"

            passage = None
            is_passage = question.is_passage
            if question.is_passage:
                try:
                    edoola_passage = EdoolaPassages.objects.get(passage_id = question.passage_id)
                    saved_passage = Passages.objects.get(id=edoola_passage.new_passage_id)
                    passage = saved_passage
                except:
                    handled = True
                    is_passage = False
                    passage = None
                    problem = "passage not found"
            
            answer_options           = new_option_dict
            correct_answer           = correct_answer_dict

            if question.test.folder_type == "question_bank":
                folder_name = question.test_name
            else:
                folder_name = question.edoola_folder_name

            all_folders = QuestionFolder.objects.filter(folder_name = folder_name)
            if all_folders.count() > 0 :
                folder = all_folders[0]
            else:
                folder = QuestionFolder.objects.create(folder_name=folder_name,isOld=True)
            question_folder          = folder 
            


            findQuestions = Questions.objects.filter(edoola_q_id = question.edoola_id)
            if findQuestions.count() == 0 :
                new_question = Questions.objects.create(
                        question_text            = question_text,
                        question_type            = question_type,
                        solution                 = solution,
                        is_passage               = is_passage,
                        passage                  = passage,
                        answer_options           = answer_options,
                        correct_answer           = correct_answer,
                        question_folder          = question_folder,
                        edoola_q_id              = question.edoola_id
                    )
                
                new_question_id = new_question.id
                i = i + 1
                print "Added   - " +  str(i) + '/' + str(total) + ' | '+ str(problem) + ' | id: '+ str(question.edoola_id)
            else:
                existingq = findQuestions[0]
                new_question_id = existingq.id
                i = i + 1
                print "Skipped - " +  str(i) + '/' + str(total) + ' | '+ str(problem) + ' | id: '+ str(question.edoola_id)

            question.handled_in_new_qb = True
            question.question_id_new = new_question_id
            question.problem = problem
            question.save()
        except: 
            i = i + 1
            problem = "unable to scrape"
            print "Skipped - " +  str(i) + '/' + str(total) + ' | '+ str(problem) + ' | id: '+ str(question.edoola_id)
            question.handled_in_new_qb = False
            question.question_id_new = None
            question.problem = problem
            question.save()
    print 'Total images :' +  str(images_c)

import requests

def download_question_image(link="https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg?cs=srgb&dl=beauty-bloom-blue-67636.jpg&fm=jpg"):
    f = open("sample.jpg",'wb')
    try:
        f.write(requests.get(link).content)
    except:
        request = requests.get( "http://edoola.s3.amazonaws.com" + link).content
        f.write(request)
    f.close()    
    filepath = upload_file("sample.jpg")
    return filepath


    


import boto3
import time
import os
from datetime import datetime
from overall.views import random_str_generator

bucket_name = "careerannatestengine"
def upload_file(file):
    s3 = boto3.resource('s3')
    ts = time.time()
    created_at = datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S')
    final_filename = "img-" + random_str_generator(2) + str(ts).replace(".", "")  + ".jpg" 
    s3.Object(bucket_name, 'old_q_images/' + final_filename).put(Body=open(file, 'rb'))
    filepath = "https://s3.amazonaws.com/"+bucket_name+"/old_q_images/"+final_filename
    if os.path.exists(file):
        os.remove(file)
    return filepath

def number_type_question_correction():
    all_questions = Questions.objects.filter(question_type = "number")
    i = 0 
    for question in all_questions:
        correct_dict = None
        correct_dict = question.correct_answer
        correct_dict['answer'] = str(correct_dict['answer'])
        question.correct_answer = correct_dict
        question.save()
        i = i + 1
        print i 


