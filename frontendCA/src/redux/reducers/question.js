import {
    handleActions
} from 'redux-actions'
import actionTypes from '../actionTypes'

const defaultState = {
    // read data
    questionlist: [],
    totalQuestions:0,
    filteredQuestionRecords:0,
    // add modal postion
    addQuestionTop:false,
    addQuestionEnd:false,
    // save and continue check
    continueQues:false,
    individualQues:{},
    // edit
    editQuestion: null,
    // Selection
    selectedQuestionId: [],
    // selectedDataList:[],
    allQuesSelected:false
}

export default handleActions({
    // QUESTION LIST MANIPULATION
    [actionTypes.SET_QUESTION_DEFAULT](state, {}){
        return {
            ...state,
            // read data
                questionlist: [],
                totalQuestions:0,
                filteredQuestionRecords:0,
                // add modal postion
                addQuestionTop:false,
                addQuestionEnd:false,
                // save and continue check
                continueQues:false,
                individualQues:{},
                // edit
                editQuestion: null,
                // Selection
                selectedQuestionId: [],
                // selectedDataList:[],
                allQuesSelected:false
        }
    },


    [actionTypes.QUESTION_LIST_SET](state, {payload}){
        const {questionlist,totalQuestions,setTotal} = payload;
        var total = 0;
        if (setTotal){
            total = totalQuestions
        }else{
            total = state.totalQuestions
        }
        var selected = false;
        var count = 0;
        questionlist.map(qs => {
            ((state.selectedQuestionId).indexOf(qs.id) >= 0)  ? count++ : null
        });
        if (count === questionlist.length){
            selected = true
        }else{
            selected = false
        }
        return {
            ...state,
            questionlist:questionlist,
            allQuesSelected:selected,
            totalQuestions:total,
            filteredQuestionRecords:totalQuestions
        }
    },
    [actionTypes.SET_TOTAL_RECORDS](state, {payload}){
        const {totalQuestions} = payload;
        return {
            ...state,
            totalQuestions:totalQuestions
        }
    },

    [actionTypes.QUESTION_REMOVE](state, {payload}){
        const {dataID} = payload
        var dataList = state.questionlist;
        const index = dataList.findIndex(x => x.id === dataID);
        let newData = null;
        console.log(index)
        if(index >= 0){
            newData = [...dataList.slice(0, index),
                    ...dataList.slice(index + 1)]
        }else{
            newData = [...dataList]
        }
        
        var selected = false;
        var count = 0;
        newData.map(qs => {
            
            ((state.selectedQuestionId).indexOf(qs.id) >= 0)  ? count++ : null
        });
        if (count === newData.length){
            selected = true
        }else{
            selected = false
        }

        return {
            ...state,
            questionlist:newData,
            allQuesSelected:selected,
            totalQuestions:(state.totalQuestions - 1),
            filteredQuestionRecords:(state.filteredQuestionRecords - 1)

        }
    },
    // ADD QUESTION
    [actionTypes.QUESTION_ADD_QUESTION](state, {payload}){
        const {result,continueQues,individualQues} = payload;
        var outputData = []
        console.log(state.addQuestionTop,state.addQuestionEnd,result)
        if (state.addQuestionTop){
            outputData = [ result, ...state.questionlist]
        }else if(state.addQuestionEnd) {
            outputData = [...state.questionlist, result]
        }else{
            outputData = [...state.questionlist, result]
        }



        if (continueQues){

            return {
                ...state,
                questionlist: outputData,
                continueQues:true,
                individualQues:individualQues,
                allQuesSelected:false,
                totalQuestions:(state.totalQuestions + 1),
                filteredQuestionRecords:(state.filteredQuestionRecords + 1)
            }

        }else{
            return {
                ...state,
                questionlist: outputData,
                continueQues:false,
                individualQues:{},
                addQuestionTop:false,
                addQuestionEnd:false,
                allQuesSelected:false,
                totalQuestions:(state.totalQuestions + 1),
                filteredQuestionRecords:(state.filteredQuestionRecords + 1)
            }
        }
       
    },

    // Edit Quesion
    [actionTypes.QUESTION_SET_EDIT_QUESTION](state, {payload}){
        const {editQuestion} = payload;
        return {
            ...state,
            editQuestion,
            addQuestionTop:false,
            addQuestionEnd:false

        }
    },
    [actionTypes.QUESTION_SET_EMPTY_EDIT_QUESTION](state, {}){
        return {
            ...state,
            // questionlist:state.questionlist,
            editQuestion: null
        }
    },
    [actionTypes.QUESTION_EDIT_QUESTION](state, {payload}){
        const {result} = payload;
        return {
            ...state,
            questionlist: state.questionlist.map(qs => {
                return qs.id === result.id ? result : qs
            }),
            editQuestion: null
        }
    },
    // Selection
    [actionTypes.QUESTION_SELECT_ADD_QUESTION_ID](state, {payload}){
        const {id} = payload
        var selected = false;
        var count = 0;
        state.questionlist.map(qs => {
            
            ([...state.selectedQuestionId, id].indexOf(qs.id) >= 0)  ? count++ : null
        });
        if (count === state.questionlist.length){
            selected = true
        }else{
            selected = false
        }
        return {
            ...state,
            selectedQuestionId: [...state.selectedQuestionId, id],
            // selectedDataList: [...state.selectedDataList, data],
            allQuesSelected:selected
        }
    },
    [actionTypes.QUESTION_SELECT_REMOVE_QUESTION_ID](state, {payload}){
        const {id} = payload
        var selected = false;

        var count = 0;
        state.questionlist.map(qs => {
            ([...state.selectedQuestionId.filter(idx => idx !== id)].indexOf(qs.id) >= 0)  ? count++ : null
        });
        if (count === state.questionlist.length){
            selected = true
        }else{
            selected = false
        }

        return {
            ...state,
            selectedQuestionId: [...state.selectedQuestionId.filter(idx => idx !== id)],
            // selectedDataList: [...state.selectedDataList.filter(idx => idx.id !== id)],
            allQuesSelected:selected
        }
    },

    [actionTypes.QUESTION_SELECT_REMOVEALL_QUESTION_ID](state, {payload}){
        return {
            ...state,
            selectedQuestionId: [],
            // selectedDataList: [],
            allQuesSelected:false
        }
    },
    [actionTypes.QUESTION_SELECT_ALL_QUESTION_ID](state, {}){
        var idList = []
        var dataList = []
        state.questionlist.map(qs => {
            ((state.selectedQuestionId).indexOf(qs.id) >= 0)  ? null : idList.push(qs.id)
        });


        return {
            ...state,
            selectedQuestionId: [...state.selectedQuestionId, ...idList],
            allQuesSelected:true
        }
    },

    [actionTypes.QUESTION_DESELECT_ALL_QUESTION_ID](state, {}){
        var idList = state.selectedQuestionId

        var dataList = state.selectedDataList

        state.questionlist.map(qs => {
            ((state.selectedQuestionId).indexOf(qs.id) >= 0)  ? idList.splice((state.selectedQuestionId).indexOf(qs.id), 1 ) : null
        });

        return {
            ...state,
            selectedQuestionId: [...idList],
            allQuesSelected:false
        }
    },

    [actionTypes.QUESTION_MOVE_ALL_SELECTED](state, {payload}){
        return {
            ...state,
            selectedQuestionId: [],
            allQuesSelected:false,
            totalQuestions:(state.totalQuestions - state.selectedQuestionId.length),
            filteredQuestionRecords:(state.totalQuestions - state.selectedQuestionId.length)
        }
    },


    // UI 
    [actionTypes.VIEW_ADD_QUESTIONBOX](state, {payload}){
        const {position} = payload
        console.log(position)
        var addQuestionTop = false
        var addQuestionEnd = false
        if(position === "top"){
            addQuestionTop = true
            addQuestionEnd = false
        }else{
            addQuestionTop = false
            addQuestionEnd = true
        }
        return {
            ...state,
            addQuestionTop:addQuestionTop,
            addQuestionEnd:addQuestionEnd,
            continueQues:false,
            individualQues:{},
            editQuestion:null
        }
    },
    
    [actionTypes.HIDE_ADD_QUESTIONBOX](state){
    
        return {
            ...state,
            addQuestionTop:false,
            addQuestionEnd:false,
            continueQues:false,
            individualQues:{},
            editQuestion:null


        }
    },

},
 defaultState
)