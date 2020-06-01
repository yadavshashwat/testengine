from django.conf.urls import include, url


urlpatterns = [

    # Fetch All Questions
    url(r'crud_testfolders/$', 'testmgmt.views.crud_testfolders'),
    url(r'crud_test/$', 'testmgmt.views.crud_test'),
    url(r'crud_section/$', 'testmgmt.views.crud_section'),
    url(r'crud_testcategory/$', 'testmgmt.views.crud_testcategory'),
    url(r'crud_table/$', 'testmgmt.views.crud_table'),
]
