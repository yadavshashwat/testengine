from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^question/', include('questionmgmt.urls')),
    url(r'^test/', include('testmgmt.urls')),
    url(r'^user/', include('usermgmt.urls')),
    url(r'^overall/', include('overall.urls')),
    url(r'^course/', include('coursemgmt.urls')),
    url(r'^usertest/', include('testactivity.urls'))
)



