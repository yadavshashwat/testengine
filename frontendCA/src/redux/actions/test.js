import {
    createAction
} from 'redux-actions';
import actionTypes from '../actionTypes';

const returnArgumentsFn = function (payload) {
    return Promise.resolve(payload);
};

export default {
    // Data List Manipulation
    setTestList: createAction(actionTypes.TEST_LIST_SET, returnArgumentsFn),
    removeTest:createAction(actionTypes.TEST_REMOVE, returnArgumentsFn),
    // Add Data
    addTest: createAction(actionTypes.TEST_ADD_TEST, returnArgumentsFn),
    // Edit Data
    setEditTest: createAction(actionTypes.TEST_SET_EDIT_TEST, returnArgumentsFn),
    setEmptyEditTest: createAction(actionTypes.TEST_SET_EMPTY_EDIT_TEST, returnArgumentsFn),
    editTest: createAction(actionTypes.TEST_EDIT_TEST, returnArgumentsFn),
    // UI Variable
    viewAddTest:createAction(actionTypes.VIEW_ADD_TESTBOX, returnArgumentsFn),
    closeAddTest:createAction(actionTypes.HIDE_ADD_TESTBOX, returnArgumentsFn),
    // Select Data
    addSelectedTest: createAction(actionTypes.TEST_SELECT_ADD_TEST_ID, returnArgumentsFn),
    removeSelectedTest: createAction(actionTypes.TEST_SELECT_REMOVE_TEST_ID, returnArgumentsFn),
    emptySelectedTest: createAction(actionTypes.TEST_SELECT_REMOVEALL_TEST_ID, returnArgumentsFn),
    selectAllTest: createAction(actionTypes.TEST_SELECT_ALL_TEST_ID, returnArgumentsFn),
    deselectAllTest: createAction(actionTypes.TEST_DESELECT_ALL_TEST_ID, returnArgumentsFn),
    emptyMoveSelectedTest: createAction(actionTypes.TEST_MOVE_ALL_SELECTED, returnArgumentsFn),

    setDefaultTest:createAction(actionTypes.SET_TEST_DEFAULT, returnArgumentsFn),

};
