import {
    handleActions
} from 'redux-actions'
import actionTypes from '../actionTypes'

const defaultState = {

    sectionlist: [],
    totalSections:0,
    filteredSectionRecords:0,
    // add modal postion
    addSectionTop:false,
    addSectionEnd:false,
    // save and continue check
    continueSection:false,
    // edit
    editSection: null,
    // Selection
    selectedSectionId: [],
    // selectedDataList:[],
    allSectionSelected:false,

    
}

export default handleActions({
    [actionTypes.SET_SECTION_DEFAULT](state, {}){
        return {
            ...state,
            // read data
            sectionlist: [],
            totalSections:0,
            filteredSectionRecords:0,
            // add modal postion
            addSectionTop:false,
            addSectionEnd:false,
            // save and continue check
            continueSection:false,
            // edit
            editSection: null,
            // Selection
            selectedSectionId: [],
            // selectedDataList:[],
            allSectionSelected:false,
        }
    },

        [actionTypes.SECTION_LIST_SET](state, {payload}){
            const {sectionlist,totalSections,setTotal} = payload;
            var total = 0;
            if (setTotal){
                total = totalSections
            }else{
                total = state.totalSections
            }

            console.log(sectionlist)
            var selected = false;
            var count = 0;
            sectionlist.map(qs => {
                ((state.selectedSectionId).indexOf(qs.id) >= 0)  ? count++ : null
            });

            if (count === sectionlist.length){
                selected = true
            }else{
                selected = false
            }
            return {
                ...state,
                sectionlist:sectionlist,
                allSectionSelected:selected,
                totalSections:total,
                filteredSectionRecords:totalSections
            }
        },

        [actionTypes.SET_TOTAL_RECORDS](state, {payload}){
            const {totalSections} = payload;
            return {
                ...state,
                totalSections:totalSections
            }
        },
     
        [actionTypes.SECTION_REMOVE](state, {payload}){
            const {dataID} = payload
            var dataList = state.sectionlist;
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
                
                ((state.selectedSectionId).indexOf(qs.id) >= 0)  ? count++ : null
            });
            if (count === newData.length){
                selected = true
            }else{
                selected = false
            }
    
            return {
                ...state,
                sectionlist:newData,
                allSectionSelected:selected,
                totalSections:(state.totalSections - 1),
                filteredSectionRecords:(state.filteredSectionRecords - 1)
    
            }
        },


        // ADD SECTION
        [actionTypes.SECTION_ADD_SECTION](state, {payload}){
            const {result,continueSection} = payload;
            var outputData = []
            console.log(state.addSectionTop,state.addSectionEnd,result)
            if (state.addSectionTop){
                outputData = [ result, ...state.sectionlist]
            }else if(state.addSectionEnd) {
                outputData = [...state.sectionlist, result]
            }else{
                outputData = [...state.sectionlist, result]
            }
    
    
    
            if (continueSection){
                return {
                    ...state,
                    sectionlist: outputData,
                    continueSection:true,
                    allSectionSelected:false,
                    totalSections:(state.totalSections + 1),
                    filteredSectionRecords:(state.filteredSectionRecords + 1)
                }
    
            }else{
                return {
                    ...state,
                    sectionlist: outputData,
                    continueSection:false,
                    addSectionTop:false,
                    addSectionEnd:false,
                    allSectionSelected:false,
                    totalSections:(state.totalSections + 1),
                    filteredSectionRecords:(state.filteredSectionRecords + 1)
                }
            }
           
        },
    
        // Edit Quesion
        [actionTypes.SECTION_SET_EDIT_SECTION](state, {payload}){
            const {editSection} = payload;
            
            return {
                ...state,
                editSection,
                addSectionTop:false,
                addSectionEnd:false
    
            }
        },
        [actionTypes.SECTION_SET_EMPTY_EDIT_SECTION](state, {}){
            return {
                ...state,
                editSection: null
            }
        },
        [actionTypes.SECTION_EDIT_SECTION](state, {payload}){
            const {result} = payload;
            console.log(result, state.sectionlist)
            const newStateList = state.sectionlist.map((item) => {
                if(item.id === result.id){
                    return result;
                }else{
                    return item;
                }
            });
            

            return {
                ...state,
                sectionlist: newStateList,
                editSection: null
            }
        },

        [actionTypes.SECTION_CHANGE_ORDER](state, {payload}){
            const {result} = payload;
            return {
                ...state,
                sectionlist: result,
                editSection: null
            }
        },



        // Selection
        [actionTypes.SECTION_SELECT_ADD_SECTION_ID](state, {payload}){
            const {id} = payload
            var selected = false;
            var count = 0;
            state.sectionlist.map(qs => {
                
                ([...state.selectedSectionId, id].indexOf(qs.id) >= 0)  ? count++ : null
            });
            if (count === state.sectionlist.length){
                selected = true
            }else{
                selected = false
            }
            return {
                ...state,
                selectedSectionId: [...state.selectedSectionId, id],
                allSectionSelected:selected
            }
        },
        [actionTypes.SECTION_SELECT_REMOVE_SECTION_ID](state, {payload}){
            const {id} = payload
            var selected = false;
    
            var count = 0;
            state.sectionlist.map(qs => {
                ([...state.selectedSectionId.filter(idx => idx !== id)].indexOf(qs.id) >= 0)  ? count++ : null
            });
            if (count === state.sectionlist.length){
                selected = true
            }else{
                selected = false
            }
    
            return {
                ...state,
                selectedSectionId: [...state.selectedSectionId.filter(idx => idx !== id)],
                allSectionSelected:selected
            }
        },
    
        [actionTypes.SECTION_SELECT_REMOVEALL_SECTION_ID](state, {payload}){
            return {
                ...state,
                selectedSectionId: [],
                allSectionSelected:false
            }
        },
        [actionTypes.SECTION_SELECT_ALL_SECTION_ID](state, {}){
            var idList = []
            var dataList = []
            state.sectionlist.map(qs => {
                ((state.selectedSectionId).indexOf(qs.id) >= 0)  ? null : idList.push(qs.id)
            });
    
            return {
                ...state,
                selectedSectionId: [...state.selectedSectionId, ...idList],
                allSectionSelected:true
            }
        },
    
        [actionTypes.SECTION_DESELECT_ALL_SECTION_ID](state, {}){
            var idList = state.selectedSectionId
    
            var dataList = state.selectedDataList
    
            state.sectionlist.map(qs => {
                ((state.selectedSectionId).indexOf(qs.id) >= 0)  ? idList.splice((state.selectedSectionId).indexOf(qs.id), 1 ) : null
            });
    
    
            return {
                ...state,
                selectedSectionId: [...idList],
                allSectionSelected:false
            }
        },
    
        [actionTypes.SECTION_MOVE_ALL_SELECTED](state, {payload}){
            return {
                ...state,
                selectedSectionId: [],
                // selectedDataList: [],
                allSectionSelected:false,
                totalSections:(state.totalSections - state.selectedSectionId.length),
                filteredSectionRecords:(state.totalSections - state.selectedSectionId.length)
            }
        },
    
    
    
    
        // UI 
        [actionTypes.VIEW_ADD_SECTIONBOX](state, {payload}){
            const {position} = payload
            console.log(position)
            var addSectionTop = false
            var addSectionEnd = false
            if(position === "top"){
                addSectionTop = true
                addSectionEnd = false
            }else{
                addSectionTop = false
                addSectionEnd = true
            }
            return {
                ...state,
                addSectionTop:addSectionTop,
                addSectionEnd:addSectionEnd,
                continueSection:false,
                editSection:null
            }
        },
        
        [actionTypes.HIDE_ADD_SECTIONBOX](state){
        
            return {
                ...state,
                addSectionTop:false,
                addSectionEnd:false,
                continueSection:false,
                editSection:null
    
    
            }
        },
    

},
 defaultState
)