import _ from 'lodash';

export default _.mapKeys([


    // FLAGS
        'FLAG_ADD',
        'FLAG_DISMISS',
    // QUESTION RELATED
    
        // QUESTION SET
        'QUESTION_LIST_SET',
        'QUESTION_REMOVE',
        'SET_TOTAL_RECORDS',
        'SET_QUESTION_DEFAULT',
        // QUESTION ADDITION SUBTRACTION EDITING
        'QUESTION_ADD_QUESTION',
        'QUESTION_SET_EDIT_QUESTION',
        'QUESTION_SET_EMPTY_EDIT_QUESTION',
        'QUESTION_EDIT_QUESTION',
        // QUESTION SELECTION
        'QUESTION_SELECT_ADD_QUESTION_ID',
        'QUESTION_SELECT_REMOVE_QUESTION_ID',
        'QUESTION_SELECT_REMOVEALL_QUESTION_ID',
        'QUESTION_SELECT_ALL_QUESTION_ID',
        'QUESTION_DESELECT_ALL_QUESTION_ID',

        //MOVE
        'QUESTION_MOVE_ALL_SELECTED',

        //UI
        'VIEW_ADD_QUESTIONBOX',
        'HIDE_ADD_QUESTIONBOX',


    // TEST RELATED
        // QUESTION SET
        'TEST_LIST_SET',
        'TEST_REMOVE',
        // TEST ADDITION SUBTRACTION EDITING
        'TEST_ADD_TEST',
        'TEST_SET_EDIT_TEST',
        'TEST_SET_EMPTY_EDIT_TEST',
        'TEST_EDIT_TEST',
        'SET_TEST_DEFAULT',
        // TEST SELECTION
        'TEST_SELECT_ADD_TEST_ID',
        'TEST_SELECT_REMOVE_TEST_ID',
        'TEST_SELECT_REMOVEALL_TEST_ID',
        'TEST_SELECT_ALL_TEST_ID',
        'TEST_DESELECT_ALL_TEST_ID',
        
        
        //MOVE
        'TEST_MOVE_ALL_SELECTED',

        //UI
        'VIEW_ADD_TESTBOX',
        'HIDE_ADD_TESTBOX',

    // SECTION RELATED
        // QUESTION SET
        'SECTION_LIST_SET',
        'SECTION_REMOVE',
        'SET_SECTION_DEFAULT',
        // SECTION ADDITION SUBTRACTION EDITING
        'SECTION_ADD_SECTION',
        'SECTION_SET_EDIT_SECTION',
        'SECTION_SET_EMPTY_EDIT_SECTION',
        'SECTION_EDIT_SECTION',
        'SECTION_CHANGE_ORDER',
        // SECTION SELECTION
        'SECTION_SELECT_ADD_SECTION_ID',
        'SECTION_SELECT_REMOVE_SECTION_ID',
        'SECTION_SELECT_REMOVEALL_SECTION_ID',
        'SECTION_SELECT_ALL_SECTION_ID',
        'SECTION_DESELECT_ALL_SECTION_ID',

        //MOVE
        'SECTION_MOVE_ALL_SELECTED',

        //UI
        'VIEW_ADD_SECTIONBOX',
        'HIDE_ADD_SECTIONBOX',
        
    // SECTIONQUESTION RELATED
        // QUESTION SET
        'SECTIONQUESTION_LIST_SET',
        'SECTIONQUESTION_REMOVE',
        'SET_SECTIONQUESTION_DEFAULT',
        // SECTIONQUESTION ADDITION SUBTRACTION EDITING
        'SECTIONQUESTION_ADD_SECTIONQUESTION',
        'SECTIONQUESTION_SET_EDIT_SECTIONQUESTION',
        'SECTIONQUESTION_SET_EMPTY_EDIT_SECTIONQUESTION',
        'SECTIONQUESTION_EDIT_SECTIONQUESTION',
        'SECTIONQUESTION_CHANGE_ORDER',
        // SECTIONQUESTION SELECTION
        'SECTIONQUESTION_SELECT_ADD_SECTIONQUESTION_ID',
        'SECTIONQUESTION_SELECT_REMOVE_SECTIONQUESTION_ID',
        'SECTIONQUESTION_SELECT_REMOVEALL_SECTIONQUESTION_ID',
        'SECTIONQUESTION_SELECT_ALL_SECTIONQUESTION_ID',
        'SECTIONQUESTION_DESELECT_ALL_SECTIONQUESTION_ID',

        //MOVE
        'SECTIONQUESTION_MOVE_ALL_SELECTED',

        //UI
        'VIEW_ADD_SECTIONQUESTIONBOX',
        'HIDE_ADD_SECTIONQUESTIONBOX',
        
        'ADD_TO_SECTIONQUESTIONLIST',


    // COURSE TEST
        'COURSETEST_LIST_SET',
        'COURSETEST_REMOVE',
        'COURSETEST_ADD_COURSETEST',
        'COURSETEST_SET_COURSETEST',
        'COURSETEST_UPDATE_COURSETEST',
        'COURSETEST_EDIT_COURSETEST',
        'SET_COURSETEST_DEFAULT',
        'UPDATE_COURSETEST_RESPONSE',
        'UPDATE_COURSETEST_TIMER',
        'UPDATE_COURSETEST_QUESTION',
        'UPDATE_COURSETEST_LOADED',

    //AUTHORIZATION

        'LOGIN_USER',
        'LOGOUT_USER',



        

]);