import {
    handleActions
} from 'redux-actions'
import actionTypes from '../actionTypes'

const defaultState = {
    // read data
    testlist: [],
    totalTests:0,
    filteredTestRecords:0,
    // add modal postion
    addTestTop:false,
    addTestEnd:false,
    // save and continue check
    continueTest:false,
    // edit
    editTest: null,
    // Selection
    selectedTestId: [],
    // selectedDataList:[],
    allTestSelected:false,
    
}

export default handleActions({
    // TEST LIST MANIPULATION
    [actionTypes.SET_TEST_DEFAULT](state, {}){
        return {
            ...state,
            // read data
            testlist: [],
            totalTests:0,
            filteredTestRecords:0,
            // add modal postion
            addTestTop:false,
            addTestEnd:false,
            // save and continue check
            continueTest:false,
            // edit
            editTest: null,
            // Selection
            selectedTestId: [],
            // selectedDataList:[],
            allTestSelected:false,
        }
    },


    [actionTypes.TEST_LIST_SET](state, {payload}){
        const {testlist,totalTests,setTotal} = payload;
        var total = 0;
        
        if (setTotal){
            total = totalTests
        }else{
            total = state.totalTests
        }
        
        var selected = false;
        var count = 0;
        testlist.map(qs => {
            ((state.selectedTestId).indexOf(qs.id) >= 0)  ? count++ : null
        });
        if (count === testlist.length){
            selected = true
        }else{
            selected = false
        }
        
        return {
            ...state,
            testlist:testlist,
            allTestSelected:selected,
            totalTests:total,
            filteredTestRecords:totalTests,
        }
    },

    [actionTypes.TEST_REMOVE](state, {payload}){
        const {dataID} = payload
        var dataList = state.testlist;
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
            
            ((state.selectedTestId).indexOf(qs.id) >= 0)  ? count++ : null
        });
        if (count === newData.length){
            selected = true
        }else{
            selected = false
        }

        return {
            ...state,
            testlist:newData,
            allTestSelected:selected,
            totalTests:(state.totalTests - 1),
            filteredTestRecords:(state.filteredTestRecords - 1)

        }
    },
    // ADD TEST
    [actionTypes.TEST_ADD_TEST](state, {payload}){
        const {result,continueTest} = payload;
        var outputData = []
        console.log(state.addTestTop,state.addTestEnd,result)
        if (state.addTestTop){
            outputData = [ result, ...state.testlist]
        }else if(state.addTestEnd) {
            outputData = [...state.testlist, result]
        }else{
            outputData = [...state.testlist, result]
        }
        
        


        if (continueTest){
            return {
                ...state,
                testlist: outputData,
                continueTest:true,
                allTestSelected:false,
                totalTests:(state.totalTests + 1),
                filteredTestRecords:(state.filteredTestRecords + 1)
            }

        }else{
            return {
                ...state,
                testlist: outputData,
                continueTest:false,
                addTestTop:false,
                addTestEnd:false,
                allTestSelected:false,
                totalTests:(state.totalTests + 1),
                filteredTestRecords:(state.filteredTestRecords + 1)
            }
        }
       
    },

    // Edit Quesion
    [actionTypes.TEST_SET_EDIT_TEST](state, {payload}){
        const {editTest} = payload;
        return {
            ...state,
            editTest,
            addTestTop:false,
            addTestEnd:false

        }
    },
    [actionTypes.TEST_SET_EMPTY_EDIT_TEST](state, {}){
        return {
            ...state,
            editTest: null
        }
    },
    [actionTypes.TEST_EDIT_TEST](state, {payload}){
        const {result} = payload;

            return {
                ...state,
                testlist: state.testlist.map(qs => {
                    return qs.id === result.id ? result : qs
                }),
                editTest: null
    
                }
    },
    // Selection
    [actionTypes.TEST_SELECT_ADD_TEST_ID](state, {payload}){
        const {id} = payload
        var selected = false;
        var count = 0;
        state.testlist.map(qs => {
            
            ([...state.selectedTestId, id].indexOf(qs.id) >= 0)  ? count++ : null
        });
        if (count === state.testlist.length){
            selected = true
        }else{
            selected = false
        }
        return {
            ...state,
            selectedTestId: [...state.selectedTestId, id],
            allTestSelected:selected
        }
    },
    [actionTypes.TEST_SELECT_REMOVE_TEST_ID](state, {payload}){
        const {id} = payload
        var selected = false;

        var count = 0;
        state.testlist.map(qs => {
            ([...state.selectedTestId.filter(idx => idx !== id)].indexOf(qs.id) >= 0)  ? count++ : null
        });
        if (count === state.testlist.length){
            selected = true
        }else{
            selected = false
        }

        return {
            ...state,
            selectedTestId: [...state.selectedTestId.filter(idx => idx !== id)],
            allTestSelected:selected
        }
    },

    [actionTypes.TEST_SELECT_REMOVEALL_TEST_ID](state, {payload}){
        return {
            ...state,
            selectedTestId: [],
            allTestSelected:false
        }
    },
    [actionTypes.TEST_SELECT_ALL_TEST_ID](state, {}){
        var idList = []
        var dataList = []
        state.testlist.map(qs => {
            ((state.selectedTestId).indexOf(qs.id) >= 0)  ? null : idList.push(qs.id)
        });

        return {
            ...state,
            selectedTestId: [...state.selectedTestId, ...idList],
            allTestSelected:true
        }
    },

    [actionTypes.TEST_DESELECT_ALL_TEST_ID](state, {}){
        var idList = state.selectedTestId

        var dataList = state.selectedDataList

        state.testlist.map(qs => {
            ((state.selectedTestId).indexOf(qs.id) >= 0)  ? idList.splice((state.selectedTestId).indexOf(qs.id), 1 ) : null
        });


        return {
            ...state,
            selectedTestId: [...idList],
            allTestSelected:false
        }
    },

    [actionTypes.TEST_MOVE_ALL_SELECTED](state, {payload}){
        return {
            ...state,
            selectedTestId: [],
            // selectedDataList: [],
            allTestSelected:false,
            totalTests:(state.totalTests - state.selectedTestId.length),
            filteredTestRecords:(state.totalTests - state.selectedTestId.length)
        }
    },




    // UI 
    [actionTypes.VIEW_ADD_TESTBOX](state, {payload}){
        const {position} = payload
        console.log(position)
        var addTestTop = false
        var addTestEnd = false
        if(position === "top"){
            addTestTop = true
            addTestEnd = false
        }else{
            addTestTop = false
            addTestEnd = true
        }
        return {
            ...state,
            addTestTop:addTestTop,
            addTestEnd:addTestEnd,
            continueTest:false,
            editTest:null
        }
    },
    
    [actionTypes.HIDE_ADD_TESTBOX](state){
    
        return {
            ...state,
            addTestTop:false,
            addTestEnd:false,
            continueTest:false,
            editTest:null


        }
    },
},
 defaultState
)