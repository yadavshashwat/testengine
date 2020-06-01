import {
    handleActions
} from 'redux-actions';
import actionTypes from '../actionTypes';

const defaultState = {
    userFirstName:'',
    userLastName:'',
    userEmail:'',
    userAuthToken:'',
    userIsStaff:false,
    userRole:'user',
    userCourses:[],
    loggedIn:false,
    userId:''
}

export default handleActions({
    [actionTypes.LOGIN_USER](state, {payload}){
        // debugger;
        const {auth,
            auth_token,
            email,
            first_name,
            id,
            is_staff,
            last_name,
            user_role} = payload
 
        return {
            ...state,
            userFirstName:first_name,
            userLastName:last_name,
            userEmail:email,
            userAuthToken:auth_token,
            userIsStaff:is_staff,
            userRole:user_role,
            userCourses:[],
            loggedIn:auth,
            userId:id
        }
    },

    [actionTypes.LOGOUT_USER](state, {}){
        // debugger;
        return {
            ...state,
            userFirstName:'',
            userLastName:'',
            userEmail:'',
            userAuthToken:'',
            userIsStaff:false,
            userRole:'user',
            userCourses:[],
            loggedIn:false,
            userId:''
        }
    },

},
 defaultState
)

