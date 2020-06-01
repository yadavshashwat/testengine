from django.shortcuts import render
import os
import csv
import re
import json
from overall.views import cleanstring
from questionmgmt.models import *
from testmgmt.models import *
path = os.path.dirname(os.path.realpath(__file__))
# Create your views here.
def loadTopics(fileName):
    with open(path+'/data/'+fileName, 'rU') as csvfile:
        topicData = csv.reader(csvfile, delimiter='\t', quotechar='|')
        for topic in topicData:
            category       = cleanstring(topic[0]).lower()
            sub_category   = cleanstring(topic[1]).lower()
            description    = cleanstring(topic[2]).lower()
            findTopic = Topics.objects.filter(category=category, sub_category=sub_category)
            if len(findTopic):
                findTopic = findTopic[0]
                findTopic.category          = category
                findTopic.sub_category      = sub_category
                findTopic.description       = description
                findTopic.save()
            else:
                cc = Topics(category          = category
                            ,sub_category        = sub_category
                            ,description       = description
                            )
                cc.save()


def loadTestTopics(fileName):
    with open(path+'/data/'+fileName, 'rU') as csvfile:
        topicData = csv.reader(csvfile, delimiter='\t', quotechar='|')
        for topic in topicData:
            category       = cleanstring(topic[0]).lower()
            sub_category   = cleanstring(topic[1]).lower()
            description    = cleanstring(topic[2]).lower()
            findTopic = TestCategory.objects.filter(category=category, sub_category=sub_category)
            if len(findTopic):
                findTopic = findTopic[0]
                findTopic.category          = category
                findTopic.sub_category      = sub_category
                findTopic.description       = description
                findTopic.save()
            else:
                cc = TestCategory(category          = category
                            ,sub_category        = sub_category
                            ,description       = description
                            )
                cc.save()
