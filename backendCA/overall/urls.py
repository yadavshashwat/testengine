from django.conf.urls import include, url


urlpatterns = [

    url(r'upload_file/$', 'overall.views.upload_file'),
    url(r'unacademy_educators/$', 'overall.views.unacademy_educators'),
]
