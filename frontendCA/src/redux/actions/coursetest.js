import {
    createAction
} from 'redux-actions';
import actionTypes from '../actionTypes';

const returnArgumentsFn = function (payload) {
    return Promise.resolve(payload);
};

export default {
    // Data List Manipulation
    setCourseTestList: createAction(actionTypes.COURSETEST_LIST_SET, returnArgumentsFn),
    removeCourseTest:createAction(actionTypes.COURSETEST_REMOVE, returnArgumentsFn),
    // Add Data
    addCourseTest: createAction(actionTypes.COURSETEST_ADD_COURSETEST, returnArgumentsFn),
    editCourseTest: createAction(actionTypes.COURSETEST_EDIT_COURSETEST, returnArgumentsFn),
    // Set Data
    setCourseTest: createAction(actionTypes.COURSETEST_SET_COURSETEST, returnArgumentsFn),
    updateCourseTest: createAction(actionTypes.COURSETEST_UPDATE_COURSETEST, returnArgumentsFn),
    // Select Data
    setDefaultCourseTest:createAction(actionTypes.SET_COURSETEST_DEFAULT, returnArgumentsFn),
    updateCourseTestResponse:createAction(actionTypes.UPDATE_COURSETEST_RESPONSE, returnArgumentsFn),
    timerRefresh:createAction(actionTypes.UPDATE_COURSETEST_TIMER, returnArgumentsFn),
    updateCourseTestQuestion:createAction(actionTypes.UPDATE_COURSETEST_QUESTION, returnArgumentsFn),
    setCourseTestLoaded:createAction(actionTypes.UPDATE_COURSETEST_LOADED, returnArgumentsFn),
};
