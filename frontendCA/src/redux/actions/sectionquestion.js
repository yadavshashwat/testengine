import {
    createAction
} from 'redux-actions';
import actionTypes from '../actionTypes';

const returnArgumentsFn = function (payload) {
    return Promise.resolve(payload);
};

export default {
    // Data List Manipulation
    
    setSectionQuestionList: createAction(actionTypes.SECTIONQUESTION_LIST_SET, returnArgumentsFn),
    removeSectionQuestion:createAction(actionTypes.SECTIONQUESTION_REMOVE, returnArgumentsFn),
    setTotalSectionQuestions:createAction(actionTypes.SET_TOTAL_RECORDS, returnArgumentsFn),
    // Add Data
    addSectionQuestion: createAction(actionTypes.SECTIONQUESTION_ADD_SECTIONQUESTION, returnArgumentsFn),
    // Edit Data
    setEditSectionQuestion: createAction(actionTypes.SECTIONQUESTION_SET_EDIT_SECTIONQUESTION, returnArgumentsFn),
    setEmptyEditSectionQuestion: createAction(actionTypes.SECTIONQUESTION_SET_EMPTY_EDIT_SECTIONQUESTION, returnArgumentsFn),
    editSectionQuestion: createAction(actionTypes.SECTIONQUESTION_EDIT_SECTIONQUESTION, returnArgumentsFn),
    
    
    changeSectionQuestionOrder:createAction(actionTypes.SECTIONQUESTION_CHANGE_ORDER, returnArgumentsFn),
    // UI Variable
    
    viewAddSectionQuestion:createAction(actionTypes.VIEW_ADD_SECTIONQUESTIONBOX, returnArgumentsFn),
    closeAddSectionQuestion:createAction(actionTypes.HIDE_ADD_SECTIONQUESTIONBOX, returnArgumentsFn),
    // Select Data
    addSelectedSectionQuestion: createAction(actionTypes.SECTIONQUESTION_SELECT_ADD_SECTIONQUESTION_ID, returnArgumentsFn),
    removeSelectedSectionQuestion: createAction(actionTypes.SECTIONQUESTION_SELECT_REMOVE_SECTIONQUESTION_ID, returnArgumentsFn),
    emptySelectedSectionQuestion: createAction(actionTypes.SECTIONQUESTION_SELECT_REMOVEALL_SECTIONQUESTION_ID, returnArgumentsFn),
    selectAllSectionQuestion: createAction(actionTypes.SECTIONQUESTION_SELECT_ALL_SECTIONQUESTION_ID, returnArgumentsFn),
    deselectAllSectionQuestion: createAction(actionTypes.SECTIONQUESTION_DESELECT_ALL_SECTIONQUESTION_ID, returnArgumentsFn),
    emptyMoveSelectedSectionQuestion: createAction(actionTypes.SECTIONQUESTION_MOVE_ALL_SELECTED, returnArgumentsFn),
    
    setDefaultSectionQuestions:createAction(actionTypes.SET_SECTIONQUESTION_DEFAULT, returnArgumentsFn),

    addToSectionQuestionsList:createAction(actionTypes.ADD_TO_SECTIONQUESTIONLIST, returnArgumentsFn),
};
