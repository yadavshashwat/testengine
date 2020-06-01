import {
    handleActions
} from 'redux-actions'
import actionTypes from '../actionTypes'

const defaultState = {
    // read data
        // coursetestlist: [],
    overalltests:[],
    sectionaltests:[],
    topicwisetests:[],
    totalCourseTests:0,
    filteredCourseTestRecords:0,
    // set
    individualCourseTest: null ,
    individualCourseSection:[],
    activeSection:null,
    activeQuestion:null,
    activeQuestionList:[],
    timerState:true,
    loaded:false

}

export default handleActions({
    // TEST LIST MANIPULATION
    [actionTypes.SET_COURSETEST_DEFAULT](state, {}){
        return {
            ...state,
            // read data
            overalltests:[],
            sectionaltests:[],
            topicwisetests:[],
            totalCourseTests:0,
            filteredCourseTestRecords:0,
            // set
            individualCourseTest: null,
            individualCourseSection:[],
            activeSection:null,
            activeQuestion:null,
            activeQuestionList:[],
            loaded:false
        }
    },


    [actionTypes.COURSETEST_LIST_SET](state, {payload}){
        const {coursetestlist,totalCourseTests,setTotal} = payload;
        var overalltests = coursetestlist.filter(row => row.category.category === "overall")
        var sectionaltests = coursetestlist.filter(row => row.category.category === "sectional")
        var topicwisetests = coursetestlist.filter(row => row.category.category === "topicwise")
        // console.log(overalltests)
        // console.log(sectionaltests)
        // console.log(topicwisetests)
        // console.log(coursetestlist)
        var total = 0;
        if (setTotal){
            total = totalCourseTests
        }else{
            total = state.totalCourseTests
        }
                
        return {
            ...state,
            overalltests:overalltests,
            sectionaltests:sectionaltests,
            topicwisetests:topicwisetests,
            // coursetestlist:coursetestlist,
            totalCourseTests:total,
            filteredCourseTestRecords:totalCourseTests,
        }
    },

    [actionTypes.COURSETEST_EDIT_COURSETEST](state, {payload}){
        const {result} = payload;
        console.log(result.category)
        if (result.category.category == "overall"){
            return {
                ...state,
                overalltests: state.overalltests.map(qs => {
                    return qs.id === result.id ? result : qs
                }),
    
                }            
        }else if (result.category.category == "sectional"){
            return {
                ...state,
                sectionaltests: state.sectionaltests.map(qs => {
                    return qs.id === result.id ? result : qs
                })
    
                }   
        }else if (result.category.category == "topicwise"){
            return {
                ...state,
                topicwisetests: state.topicwisetests.map(qs => {
                    return qs.id === result.id ? result : qs
                })
    
                }   
        }else{
            return {
                ...state
            }
        }

    },


    [actionTypes.COURSETEST_REMOVE](state, {payload}){
        const {dataID,testType} = payload
        var dataList = []
        if (testType === "overall"){
            dataList = state.overalltests;
        }else if (testType === "sectional"){
            dataList = state.sectionaltests;
        }else if (testType === "topicwise"){
            dataList = state.topicwisetests;
        }else{
            dataList = []
        }

        const index = dataList.findIndex(x => x.id === dataID);
        let newData = null;
        console.log(index)
        if(index >= 0){
            newData = [...dataList.slice(0, index),
                    ...dataList.slice(index + 1)]
        }else{
            newData = [...dataList]
        }
        if (testType === "overall"){
            return {
                ...state,
                overalltests:newData,
                totalCourseTests:(state.totalCourseTests - 1),
                filteredCourseTestRecords:(state.filteredCourseTestRecords - 1)
                }        
        }else if (testType === "sectional"){
            return {
                ...state,
                sectionaltests:newData,
                totalCourseTests:(state.totalCourseTests - 1),
                filteredCourseTestRecords:(state.filteredCourseTestRecords - 1)
                }   
        }else if (testType === "topicwise"){
            return {
                ...state,
                topicwisetests:newData,
                totalCourseTests:(state.totalCourseTests - 1),
                filteredCourseTestRecords:(state.filteredCourseTestRecords - 1)
                }   
        }else{
            return {
                ...state,
                }
        }


    },
    // ADD TEST
    [actionTypes.COURSETEST_ADD_COURSETEST](state, {payload}){
        const {result} = payload;
        
        var overalltestsresult = result.filter(row => row.category.category === "overall")
        var sectionaltestsresult = result.filter(row => row.category.category === "sectional")
        var topicwisetestsresult = result.filter(row => row.category.category === "topicwise")
        console.log(result, overalltestsresult, sectionaltestsresult, topicwisetestsresult)

        var outputOverallData =  [...state.overalltests, ...overalltestsresult]
        var outputSectionalData =  [...state.sectionaltests, ...sectionaltestsresult]
        var outputTopicwiseData =  [...state.topicwisetests, ...topicwisetestsresult]
        console.log(outputOverallData,outputSectionalData,outputTopicwiseData)
        return {
            ...state,
            overalltests: outputOverallData,
            sectionaltests: outputSectionalData,
            topicwisetests: outputTopicwiseData,
            totalCourseTests:(state.totalCourseTests + 1),
            filteredCourseTestRecords:(state.filteredCourseTestRecords + 1)
        }

       
    },
        // Edit Quesion
    [actionTypes.COURSETEST_SET_COURSETEST](state, {payload}){
        const {individualCourseTest,individualCourseSection,activeQuestion,activeSection} = payload;
        // console.log(activeQuestion,activeSection)
        return {
            ...state,
            individualCourseTest,
            individualCourseSection,
            activeSection,
            activeQuestion,
            loaded:true
        }
    },

    [actionTypes.COURSETEST_UPDATE_COURSETEST](state, {payload}){
        const {prevSection,nextSection,prevQuestion,nextQuestion,test} = payload;
        var sectionList = []
        var questionList = []
        var section = {}
        
            sectionList = state.individualCourseSection.map((row) => {
            questionList = row.questions;
                if (prevQuestion){
                    questionList = questionList.map((question) => {
                        return question.id == prevQuestion.id ? prevQuestion : question
                    });
                }
                if (nextQuestion){
                    questionList = questionList.map((question) => {
                        return question.id == nextQuestion.id ? nextQuestion : question
                    });
                }
            
            if (prevSection){
                section = (row.id == prevSection.id ? prevSection : row)
                section['questions'] = questionList
            }

            if (nextSection){
                section = (row.id == nextSection.id ? nextSection : row)
                section['questions'] = questionList

            }
            return section
        })
        return {
            ...state,
            individualCourseTest: test,
            individualCourseSection : sectionList,
            activeSection:nextSection,
            activeQuestion:nextQuestion,
            timerState:true,
            // loaded:true
        }
    },


    [actionTypes.UPDATE_COURSETEST_QUESTION](state, {payload}){
        const {dataID} = payload;
        var questionList = []
        var section = {}
        var sectionList = []
        
            sectionList = state.individualCourseSection.map((row) => {
            questionList = row.questions;
                
            questionList = questionList.map((question) => {
                if (question.id == dataID){
                    question['is_marked'] = !question['is_marked']
                    return question
                }else{
                    return question
                }
                
            });
        
        
            row['questions'] = questionList

            return row
        })
        return {
            ...state,
            individualCourseSection : sectionList,
            // loaded:true
        }
    },



    [actionTypes.UPDATE_COURSETEST_RESPONSE](state, {payload}){
        const {response} = payload;
        // console.log(activeQuestion,activeSection)
        var question = state.activeQuestion;
        question.response = {'answer':response}
        return {
            ...state,
            activeQuestion : question,
            // loaded:true
        }
    },
    [actionTypes.UPDATE_COURSETEST_TIMER](state, {payload}){
        const {timer} = payload;
        return {
            ...state,
            timerState : timer
        }
    },
    [actionTypes.UPDATE_COURSETEST_LOADED](state, {payload}){
        const {loaded} = payload;
        return {
            ...state,
            loaded : loaded
        }
    },


},
 defaultState
)