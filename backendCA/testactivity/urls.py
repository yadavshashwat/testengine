from django.conf.urls import include, url


urlpatterns = [
    url(r'start_continue/$', 'testactivity.views.start_continue_test'),
    url(r'validate/$', 'testactivity.views.validate_test_state'),
    url(r'update/$', 'testactivity.views.update_active_test'),
    url(r'crud_activetest/$', 'testactivity.views.crud_activetest'),
    url(r'complete_reevaluate/$', 'testactivity.views.complete_evaluate_test'),
    url(r'report_activetest/$', 'testactivity.views.report_activetest'),
    url(r'bookmark_question/$', 'testactivity.views.bookmark_question'),
    url(r'share_question_feedback/$', 'testactivity.views.share_question_feedback'),
]

