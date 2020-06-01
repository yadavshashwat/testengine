from questionmgmt.edoola_scrape import *

# EdoolaQuestions.objects.all().delete()
# EdoolaPassages.objects.all().delete()


# EdoolaFolders.objects.all().delete()
# download_folders()

# EdoolaTests.objects.all().delete()
# scrape_all_tests()


# all_active_tests = EdoolaTests.objects.filter(active=True)
# for active_test in all_active_tests:
#     EdoolaQuestions.objects.filter(test = active_test).delete()
#     active_test.active = False
#     active_test.save()

# scrape_all_questions()
# print "------------------- scraped questions ----------------------------"

# <<< -------------- Delete passages ------>>>
# all_edoola_passages = EdoolaPassages.objects.filter(copied = True)
# total_passages = Passages.objects.all().count()
# print "Total passages : "  + str(total_passages)
# for passage in all_edoola_passages:
#     if passage.new_passage_id != "":
#         actualpassage = Passages.objects.get(id=passage.new_passage_id)
#         actualpassage.delete()
#     passage.new_passage_id = ""
#     passage.copied = False
#     passage.save()
# final_passages = Passages.objects.all().count()
# print "Total passages : "  + str(final_passages)

# <<< -------------- Delete passages ------>>>

# <<< -------------- Delete Questions ------>>>
# total_folders = QuestionFolder.objects.all().count()
# print "Total Folders : "  + str(total_folders)

# total_questions = Questions.objects.all().count()
# print "Total Questions : "  + str(total_questions)

# QuestionFolder.objects.filter(isOld=True).delete()
# Questions.objects.all().exclude(edoola_q_id = None).delete()

# total_folders = QuestionFolder.objects.all().count()
# print "Total Folders : "  + str(total_folders)

# total_questions = Questions.objects.all().count()
# print "Total Questions : "  + str(total_questions)

# all_questions = EdoolaQuestions.objects.filter(handled_in_new_qb=True)
# print "To handle :" + str(all_questions.count())
# print "Total Questions To Scrape: "  + str(EdoolaQuestions.objects.all().count())

# for question in all_questions:
#     question.question_id_new    = ""
#     question.handled_in_new_qb  = False
#     question.problem = None
#     question.save()

# <<< -------------- Delete Questions ------>>>


# create_passages()
# print "-------------------  created passages ----------------------------"

# insert_questions()

# print "-------------------  inserted questions ----------------------------"


number_type_question_correction()


