import {
    createAction
} from 'redux-actions';
import actionTypes from '../actionTypes';

const returnArgumentsFn = function (payload) {
    return Promise.resolve(payload);
};

export default {
    // Data List Manipulation
    
    setSectionList: createAction(actionTypes.SECTION_LIST_SET, returnArgumentsFn),
    removeSection:createAction(actionTypes.SECTION_REMOVE, returnArgumentsFn),
    setTotalSections:createAction(actionTypes.SET_TOTAL_RECORDS, returnArgumentsFn),
    // Add Data
    addSection: createAction(actionTypes.SECTION_ADD_SECTION, returnArgumentsFn),
    // Edit Data
    setEditSection: createAction(actionTypes.SECTION_SET_EDIT_SECTION, returnArgumentsFn),
    setEmptyEditSection: createAction(actionTypes.SECTION_SET_EMPTY_EDIT_SECTION, returnArgumentsFn),
    editSection: createAction(actionTypes.SECTION_EDIT_SECTION, returnArgumentsFn),
    setDefaultSection:createAction(actionTypes.SET_SECTION_DEFAULT, returnArgumentsFn),
    
    changeOrder:createAction(actionTypes.SECTION_CHANGE_ORDER, returnArgumentsFn),
    // UI Variable
    
    viewAddSection:createAction(actionTypes.VIEW_ADD_SECTIONBOX, returnArgumentsFn),
    closeAddSection:createAction(actionTypes.HIDE_ADD_SECTIONBOX, returnArgumentsFn),
    // Select Data
    addSelectedSection: createAction(actionTypes.SECTION_SELECT_ADD_SECTION_ID, returnArgumentsFn),
    removeSelectedSection: createAction(actionTypes.SECTION_SELECT_REMOVE_SECTION_ID, returnArgumentsFn),
    emptySelectedSection: createAction(actionTypes.SECTION_SELECT_REMOVEALL_SECTION_ID, returnArgumentsFn),
    selectAllSection: createAction(actionTypes.SECTION_SELECT_ALL_SECTION_ID, returnArgumentsFn),
    deselectAllSection: createAction(actionTypes.SECTION_DESELECT_ALL_SECTION_ID, returnArgumentsFn),
    emptyMoveSelectedSection: createAction(actionTypes.SECTION_MOVE_ALL_SELECTED, returnArgumentsFn),

};
