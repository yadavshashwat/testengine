from django.conf.urls import include, url


urlpatterns = [
    url(r'crud_courses/$', 'coursemgmt.views.crud_courses'),
    
]
