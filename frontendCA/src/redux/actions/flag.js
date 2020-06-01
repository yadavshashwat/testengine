import {
    createAction
} from 'redux-actions';
import actionTypes from '../actionTypes';

const returnArgumentsFn = function (payload) {
    return Promise.resolve(payload);
};

export default {
    addFlag: createAction(actionTypes.FLAG_ADD, returnArgumentsFn),
    dismissFlag: createAction(actionTypes.FLAG_DISMISS, returnArgumentsFn),
};
