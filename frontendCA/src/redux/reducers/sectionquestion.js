import {
    handleActions
} from 'redux-actions'
import actionTypes from '../actionTypes'

const defaultState = {

    sectionQuestionList: [],
    totalSectionQuestions:0,
    filteredSectionQuestionRecords:0,
    // add modal postion
    addSectionQuestionTop:false,
    addSectionQuestionEnd:false,
    // save and continue check
    continueSectionQuestion:false,
    individualSectionQues:{},
    // edit
    editSectionQuestion: null,
    // Selection
    selectedSectionQuestionId: [],
    // selectedDataList:[],
    allSectionQuestionSelected:false,

    
}

export default handleActions({
    [actionTypes.SET_SECTIONQUESTION_DEFAULT](state, {}){
        return {
            ...state,
            // read data
            sectionQuestionList: [],
            totalSectionQuestions:0,
            filteredSectionQuestionRecords:0,
            // add modal postion
            addSectionQuestionTop:false,
            addSectionQuestionEnd:false,
            // save and continue check
            continueSectionQuestion:false,
            individualSectionQues:{},
            // edit
            editSectionQuestion: null,
            // Selection
            selectedSectionQuestionId: [],
            // selectedDataList:[],
            allSectionQuestionSelected:false,
                }
    },


    // SECTIONQUESTION LIST MANIPULATION
        [actionTypes.SECTIONQUESTION_LIST_SET](state, {payload}){
            const {sectionQuestionList,totalSectionQuestions,setTotal} = payload;
            var total = 0;
            if (setTotal){
                total = totalSectionQuestions
            }else{
                total = state.totalSectionQuestions
            }

            console.log(sectionQuestionList)
            var selected = false;
            var count = 0;
            sectionQuestionList.map(qs => {
                ((state.selectedSectionQuestionId).indexOf(qs.id) >= 0)  ? count++ : null
            });

            if (count === sectionQuestionList.length){
                selected = true
            }else{
                selected = false
            }
            return {
                ...state,
                sectionQuestionList:sectionQuestionList,
                allSectionQuestionSelected:selected,
                totalSectionQuestions:total,
                filteredSectionQuestionRecords:totalSectionQuestions
            }
        },

        [actionTypes.SET_TOTAL_RECORDS](state, {payload}){
            const {totalSectionQuestions} = payload;
            return {
                ...state,
                totalSectionQuestions:totalSectionQuestions
            }
        },


        [actionTypes.ADD_TO_SECTIONQUESTIONLIST](state, {payload}){
            const {result} = payload;
            return {
                ...state,
                sectionQuestionList:[...state.sectionQuestionList,...result],
                totalSectionQuestions:(state.totalSectionQuestions + result.length),
                filteredSectionQuestionRecords:(state.filteredSectionQuestionRecords + result.length)
            }
        },


        [actionTypes.SECTIONQUESTION_REMOVE](state, {payload}){
            const {dataID} = payload
            var dataList = state.sectionQuestionList;
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
                
                ((state.selectedSectionQuestionId).indexOf(qs.id) >= 0)  ? count++ : null
            });
            if (count === newData.length){
                selected = true
            }else{
                selected = false
            }
    
            return {
                ...state,
                sectionQuestionList:newData,
                allSectionQuestionSelected:selected,
                totalSectionQuestions:(state.totalSectionQuestions - 1),
                filteredSectionQuestionRecords:(state.filteredSectionQuestionRecords - 1)
    
            }
        },


        // ADD SECTIONQUESTION
        [actionTypes.SECTIONQUESTION_ADD_SECTIONQUESTION](state, {payload}){
            const {result,continueSectionQuestion,individualQues} = payload;
            var outputData = []
            console.log(state.addSectionQuestionTop,state.addSectionQuestionEnd,result)
            if (state.addSectionQuestionTop){
                outputData = [ result, ...state.sectionQuestionList]
            }else if(state.addSectionQuestionEnd) {
                outputData = [...state.sectionQuestionList, result]
            }else{
                outputData = [...state.sectionQuestionList, result]
            }
    
    
            if (continueSectionQuestion){
                return {
                    ...state,
                    sectionQuestionList: outputData,
                    continueSectionQuestion:true,
                    individualSectionQues:individualQues,
                    allSectionQuestionSelected:false,
                    totalSectionQuestions:(state.totalSectionQuestions + 1),
                    filteredSectionQuestionRecords:(state.filteredSectionQuestionRecords + 1)
                }
    
            }else{
                return {
                    ...state,
                    sectionQuestionList: outputData,
                    continueSectionQuestion:false,
                    addSectionQuestionTop:false,
                    individualSectionQues:{},
                    addSectionQuestionEnd:false,
                    allSectionQuestionSelected:false,
                    totalSectionQuestions:(state.totalSectionQuestions + 1),
                    filteredSectionQuestionRecords:(state.filteredSectionQuestionRecords + 1)
                }
            }
           
        },
    
        // Edit Quesion
        [actionTypes.SECTIONQUESTION_SET_EDIT_SECTIONQUESTION](state, {payload}){
            const {editSectionQuestion} = payload;
            
            return {
                ...state,
                editSectionQuestion,
                addSectionQuestionTop:false,
                addSectionQuestionEnd:false
    
            }
        },
        [actionTypes.SECTIONQUESTION_SET_EMPTY_EDIT_SECTIONQUESTION](state, {}){
            return {
                ...state,
                editSectionQuestion: null
            }
        },
        [actionTypes.SECTIONQUESTION_EDIT_SECTIONQUESTION](state, {payload}){
            const {result} = payload;
            console.log(result, state.sectionQuestionList)
            const newStateList = state.sectionQuestionList.map((item) => {
                if(item.id === result.id){
                    return result;
                }else{
                    return item;
                }
            });
            

            return {
                ...state,
                sectionQuestionList: newStateList,
                editSectionQuestion: null
            }
        },

        [actionTypes.SECTIONQUESTION_CHANGE_ORDER](state, {payload}){
            const {result} = payload;
            return {
                ...state,
                sectionQuestionList: result,
                editSectionQuestion: null
            }
        },



        // Selection
        [actionTypes.SECTIONQUESTION_SELECT_ADD_SECTIONQUESTION_ID](state, {payload}){
            const {id} = payload
            var selected = false;
            var count = 0;
            state.sectionQuestionList.map(qs => {
                
                ([...state.selectedSectionQuestionId, id].indexOf(qs.id) >= 0)  ? count++ : null
            });
            if (count === state.sectionQuestionList.length){
                selected = true
            }else{
                selected = false
            }
            return {
                ...state,
                selectedSectionQuestionId: [...state.selectedSectionQuestionId, id],
                allSectionQuestionSelected:selected
            }
        },
        [actionTypes.SECTIONQUESTION_SELECT_REMOVE_SECTIONQUESTION_ID](state, {payload}){
            const {id} = payload
            var selected = false;
    
            var count = 0;
            state.sectionQuestionList.map(qs => {
                ([...state.selectedSectionQuestionId.filter(idx => idx !== id)].indexOf(qs.id) >= 0)  ? count++ : null
            });
            if (count === state.sectionQuestionList.length){
                selected = true
            }else{
                selected = false
            }
    
            return {
                ...state,
                selectedSectionQuestionId: [...state.selectedSectionQuestionId.filter(idx => idx !== id)],
                allSectionQuestionSelected:selected
            }
        },
    
        [actionTypes.SECTIONQUESTION_SELECT_REMOVEALL_SECTIONQUESTION_ID](state, {payload}){
            return {
                ...state,
                selectedSectionQuestionId: [],
                allSectionQuestionSelected:false
            }
        },
        [actionTypes.SECTIONQUESTION_SELECT_ALL_SECTIONQUESTION_ID](state, {}){
            var idList = []
            var dataList = []
            state.sectionQuestionList.map(qs => {
                ((state.selectedSectionQuestionId).indexOf(qs.id) >= 0)  ? null : idList.push(qs.id)
            });
    
            return {
                ...state,
                selectedSectionQuestionId: [...state.selectedSectionQuestionId, ...idList],
                allSectionQuestionSelected:true
            }
        },
    
        [actionTypes.SECTIONQUESTION_DESELECT_ALL_SECTIONQUESTION_ID](state, {}){
            var idList = state.selectedSectionQuestionId
    
            var dataList = state.selectedDataList
    
            state.sectionQuestionList.map(qs => {
                ((state.selectedSectionQuestionId).indexOf(qs.id) >= 0)  ? idList.splice((state.selectedSectionQuestionId).indexOf(qs.id), 1 ) : null
            });
    
    
            return {
                ...state,
                selectedSectionQuestionId: [...idList],
                allSectionQuestionSelected:false
            }
        },
    
        [actionTypes.SECTIONQUESTION_MOVE_ALL_SELECTED](state, {payload}){
            return {
                ...state,
                selectedSectionQuestionId: [],
                // selectedDataList: [],
                allSectionQuestionSelected:false,
                totalSectionQuestions:(state.totalSectionQuestions - state.selectedSectionQuestionId.length),
                filteredSectionQuestionRecords:(state.totalSectionQuestions - state.selectedSectionQuestionId.length)
            }
        },
    
    
    
    
        // UI 
        [actionTypes.VIEW_ADD_SECTIONQUESTIONBOX](state, {payload}){
            const {position} = payload
            console.log(position)
            var addSectionQuestionTop = false
            var addSectionQuestionEnd = false
            if(position === "top"){
                addSectionQuestionTop = true
                addSectionQuestionEnd = false
            }else{
                addSectionQuestionTop = false
                addSectionQuestionEnd = true
            }
            return {
                ...state,
                addSectionQuestionTop:addSectionQuestionTop,
                addSectionQuestionEnd:addSectionQuestionEnd,
                continueSectionQuestion:false,
                editSectionQuestion:null,
                individualSectionQues:{}
            }
        },
        
        [actionTypes.HIDE_ADD_SECTIONQUESTIONBOX](state){
        
            return {
                ...state,
                addSectionQuestionTop:false,
                addSectionQuestionEnd:false,
                continueSectionQuestion:false,
                editSectionQuestion:null,
                individualSectionQues:{}
    
    
            }
        },
    

},
 defaultState
)