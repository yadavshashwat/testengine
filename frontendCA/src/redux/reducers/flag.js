import {
    handleActions
} from 'redux-actions';
import actionTypes from '../actionTypes';

const defaultState = {
    flagsList:[]
}

export default handleActions({
    [actionTypes.FLAG_ADD](state, {payload}){
        // debugger;
        const {message,appearance} = payload
        const flag = {'message':message,'appearance':appearance}
        // const flagsList = state.flagsList.slice();
        const newFlagList = [flag, ...state.flagsList]
        //state.flagsList.push(flag);
        return {
            ...state,
            flagsList: newFlagList
        }
    },

    [actionTypes.FLAG_DISMISS](state){
        const newFlagList = [...state.flagsList.pop()]
        return {
            ...state,
            flagsList:newFlagList
        }
    },
},
 defaultState
)

