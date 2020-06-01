import {
    createAction
} from 'redux-actions';
import actionTypes from '../actionTypes';

const returnArgumentsFn = function (payload) {
    return Promise.resolve(payload);
};

export default {
    loginUser: createAction(actionTypes.LOGIN_USER, returnArgumentsFn),
    logoutUser: createAction(actionTypes.LOGOUT_USER, returnArgumentsFn),
};
