import {
    createAction
} from 'redux-actions';
import actionTypes from '../actionTypes';
import {api} from '../../helpers/api.js';

const returnArgumentsFn = function (payload) {
    return Promise.resolve(payload);
};

export default {
    // Data List Manipulation
    setQuestionList: createAction(actionTypes.QUESTION_LIST_SET, returnArgumentsFn),
    removeQuestion:createAction(actionTypes.QUESTION_REMOVE, returnArgumentsFn),
    setTotalQuestions:createAction(actionTypes.SET_TOTAL_RECORDS, returnArgumentsFn),
    // Add Data
    addQuestion: createAction(actionTypes.QUESTION_ADD_QUESTION, returnArgumentsFn),
    // Edit Data
    setEditQuestion: createAction(actionTypes.QUESTION_SET_EDIT_QUESTION, returnArgumentsFn),
    setEmptyEditQuestion: createAction(actionTypes.QUESTION_SET_EMPTY_EDIT_QUESTION, returnArgumentsFn),
    editQuestion: createAction(actionTypes.QUESTION_EDIT_QUESTION, returnArgumentsFn),
    // UI Variable
    viewAddQuestion:createAction(actionTypes.VIEW_ADD_QUESTIONBOX, returnArgumentsFn),
    closeAddQuestion:createAction(actionTypes.HIDE_ADD_QUESTIONBOX, returnArgumentsFn),
    // Select Data
    addSelectedQuestion: createAction(actionTypes.QUESTION_SELECT_ADD_QUESTION_ID, returnArgumentsFn),
    removeSelectedQuestion: createAction(actionTypes.QUESTION_SELECT_REMOVE_QUESTION_ID, returnArgumentsFn),
    emptySelectedQuestion: createAction(actionTypes.QUESTION_SELECT_REMOVEALL_QUESTION_ID, returnArgumentsFn),
    selectAllQuestion: createAction(actionTypes.QUESTION_SELECT_ALL_QUESTION_ID, returnArgumentsFn),
    deselectAllQuestion: createAction(actionTypes.QUESTION_DESELECT_ALL_QUESTION_ID, returnArgumentsFn),
    emptyMoveSelectedQuestion: createAction(actionTypes.QUESTION_MOVE_ALL_SELECTED, returnArgumentsFn),
    setDefaultQuestions:createAction(actionTypes.SET_QUESTION_DEFAULT, returnArgumentsFn),
    // Move Select Data
    // moveData: createAction(actionTypes.QUESTION_SELECT_MOVE, returnArgumentsFn),    
};
