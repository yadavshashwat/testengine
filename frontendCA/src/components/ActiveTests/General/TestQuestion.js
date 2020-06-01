// React
import React, { Component } from 'react';
import PropTypes from "prop-types";
// Styles
import "../../../css/dashboard.css"
// Backend Connection
import { api } from "../../../helpers/api.js";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../../../redux/actions/flag";
import coursetest from "../../../redux/actions/coursetest";
// Atlaskit Packages
import TextField from '@atlaskit/textfield';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
//Icons
import PageIcon from '@atlaskit/icon/glyph/page';
import EditorPanelIcon from '@atlaskit/icon/glyph/editor/panel';
import BillingFilledIcon from '@atlaskit/icon/glyph/billing-filled';
// Components
import GeneralInstructions from "../General/Instructions"
import EditorQuestion from "../../Editors/EditorInstructions";
// Other Packages
import styled from "styled-components";
import {
  Checkbox,
} from '@atlaskit/checkbox';
import EmojiFlagsIcon from '@atlaskit/icon/glyph/emoji/flags';
import FlagFilledIcon from '@atlaskit/icon/glyph/flag-filled';

import Parser from "html-react-parser";
import Timer from "react-compound-timer";
var changeCase = require("change-case");


const emptyWordNumberEssayMCQSingle = {
  'answer':''
}

const  emptyMCQMultiple = {
  'answer':[]
}

// api url path
// var url_start = "/usertest/start_continue/";
var url_test_update = "/usertest/update/";
var url_test_submit = "/usertest/complete_reevaluate/"
const checkboxTheme = {
    backgroundColor:'#fff', 
    borderColor:'#0847A6', 
    uncheckedBorderColor:'#243859', 
    tickColor:'#0847A6'     
  }

function toLetters(num) {
  var mod = num % 26,
      pow = num / 26 | 0,
      out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? toLetters(pow) + out : out;
}

const ModalPadding = styled.div`
  overflow: "hidden";
  height:"100%";
`;



class TestQuestion extends Component {
  constructor(props) {
    super(props);

  //   if (this.props.individualCourseTest.time_calculation == "overall"){
  //     this.state = {
  //       isPaused : false,
  //       currentTime:0,
  //       isCalculatorShow:false,
  //       response: this.props.activeQuestion.response ? this.props.activeQuestion.response : ((['mcq_single','word','number','essay'].indexOf(this.props.activeQuestion.question_type.value) >= 0 ) ? emptyWordNumberEssayMCQSingle : emptyMCQMultiple)     ,
  //       html:'',
  //       initialTime : this.props.individualCourseTest.timer_type ==  "remaining" ? ((this.props.individualCourseTest.total_time - this.props.individualCourseTest.time_elapsed) * 1000) : this.props.individualCourseTest.time_elapsed * 1000,
  //       endTime : (this.props.individualCourseTest.timer_type ==  "remaining" ? 0 : this.props.individualCourseTest.total_time * 1000)
  //     };
  //     // console.log('overall',initialTime,endTime)

  // }else if (this.props.individualCourseTest.time_calculation == "sectional"){
  //   this.state = {
  //     isPaused : false,
  //     currentTime:0,
  //     isCalculatorShow:false,
  //     response: this.props.activeQuestion.response ? this.props.activeQuestion.response : ((['mcq_single','word','number','essay'].indexOf(this.props.activeQuestion.question_type.value) >= 0 ) ? emptyWordNumberEssayMCQSingle : emptyMCQMultiple)     ,
  //     html:'',
  //     initialTime : this.props.individualCourseTest.timer_type ==  "remaining" ? ((this.props.activeSection.section_time - this.props.activeSection.time_elapsed) * 1000) : this.props.activeSection.time_elapsed * 1000       ,
  //     endTime : (this.props.individualCourseTest.timer_type ==  "remaining" ? 0 : this.props.activeSection.section_time * 1000)
  //   };

  // }else{
  //   this.state = {
  //     isPaused : false,
  //     currentTime:0,
  //     isCalculatorShow:false,
  //     response: this.props.activeQuestion.response ? this.props.activeQuestion.response : ((['mcq_single','word','number','essay'].indexOf(this.props.activeQuestion.question_type.value) >= 0 ) ? emptyWordNumberEssayMCQSingle : emptyMCQMultiple)     ,
  //     html:'',
  //     initialTime : this.props.individualCourseTest.time_elapsed * 1000,
  //     endTime : 0
  //   };

  // }

    this.state = {
        isPaused : false,
        currentTime:0,
        isCalculatorShow:false,
        response: this.props.activeQuestion.response ? this.props.activeQuestion.response : ((['mcq_single','word','number','essay'].indexOf(this.props.activeQuestion.question_type.value) >= 0 ) ? emptyWordNumberEssayMCQSingle : emptyMCQMultiple)     ,
        html:'',
        timerUpdate:true,
        isSectionSubmitConfirm:false,
        isSectionMarkSubmitConfirm:false,
        instructionOpen:false,
        questionPaperOpen:false,
        isTestSubmitConfirm:false,
        isTestMarkSubmitConfirm:false,
        loaded:true,
        markedForReview:false
        
    };
    this.defaultState = this.state;
  }

  handleQuestionPaperOpen = () => {
    this.setState({
      questionPaperOpen:true
    })
  }

  handleQuestionPaperClose = () => {
    this.setState({
      questionPaperOpen:false
    })
  }


  handleInstructionOpen = () => {
    this.setState({
      instructionOpen:true
    })
  }

  handleInstructionClose = () => {
    this.setState({
      instructionOpen:false
    })
  }

  handleSectionSubmitClose = () =>{
    this.setState({
      isSectionSubmitConfirm:false
    })
  }

  handleSectionMarkSubmitClose = () =>{
    this.setState({
      isSectionMarkSubmitConfirm:false
    })
  }

  handleSectionSubmitOpen = () =>{
    this.setState({
      isSectionSubmitConfirm:true
    })
  }

  handleSectionMarkSubmitOpen = () =>{
    this.setState({
      isSectionMarkSubmitConfirm:true
    })
  }

  handleTestSubmitClose = () =>{
    this.setState({
      isTestSubmitConfirm:false
    })
  }

  handleTestMarkSubmitClose = () =>{
    this.setState({
      isTestMarkSubmitConfirm:false
    })
  }

  handleTestSubmitOpen = () =>{
    this.setState({
      isTestSubmitConfirm:true
    })
  }

  handleTestMarkSubmitOpen = () =>{
    this.setState({
      isTestMarkSubmitConfirm:true
    })
  }

  handlePageBack = () => {
    this.setState({
      instructionPage: this.state.instructionPage - 1
    })
  }

  handlePageNext = () => {
    this.setState({
      instructionPage: this.state.instructionPage + 1
    })
  }




handleTestPause = () =>{
  this.setState({
    isPaused:true
  })
}

handleTestPlay = () =>{
  this.setState({
    isPaused:false
  })
}

calculatorClose = () => {
  this.setState({
    isCalculatorShow:false
  })
}

calculatorOpen = () => {
  this.setState({
    isCalculatorShow:true
  })
}


// Different Question Type Rendering

onMCQRadioChange = (event) => {
  const data = event.target.value;
  var answer = String(data)

  this.setState({
    response: {'answer':data}
  })
}

onMCQCheckboxChange = (event) => {
  const data = event.target.value
  var answer = String(data)
  if (this.state.response.answer.indexOf(answer) < 0){
      var newAnswers = this.state.response.answer
      newAnswers.push(answer)
      newAnswers.sort()
      this.setState({
          response: { 'answer': newAnswers }
      })
  }else{
      var correctAnswer = this.state.response.answer
      correctAnswer = correctAnswer.filter(item => item !== answer)
      this.setState({
        response: {'answer':correctAnswer}
      })
  }
};

handleChooseOrderChange = event => {
  var data = event.target.value
  const dataId = event.currentTarget.dataset.id;
  console.log(data,dataId)
  data = Math.floor(data);
  var oldData = []
  var newData = []
  if (data >= 0 && data <= this.props.activeQuestion.answer_options.options.length){
    if(this.state.response.answer.length == this.props.activeQuestion.answer_options.options.length ){
      oldData = this.state.response.answer
      oldData[dataId - 1] = data   
      this.setState({
        response:{'answer':oldData}
      })
    }else{
      newData = [...Array(this.props.activeQuestion.answer_options.options.length)].map((row, key) => {
        return "";
      });
      newData[dataId - 1 ] = data;
      this.setState({
        response:{'answer':newData}
      })
    }  
  }
  
}

handleEssayChange = (html) => {
  this.setState({
      html: html
  });
}



handleTextNumberAnswerChange = event => {
  const answer = String(event.target.value)
  this.setState({
      response:{'answer':answer}
  })
}



totalTimeElapsed = () => {

    const testNew = this.props.individualCourseTest;
    const sectionNew = this.props.activeSection;
    const timerDiv = document.getElementById('time-timer-value');
    const timeValue = parseFloat(timerDiv.getAttribute('time')/1000);
    var timeElapsed = 0
    var initialTime = null
    
    if (testNew.time_calculation == "overall"){
      initialTime = testNew.timer_type ==  "remaining" ? ((parseFloat(testNew.total_time) - parseFloat(testNew.time_elapsed))) : testNew.time_elapsed
      timeElapsed = Math.abs(timeValue - initialTime);  
    }else if (testNew.time_calculation == "sectional"){
      initialTime = testNew.timer_type ==  "remaining" ? ((parseFloat(sectionNew.section_time) - parseFloat(sectionNew.time_elapsed))) : sectionNew.time_elapsed       
      timeElapsed = Math.abs(timeValue - initialTime);  
      // console.log(initialTime,endTime)
  }else{
    initialTime = parseFloat(testNew.time_elapsed * 1000);
    timeElapsed = Math.abs(timeValue - initialTime);  
  }
  return timeElapsed
}


handleClearResponse = () => {
  var curr_question_id = this.props.activeQuestion.id;
  var curr_section_id = this.props.activeSection.id;
  var next_section_id = this.props.activeSection.id;
  var next_question_id = this.props.activeQuestion.id;

  
  api(url_test_update, { 
          test_id:this.props.individualCourseTest.id, 
          section_id:this.props.activeSection.id,
          next_section_id:next_section_id,
          question_id:curr_question_id,
          next_question_id:next_question_id,
          time_elapsed:this.totalTimeElapsed(),
          is_marked:this.props.activeQuestion.is_marked ? "1" : "0",
          response:JSON.stringify({})
        }).then(response => {
    const { result, status, error } = response;
    if (!error){
      if (status) {
        this.props.actions.updateCourseTest({
          test:result['test'],
          prevSection:result['prev_section'],
          nextSection:result['next_section'],
          prevQuestion:result['prev_question'],
          nextQuestion:result['next_question'],
        })

        if (result['next_question']){
          if (result['next_question'].response){

            if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:result['next_question'].response.answer
              })  
            }else{
              this.setState({
                response:result['next_question'].response,
                html:''
              })
  
            }
          }else{
            if(['mcq_single','word','number'].indexOf(result['next_question'].question_type.value) >= 0 ){
              // console.log('here 2')
              this.setState({
                response: {'answer':''}
              })  
            }else if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:''
              })  
            }else{
              console.log('here 2')
              this.setState({
                response: {'answer':[]}
              })
            }
          }
        }
      }
    }
  });
}


handleAutoSubmitTest = () => {
  // console.log('here')
  var curr_question_id = this.props.activeQuestion.id;
  var curr_section_id = this.props.activeSection.id;
  var response = JSON.stringify({});

  var sections = this.props.individualCourseSection
  var test = this.props.individualCourseTest

  // if (this.props.individualCourseTest.time_calculation == "overall"){
  //   next_section_id = '',
  //   next_question_id = ''
  // }
  
  // if (this.props.activeQuestion.question_type.value == "essay"){
  //    response = JSON.stringify({'answer':this.state.html})
  // }else{
  //    response = JSON.stringify(this.state.response)
  // }



  if (test.time_calculation == "overall" || this.props.activeSection.id == sections[sections.length - 1 ].id){
    this.props.actions.setCourseTestLoaded({
      loaded:false
    })  
    this.handleSave();
    api(url_test_submit, {
      test_id: this.props.individualCourseTest.id,
      to_evaluate: "1"
    }).then(response => {
      const {
        result,
        status,
        error
      } = response;
      if (!error) {
        if (status) {            
          this.props.actions.setCourseTest({
            individualCourseTest: result['test'],
            individualCourseSection: result['sections'],
            activeSection: null,
            activeQuestion: null
          })
        }
      }
    }); 
  }else{

    this.handleSubmitSection();
  }

};


handleSubmitTest = () => {
    var curr_question_id = this.props.activeQuestion.id;
    var curr_section_id = this.props.activeSection.id;
    var response = null;
    if (this.props.activeQuestion.question_type.value == "essay"){
       response = JSON.stringify({'answer':this.state.html})
    }else{
       response = JSON.stringify(this.state.response)
    }
  
    this.props.actions.setCourseTestLoaded({
      loaded:false
    })

    api(url_test_update, {
      test_id: this.props.individualCourseTest.id,
      section_id: this.props.activeSection.id,
      next_section_id: '',
      question_id: curr_question_id,
      next_question_id: '',
      time_elapsed: this.totalTimeElapsed(),
      is_marked: 0,
      response: response
    }).then(response => {
      const {
        result,
        status,
        error
      } = response;
      if (!error) {
        if (status) {
          this.props.actions.updateCourseTest({
            test: result['test'],
            prevSection: result['prev_section'],
            nextSection: result['next_section'],
            prevQuestion: result['prev_question'],
            nextQuestion: result['next_question'],
          })

          api(url_test_submit, {
            test_id: this.props.individualCourseTest.id,
            to_evaluate: "1"
          }).then(response => {
            const {
              result,
              status,
              error
            } = response;
            if (!error) {
              if (status) {            
                this.props.actions.setCourseTest({
                  individualCourseTest: result['test'],
                  individualCourseSection: result['sections'],
                  activeSection: null,
                  activeQuestion: null
                })
              }
            }
          });

        }
      }
    });
  };

    handleMarkSubmitTest = () => {
      var curr_question_id = this.props.activeQuestion.id;
      var curr_section_id = this.props.activeSection.id;
      var response = null;
      if (this.props.activeQuestion.question_type.value == "essay"){
         response = JSON.stringify({'answer':this.state.html})
      }else{
         response = JSON.stringify(this.state.response)
      }
    
      this.props.actions.setCourseTestLoaded({
        loaded:false
      })

      api(url_test_update, {
        test_id: this.props.individualCourseTest.id,
        section_id: this.props.activeSection.id,
        next_section_id: '',
        question_id: curr_question_id,
        next_question_id: '',
        time_elapsed: this.totalTimeElapsed(),
        is_marked: 1,
        response: response
      }).then(response => {
        const {
          result,
          status,
          error
        } = response;
        if (!error) {
          if (status) {
            this.props.actions.updateCourseTest({
              test: result['test'],
              prevSection: result['prev_section'],
              nextSection: result['next_section'],
              prevQuestion: result['prev_question'],
              nextQuestion: result['next_question'],
            })

            api(url_test_submit, {
              test_id: this.props.individualCourseTest.id,
              to_evaluate: "1"
            }).then(response => {
              const {
                result,
                status,
                error
              } = response;
              if (!error) {
                if (status) {
                  this.props.actions.setCourseTest({
                    individualCourseTest: result['test'],
                    individualCourseSection: result['sections'],
                    activeSection: null,
                    activeQuestion: null
                  })
                }
              }
            });

          }
        }
      });
    };

handleMarkQuestion = () => {
  var curr_question_id = this.props.activeQuestion.id;
  var curr_section_id = this.props.activeSection.id;
  var next_question_id = this.props.activeQuestion.id;
  var next_section_id = this.props.activeSection.id;
  var nextSection = null;

  api(url_test_update, { 
          test_id:this.props.individualCourseTest.id, 
          section_id:this.props.activeSection.id,
          next_section_id:next_section_id,
          question_id:curr_question_id,
          next_question_id:next_question_id,
          time_elapsed:this.totalTimeElapsed(),
          is_jump:1,
          to_mark:1,
          is_marked:1
        }).then(response => {
    const { result, status, error } = response;
    if (!error){
      if (status) {
        this.props.actions.updateCourseTest({
          test:result['test'],
          prevSection:result['prev_section'],
          nextSection:result['next_section'],
          prevQuestion:result['prev_question'],
          nextQuestion:result['next_question'],
        })
      }
    }
  });
}

handleUnMarkQuestion = () => {
  var curr_question_id = this.props.activeQuestion.id;
  var curr_section_id = this.props.activeSection.id;
  var next_question_id = this.props.activeQuestion.id;
  var next_section_id = this.props.activeSection.id;
  var nextSection = null;

  api(url_test_update, { 
          test_id:this.props.individualCourseTest.id, 
          section_id:this.props.activeSection.id,
          next_section_id:next_section_id,
          question_id:curr_question_id,
          next_question_id:next_question_id,
          time_elapsed:this.totalTimeElapsed(),
          is_jump:1,
          to_mark:1,
          is_marked:0
        }).then(response => {
    const { result, status, error } = response;
    if (!error){
      if (status) {
        this.props.actions.updateCourseTest({
          test:result['test'],
          prevSection:result['prev_section'],
          nextSection:result['next_section'],
          prevQuestion:result['prev_question'],
          nextQuestion:result['next_question'],
        })
      }
    }
  });
}

handleMarkNext = () => {
  var curr_question_id = this.props.activeQuestion.id;
  var curr_section_id = this.props.activeSection.id;
  var next_question_id = null;
  var next_section_id = null;
  var nextSection = null;

  const index_section  = this.props.individualCourseSection.findIndex(x => x.id === this.props.activeSection.id);
  const index_question = this.props.individualCourseSection[index_section].questions.findIndex(x => x.id === this.props.activeQuestion.id);

  if (index_question + 1 != this.props.individualCourseSection[index_section].questions.length){
  
    next_section_id = curr_section_id
    next_question_id = this.props.individualCourseSection[index_section].questions[index_question + 1].id
  
  }else{
    if (index_section + 1 != this.props.individualCourseSection.length){

      nextSection     = this.props.individualCourseSection[index_section + 1]  
      next_section_id = nextSection.id

      if (nextSection.instructions.length > 0 ){
        next_question_id = ""
      }else{
        next_question_id = this.props.individualCourseSection[index_section + 1].questions[0].id
      }
    }else{
  
    
  
    }
  }

  if (curr_section_id != next_section_id){
    this.props.actions.timerRefresh({
      timer:false
    })
  }

  var response = null;
  if (this.props.activeQuestion.question_type.value == "essay"){
     response = JSON.stringify({'answer':this.state.html})
  }else{
     response = JSON.stringify(this.state.response)
  }
  
  api(url_test_update, { 
          test_id:this.props.individualCourseTest.id, 
          section_id:this.props.activeSection.id,
          next_section_id:next_section_id,
          question_id:curr_question_id,
          next_question_id:next_question_id,
          time_elapsed:this.totalTimeElapsed(),
          is_marked:1,
          response:response
        }).then(response => {
    const { result, status, error } = response;
    if (!error){
      if (status) {
        this.props.actions.updateCourseTest({
          test:result['test'],
          prevSection:result['prev_section'],
          nextSection:result['next_section'],
          prevQuestion:result['prev_question'],
          nextQuestion:result['next_question'],
        })
        this.handleSectionMarkSubmitClose()
        if (result['next_question']){
          if (result['next_question'].response){

            if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:result['next_question'].response.answer
              })  
            }else{
              this.setState({
                response:result['next_question'].response,
                html:''
              })
  
            }
          }else{
            if(['mcq_single','word','number'].indexOf(result['next_question'].question_type.value) >= 0 ){
              // console.log('here 2')
              this.setState({
                response: {'answer':''}
              })  
            }else if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:''
              })  
            }else{
              console.log('here 2')
              this.setState({
                response: {'answer':[]}
              })
            }
          }
        }

      }
    }
  });
}

handleQuestionJump = event => {
  const dataId = event.currentTarget.dataset.id;
  // console.log(dataId)
  var curr_question_id = this.props.activeQuestion.id;
  var next_question_id = dataId;
  

  api(url_test_update, { 
          test_id:this.props.individualCourseTest.id, 
          section_id:this.props.activeSection.id,
          next_section_id:this.props.activeSection.id,
          question_id:curr_question_id,
          next_question_id:next_question_id,
          time_elapsed:this.totalTimeElapsed(),
          is_jump:1
          // is_marked:,
          // response:response
        }).then(response => {
    const { result, status, error } = response;
    if (!error){
      if (status) {
        this.props.actions.updateCourseTest({
          test:result['test'],
          prevSection:result['prev_section'],
          nextSection:result['next_section'],
          prevQuestion:result['prev_question'],
          nextQuestion:result['next_question'],
        })

        if (result['next_question']){
          if (result['next_question'].response){

            if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:result['next_question'].response.answer,
                markedForReview:false
              })  
            }else{
              this.setState({
                response:result['next_question'].response,
                html:'',
                markedForReview:false
              })
  
            }
          }else{
            if(['mcq_single','word','number'].indexOf(result['next_question'].question_type.value) >= 0 ){
              // console.log('here 2')
              this.setState({
                response: {'answer':''},
                markedForReview:false
              })  
            }else if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:'',
                markedForReview:false
              })  
            }else{
              console.log('here 2')
              this.setState({
                response: {'answer':[]},
                markedForReview:false
              })
            }
          }
        }
      }
    }
  });
}

handleMarkedForReview = () => {
  this.setState({
    markedForReview:true
  });
};


handleMarkedForReviewClose = () => {
  this.setState({
    markedForReview:false
  });
}
handleSectionJump = event =>{
  const curr_section_id = this.props.activeSection.id;
  const next_section_id = event.currentTarget.dataset.id;
  // console.log(dataId)
  var curr_question_id = this.props.activeQuestion.id;
  var next_question_id = null;

  const index_section  = this.props.individualCourseSection.findIndex(x => x.id === next_section_id);
  next_question_id = this.props.individualCourseSection[index_section].questions[0].id;

  // if (curr_section_id != next_section_id){
  //   this.props.actions.timerRefresh({
  //     timer:false
  //   })
  // }

  api(url_test_update, { 
          test_id:this.props.individualCourseTest.id, 
          section_id:curr_section_id,
          next_section_id:next_section_id,
          question_id:curr_question_id,
          next_question_id:next_question_id,
          time_elapsed:this.totalTimeElapsed(),
          is_jump:1
        }).then(response => {
    const { result, status, error } = response;
    if (!error){
      if (status) {
        this.props.actions.updateCourseTest({
          test:result['test'],
          prevSection:result['prev_section'],
          nextSection:result['next_section'],
          prevQuestion:result['prev_question'],
          nextQuestion:result['next_question'],
        })

        if (result['next_question']){
          if (result['next_question'].response){

            if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:result['next_question'].response.answer
              })  
            }else{
              this.setState({
                response:result['next_question'].response,
                html:''
              })
  
            }
          }else{
            if(['mcq_single','word','number'].indexOf(result['next_question'].question_type.value) >= 0 ){
              // console.log('here 2')
              this.setState({
                response: {'answer':''}
              })  
            }else if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:''
              })  
            }else{
              console.log('here 2')
              this.setState({
                response: {'answer':[]}
              })
            }
          }
        }
        // this.inputElement.click();
        // this.forceUpdate()
      }
    }
  });


  
}



checkSectionSubmit = () => {
  
  var curr_section_id = this.props.activeSection.id;
  var next_section_id = null;

  var nextSection = null;
  const index_section  = this.props.individualCourseSection.findIndex(x => x.id === this.props.activeSection.id);
  const index_question = this.props.individualCourseSection[index_section].questions.findIndex(x => x.id === this.props.activeQuestion.id);
  if (index_question + 1 != this.props.individualCourseSection[index_section].questions.length){
    next_section_id = curr_section_id
  }else{
    if (index_section + 1 != this.props.individualCourseSection.length){
      nextSection     = this.props.individualCourseSection[index_section + 1]  
      next_section_id = nextSection.id
    }else{
      next_section_id = null;
    }
  }


  if (next_section_id){
    if (next_section_id == curr_section_id){
      return "next_question"
    }else{
      if (this.props.individualCourseTest.is_sectional_jump){
        return "next_section"
      }else{
        return "confirm_section"
      }
    }
  }else{
    return "confirm_test_submit"
  }
}



handleSubmitSection = () =>{

  var curr_question_id = this.props.activeQuestion.id;
  var curr_section_id = this.props.activeSection.id;
  var next_question_id = null;
  var next_section_id = null;
  var nextSection = null;

  const index_section  = this.props.individualCourseSection.findIndex(x => x.id === this.props.activeSection.id);
  const index_question = this.props.individualCourseSection[index_section].questions.findIndex(x => x.id === this.props.activeQuestion.id);
  
  if (index_section + 1 != this.props.individualCourseSection.length){
    nextSection     = this.props.individualCourseSection[index_section + 1]  
    next_section_id = nextSection.id

    if (nextSection.instructions.length > 0 ){
      next_question_id = ""
    }else{
      next_question_id = this.props.individualCourseSection[index_section + 1].questions[0].id
    }
  }else{

  

  }


  var response = null;
  if (this.props.activeQuestion.question_type.value == "essay"){
     response = JSON.stringify({'answer':this.state.html})
  }else{
     response = JSON.stringify(this.state.response)
  }

  if (curr_section_id != next_section_id){
    this.props.actions.timerRefresh({
      timer:false
    })
  }
  
  api(url_test_update, { 
          test_id:this.props.individualCourseTest.id, 
          section_id:this.props.activeSection.id,
          next_section_id:next_section_id,
          question_id:curr_question_id,
          next_question_id:next_question_id,
          time_elapsed:this.totalTimeElapsed(),
          is_marked:0,
          response:response
        }).then(response => {
    const { result, status, error } = response;
    if (!error){
      if (status) {
        
        this.props.actions.updateCourseTest({
          test:result['test'],
          prevSection:result['prev_section'],
          nextSection:result['next_section'],
          prevQuestion:result['prev_question'],
          nextQuestion:result['next_question'],
        })
        this.handleSectionSubmitClose()


        if (result['next_question']){
          if (result['next_question'].response){

            if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:result['next_question'].response.answer,
                markedForReview:false
              })  
            }else{
              this.setState({
                response:result['next_question'].response,
                html:'',
                markedForReview:false
              })
  
            }
          }else{
            if(['mcq_single','word','number'].indexOf(result['next_question'].question_type.value) >= 0 ){
              // console.log('here 2')
              this.setState({
                response: {'answer':''},
                markedForReview:false
              })  
            }else if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:'',
                markedForReview:false
              })  
            }else{
              console.log('here 2')
              this.setState({
                response: {'answer':[]},
                markedForReview:false
              })
            }
          }
        }

      }
    }
  });


}


handleSaveNext = () =>{
  var curr_question_id = this.props.activeQuestion.id;
  var curr_section_id = this.props.activeSection.id;
  var next_question_id = null;
  var next_section_id = null;
  var nextSection = null;

  const index_section  = this.props.individualCourseSection.findIndex(x => x.id === this.props.activeSection.id);
  const index_question = this.props.individualCourseSection[index_section].questions.findIndex(x => x.id === this.props.activeQuestion.id);
  if (index_question + 1 != this.props.individualCourseSection[index_section].questions.length){
  
    next_section_id = curr_section_id
    next_question_id = this.props.individualCourseSection[index_section].questions[index_question + 1].id
  
  }else{
  
    if (index_section + 1 != this.props.individualCourseSection.length){

      nextSection     = this.props.individualCourseSection[index_section + 1]  
      next_section_id = nextSection.id

      if (nextSection.instructions.length > 0 ){
        next_question_id = ""
      }else{
        next_question_id = this.props.individualCourseSection[index_section + 1].questions[0].id
      }
    }else{
  
    
  
    }
  }

  var response = null;
  if (this.props.activeQuestion.question_type.value == "essay"){
     response = JSON.stringify({'answer':this.state.html})
  }else{
     response = JSON.stringify(this.state.response)
  }

  if (curr_section_id != next_section_id){
    this.props.actions.timerRefresh({
      timer:false
    })
  }
  
  api(url_test_update, { 
          test_id:this.props.individualCourseTest.id, 
          section_id:this.props.activeSection.id,
          next_section_id:next_section_id,
          question_id:curr_question_id,
          next_question_id:next_question_id,
          time_elapsed:this.totalTimeElapsed(),
          is_marked:this.props.activeQuestion.is_marked ? "1" : "0",
          response:response
        }).then(response => {
    const { result, status, error } = response;
    if (!error){
      if (status) {
        
        this.props.actions.updateCourseTest({
          test:result['test'],
          prevSection:result['prev_section'],
          nextSection:result['next_section'],
          prevQuestion:result['prev_question'],
          nextQuestion:result['next_question'],
        })
        this.handleSectionSubmitClose()


        if (result['next_question']){
          if (result['next_question'].response){

            if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:result['next_question'].response.answer
              })  
            }else{
              this.setState({
                response:result['next_question'].response,
                html:''
              })
  
            }
          }else{
            if(['mcq_single','word','number'].indexOf(result['next_question'].question_type.value) >= 0 ){
              // console.log('here 2')
              this.setState({
                response: {'answer':''}
              })  
            }else if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:''
              })  
            }else{
              console.log('here 2')
              this.setState({
                response: {'answer':[]}
              })
            }
          }
        }

      }
    }
  });
}


handleSave = () =>{

  var curr_question_id = this.props.activeQuestion.id;
  var curr_section_id = this.props.activeSection.id;
  var next_question_id = this.props.activeQuestion.id;
  var next_section_id = this.props.activeSection.id;

  var response = null;
  if (this.props.activeQuestion.question_type.value == "essay"){
     response = JSON.stringify({'answer':this.state.html})
  }else{
     response = JSON.stringify(this.state.response)
  }

  api(url_test_update, { 
          test_id:this.props.individualCourseTest.id, 
          section_id:this.props.activeSection.id,
          next_section_id:next_section_id,
          question_id:curr_question_id,
          next_question_id:next_question_id,
          time_elapsed:this.totalTimeElapsed(),
          is_marked:this.props.activeQuestion.is_marked ? "1" : "0",
          response:response
        }).then(response => {
    const { result, status, error } = response;
    if (!error){
      if (status) {
        
        this.props.actions.updateCourseTest({
          test:result['test'],
          prevSection:result['prev_section'],
          nextSection:result['next_section'],
          prevQuestion:result['prev_question'],
          nextQuestion:result['next_question'],
        })
        this.handleSectionSubmitClose()


        if (result['next_question']){
          if (result['next_question'].response){

            if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:result['next_question'].response.answer
              })  
            }else{
              this.setState({
                response:result['next_question'].response,
                html:''
              })
  
            }
          }else{
            if(['mcq_single','word','number'].indexOf(result['next_question'].question_type.value) >= 0 ){
              // console.log('here 2')
              this.setState({
                response: {'answer':''}
              })  
            }else if(result['next_question'].question_type.value == 'essay'){
              this.setState({
                response: {'answer':''},
                html:''
              })  
            }else{
              console.log('here 2')
              this.setState({
                response: {'answer':[]}
              })
            }
          }
        }

      }
    }
  });
}



  render() {
      var test = this.props.individualCourseTest;
      var section = this.props.activeSection;
      var question = this.props.activeQuestion;
    

      var questionList = this.props.individualCourseSection.filter(row => row.id === this.props.activeSection.id)[0].questions
      var initialTime = null;
      var endTime = null;

      if (test.time_calculation == "overall"){
          initialTime = test.timer_type ==  "remaining" ? ((parseFloat(test.total_time) - parseFloat(test.time_elapsed)) * 1000) : parseFloat(test.time_elapsed) * 1000
          endTime = (test.timer_type ==  "remaining" ? 0 : test.total_time * 1000)
          console.log('overall',initialTime,endTime)

      }else if (test.time_calculation == "sectional"){
          initialTime = test.timer_type ==  "remaining" ? ((parseFloat(section.section_time) - parseFloat(section.time_elapsed)) * 1000) : parseFloat(section.time_elapsed) * 1000       
          endTime = (test.timer_type ==  "remaining" ? 0 : parseFloat(section.section_time) * 1000)
          // console.log('sectional',initialTime,endTime)
          // console.log(section.section_time , section.time_elapsed, initialTime, endTime)
      }else{
        initialTime = parseFloat(test.time_elapsed) * 1000
      }

      let timerType = null;
      let questionRender = null;
      
      questionRender = questionList.map((qs,key) => {
              // return <div className="question"><div className="unanswered-legend"> {qs}</div></div>

            
            if (qs.status == "not_visited"){
              return <div data-id={qs.id}  onClick={test.is_question_jump ? this.handleQuestionJump.bind(this) : null} className={this.props.activeQuestion.id == qs.id ? 'question unvisited-legend active' : 'question unvisited-legend' }> {key + 1}</div>
            }else{
              if(qs.is_marked){
                if (qs.status== "answered"){
                  return <div data-id={qs.id} onClick={test.is_question_jump ? this.handleQuestionJump.bind(this) : null} className={this.props.activeQuestion.id == qs.id ? 'question answer-marked-legend active' : 'question answer-marked-legend' }> {key + 1}</div>
                }else{
                  return <div data-id={qs.id}  onClick={test.is_question_jump ? this.handleQuestionJump.bind(this) : null}  className={this.props.activeQuestion.id == qs.id ? 'question marked-legend active' : 'question marked-legend' }>  {key + 1}</div>
                }

              }else{
                if (qs.status== "answered"){
                  return <div  data-id={qs.id} onClick={test.is_question_jump ? this.handleQuestionJump.bind(this) : null} className={this.props.activeQuestion.id == qs.id ? 'question answered-legend active' : 'question answered-legend' }> {key + 1}</div>
                }else{
                  return <div data-id={qs.id}  onClick={test.is_question_jump ? this.handleQuestionJump.bind(this) : null} className={this.props.activeQuestion.id == qs.id ? 'question unanswered-legend active' : 'question unanswered-legend' }> {key + 1}</div>
                }

              }
            }

        });
        let renderNmatQuestionList = null;
        renderNmatQuestionList = questionList.map((qs,key) => {
          if (qs.is_marked){
            return <div data-id={qs.id}  onClick={test.is_question_jump ? this.handleQuestionJump.bind(this) : null} className='question-marked-for-review' > <div className="question-number-marked">Question {key + 1} </div> <FlagFilledIcon size='medium'></FlagFilledIcon> </div>
          }else{
            return <div data-id={qs.id}  onClick={test.is_question_jump ? this.handleQuestionJump.bind(this) : null} className='question-marked-for-review'> <div className="question-number-marked">Question {key + 1} </div>  <EmojiFlagsIcon size='medium'></EmojiFlagsIcon></div>
          }

        })

        if (test.time_calculation != "untimed"){  
          timerType = <div className="general-timer-number">
                          <Timer 
                                    initialTime={initialTime}
                                    direction={ test.timer_type ==  "remaining" ? "backward" : "forward"}
                                    onResume={this.handleTestPlay}
                                    onPause={this.handleTestPause}
                                    checkpoints={[
                                      {
                                          time: endTime,
                                          callback: this.handleAutoSubmitTest,
                                      }
                                    ]}            
                                  >
                                    {({pause,resume,getTime,reset}) => (
                                    <React.Fragment>
                                        <div>
                                          {(!this.state.isPaused) &&  (
                                            <button style = {test.is_pausable ? {} : {display:"none"}}  className="general-button-timer" onClick={pause}>Pause</button>
                                          )}
                                          {this.state.isPaused && (
                                            <button className="general-button-timer" onClick={resume}>Resume</button>
                                          )}                                            
                                        </div>
                                        <div>
                                          { test.timer_type ==  "remaining" ? "Time Left : " : "Time : "} &nbsp;&nbsp;<Timer.Hours /> : <Timer.Minutes /> : <Timer.Seconds />
                                        </div>
                                        <div id="time-timer-value" time={getTime()}></div>
                                        <div>
                                            {/* <button className="general-button-timer" onClick={reset}>Reset</button> */}
                                        </div>
                                    </React.Fragment>
                                )}
                            </Timer>
                        { test.timer_type ==  "remaining" ? "" : 
                          <Timer 
                                initialTime={endTime}
                                startImmediately={false}
                                >
                                {({reset}) => (
                                <React.Fragment>
                                    <div>
                                        &nbsp;/&nbsp;<Timer.Hours /> : <Timer.Minutes /> : <Timer.Seconds />
                                    </div>
                                    <div>
                                        {/* <button className="general-button-timer" onClick={reset}>Reset</button> */}
                                    </div>

                                </React.Fragment>
                            )}
                        </Timer>  
                        }
                    </div>
      }else{
        timerType = <div className="general-timer-number">
                      <Timer 
                        initialTime={initialTime}
                        direction={"forward"}
                        onResume={this.handleTestPlay}
                        onPause={this.handleTestPause}
                      >
            {({pause,resume,getTime,reset}) => (
            <React.Fragment>
                <div>
                  {(!this.state.isPaused) &&  (
                    <button style = {test.is_pausable ? {} : {display:"none"}}  className="general-button-timer" onClick={pause}>Pause</button>
                  )}
                  {this.state.isPaused && (
                    <button className="general-button-timer" onClick={resume}>Resume</button>
                  )}                                            
                </div>
                <div>
                  Time : " &nbsp;&nbsp;<Timer.Hours /> : <Timer.Minutes /> : <Timer.Seconds />
                </div>
                <div>
                      {/* <button className="general-button-timer" onClick={reset}>Reset</button> */}
                </div>

                <div id="time-timer-value" time={getTime()}></div>
            </React.Fragment>
        )}
        </Timer>
          </div>
      }

      let questionPaper = null;
      // console.log(questionList)
      if(!test.is_sectional_jump){
        questionPaper = questionList.map((row,key) => {
          if (['mcq_single','mcq_multiple','chooseorder'].indexOf(row.question_type.value) >=0){
            return <div key={key} className="question-div-paper">
                      {/* <div className="question-type">Type: {row.question_type.label}</div> */}
                      <div className="question-text"><b>{key + 1}.</b> {Parser(row.question_text)}</div>
                      <div className="question-options">
                      {
                        row.answer_options.options.map((qs,key2) => {
                          return <div>{toLetters(key2 + 1)}. {Parser(qs.value)}</div>
                        })
                      }
                      </div>
                  </div>
          }else{
            return <div key={key}  className="question-div-paper">
                      {/* <div className="question-type">Type: {row.question_type.label}</div> */}
                      <div className="question-text"><b>{key + 1}.</b> {Parser(row.question_text)}</div>
                  </div>
          }
        })
      }else{
        questionPaper = this.props.individualCourseSection.map((sec,alfa) => {
          return <div>
                    <div className="paper-section-name">Section Name : {sec.sub_section_name}</div>
                    {
                      sec.questions.map((row,key) => {
                        if (['mcq_single','mcq_multiple','chooseorder'].indexOf(row.question_type.value) >=0){
                          return <div key={key} className="question-div-paper">
                                    {/* <div className="question-type">Type: {row.question_type.label}</div> */}
                                    
                                    <div className="question-paper-text"><div className="question-paper-number">Q {key + 1}.&nbsp; </div> <div className="question-paper-question-text">{Parser(row.question_text)}</div></div>
                                    <div className="question-paper-options">
                                    {
                                      row.answer_options.options.map((qs,key2) => {
                                        return <div className="question-paper-option">{toLetters(key2 + 1)}.&nbsp;{Parser(qs.value)}</div>
                                      })
                                    }
                                    </div>
                                </div>
                        }else{
                          return <div key={key}  className="question-div-paper">
                                    {/* <div className="question-type">Type: {row.question_type.label}</div> */}
                                    <div className="question-paper-text"><div className="question-paper-number">Q {key + 1}. </div> <div className="question-paper-question-text">{Parser(row.question_text)}</div></div>
                                </div>
                        }
                      })
                    }
                  </div>

        })
      }
      // console.log(questionPaper)
      // Different question type rendering

      let renderOptions = null;
      let finalRender = null;
      if (question.question_type.value == "mcq_single"){
        renderOptions = question.answer_options.options.map((row, key) => {
          var isOptionSelected = false
          if(this.state.response.answer === String(row.id)){
            isOptionSelected = true
          }else{
            isOptionSelected = false
          }

          return (
              <div key={key} className="general-option-mcq-single">
                  <div className="general-option-radio-button">
                      <input type="radio"  checked={isOptionSelected}  name="option" value={row.id} />
                  </div>
                  <div className="general-option-alpha-value">
                      <b>{toLetters(key + 1)}.</b>
                  </div>
                  <div className="general-option-text">
                    {Parser(row.value)}
                  </div>
              </div>
          );
      });


      finalRender =  <form onChange={this.onMCQRadioChange}>
                          {renderOptions}
                      </form>


      }else if(question.question_type.value == "mcq_multiple"){

        finalRender = question.answer_options.options.map((row, key) => {

          var isOptionSelected = false
          if(this.state.response.answer.indexOf(String(row.id)) >= 0){
            isOptionSelected = true
          }else{
            isOptionSelected = false
          }
          
          return (
            <div key={key} className="general-option-mcq-single">
                  <div className="general-option-radio-button">
                      <div className="general-radio-mcq-multiple">
                      <Checkbox
                          value={row.id}
                          data-id={row.id}
                          onChange={this.onMCQCheckboxChange}
                          name="options"
                          defaultChecked = {isOptionSelected}
                          isChecked={isOptionSelected}
                      />
                      </div>
                  </div>
                  <div className="general-option-alpha-value">
                      <b>{toLetters(key + 1)}.</b>
                  </div>
                  <div className="general-option-text">
                    {Parser(row.value)}
                  </div>
              </div>
          );
          // finalRender = renderOptions;
      });


      }else if(question.question_type.value == "word"){
          finalRender = <div>
                          <div className="field-div-2">
                            <span className="field-label">Answer</span>
                            <TextField
                            name="answer"
                            onChange={this.handleTextNumberAnswerChange}
                            value={this.state.response.answer}
                            />    
                        </div>
                      </div>


      }else if(question.question_type.value == "number"){
                  finalRender = <div>
                          <div className="field-div-2">
                            <span className="field-label">Answer</span>
                            <TextField
                            name="answer"
                            type="number"
                            onChange={this.handleTextNumberAnswerChange}
                            value={this.state.response.answer}
                            />    
                        </div>
                      </div>
      }else if(question.question_type.value == "chooseorder"){
        var answer = null

        finalRender = question.answer_options.options.map((row, key) => {        
          if(this.state.response.answer.length == question.answer_options.options.length ){
            answer = this.state.response.answer[key]
          }else{
            answer = ''
          }

          return (
            <div key={key} className="general-option-mcq-single">
                  <div className="general-option-radio-button">
                      <div className="general-radio-mcq-multiple">
                        <TextField
                            name="answer"
                            type="number"
                            data-id = {key + 1}
                            min = {1}
                            onChange={this.handleChooseOrderChange}
                            value={answer}
                        />    
                      </div>
                  </div>
                  <div className="general-option-alpha-value">
                      <b>{toLetters(key + 1)}.</b>
                  </div>
                  <div className="general-option-text">
                    {Parser(row.value)}
                  </div>
              </div>
          );
        });

      }else if(question.question_type.value == "essay"){
        finalRender =  <div className="field-div-2">
                          <span className="field-label">Response</span>
                          <EditorQuestion
                              onChange={this.handleEssayChange}
                              html={this.state.html}
                          />
                      </div>

      }
      

      let subSectionheight = '27px';
      let renderSection = null;
      if (this.props.individualCourseTest.is_section_sequence_choose){
          renderSection = <div className="general-active-section">
                          <div className="general-section-name">      
                            {this.props.activeSection ? this.props.activeSection.name : ""}
                          </div>
                        </div>         
      }else if( !this.props.individualCourseTest.is_sectional_jump){
        renderSection = <div className="general-active-section">
                          <div className="general-section-name">      
                            {this.props.activeSection ? this.props.activeSection.name : ""}
                          </div>
                        </div>         
      }else{
          renderSection = this.props.individualCourseSection.map((qs,key) => {
          if (qs.id === this.props.activeSection.id){
            if (qs.name != qs.sub_section_name){
              subSectionheight = '54px';
              return <div  data-id={qs.id}   className = "general-active-section">
                        <div className="general-section-name">
                          {qs.name}
                         </div>
                         <div className="general-subsection-name">
                          {qs.sub_section_name}
                         </div>
                     </div>
            }else{
              return <div data-id={qs.id}   className = "general-active-section">
                        <div className="general-section-name">
                          {qs.name}
                         </div>
                     </div>
            }
          }else{
            if (qs.name != qs.sub_section_name){
              return <div  data-id={qs.id}   className = "general-section" onClick={this.props.individualCourseTest.is_sectional_jump ? this.handleSectionJump : ''}>
                        <div className="general-section-name">
                          {qs.name}
                         </div>
                         <div className="general-subsection-name">
                          {qs.sub_section_name}
                         </div>
                     </div>

            }else{
              return <div  data-id={qs.id}   className="general-section"  onClick={this.props.individualCourseTest.is_sectional_jump ? this.handleSectionJump : ''}>
                        <div className="general-section-name">      
                            {qs.name}
                        </div>
                    </div>
            }

          }
        })

      }




      if (!this.state.loaded){
        return (<div className="loader-page">
                  <div className="image-container"></div>
                </div>)
      }else{
        return (
          <div>
              <div>
                <div className="general-header">
                  <div className="general-test-header" align="center">{this.props.individualCourseTest ? this.props.individualCourseTest.test_name : ""}</div>
                  <div className={test.interface_type != "nmat" ? "general-question-header" : "nmat-question-header"}>
                    {test.interface_type == "nmat" && (
                      <div className="general-button-question-header" onClick={this.handleMarkedForReview}>
                        <EmojiFlagsIcon size="small"></EmojiFlagsIcon> Marked for Review
                      </div>
                    )}
                    {test.interface_type != "nmat" && (
                      <div className="general-button-question-header" onClick={this.handleInstructionOpen}>
                        <EditorPanelIcon size="small"></EditorPanelIcon> Instructions
                      </div>
                    )}
                    {test.interface_type != "nmat" && (
                      <div className="general-button-question-header" onClick={this.handleQuestionPaperOpen}>
                        <PageIcon  size="small"></PageIcon> Question Paper
                      </div>
                    )}
                    {this.props.activeSection.is_calculator && (
                        <div className="general-button-question-header" onClick={this.calculatorOpen}>
                          <BillingFilledIcon  size="small"></BillingFilledIcon> Calculator
                        </div>
                    )}
  
                  </div>
                  <div style = {{height: subSectionheight }} className="general-section-select-header">
                        {renderSection}
                  </div>
  
  
                  <div className="general-question-number-header">
                      <div className="general-question-number">
                        Question {questionList.findIndex(x => x.id == this.props.activeQuestion.id) + 1} of {questionList.length}
                      </div>
                      { this.props.timerState && (
                        <div>
                        {timerType}
                        </div>
                      )}
                      
                  </div>
  
                  <div className="general-section-division">
                  </div>
                </div>
                {!this.state.isPaused && !this.state.markedForReview && !this.state.questionPaperOpen && (
                <div style = {{height: (window.innerHeight - 167) + 'px' }} className={"general-test-question-page"}>
                    <div className={test.interface_type != "nmat" ? "general-question-space" : "nmat-question-space"}>
                        { question.is_passage && (
                            <div style = { {width: question.is_passage ? "50%" : "0%"}} className="passage-section">
                              {Parser(question.passage.passage)}
                            </div>
                          )
                        }
                        <div style = { {width: question.is_passage ? "50%" : "100%"}} className="question-area">
                          <div  style = {{height: (window.innerHeight - 240) + 'px' }}  className="question-row">
                            <div className="question-text">
                              <div className="question-number-prefix"><b>Q {questionList.findIndex(x => x.id == this.props.activeQuestion.id) + 1}.</b></div> 
                              <div className="question-text-html">{Parser(question.question_text)}</div>
                            </div>
                            <div className="question-response">
                              {finalRender}
                            </div>
                            <div className="flag-question">

                            {test.interface_type == "nmat" && (
                              <div className="general-button-question-submit-row" onClick={question.is_marked ? this.handleUnMarkQuestion : this.handleMarkQuestion}>
                                {question.is_marked ? <FlagFilledIcon size='small'></FlagFilledIcon> : <EmojiFlagsIcon size='small'></EmojiFlagsIcon>} {question.is_marked ? 'Unflag' : 'Flag'} 
                             </div>

                            )}
                            </div>
                          </div>
                          <div className="question-submit-row">
                          { (this.checkSectionSubmit() == "next_question" || this.checkSectionSubmit() == "next_section")  && (
                            <div className="general-button-question-submit-row-submit"  onClick={this.handleSaveNext}>
                              Save & Next
                            </div>
                          )}
                          { this.checkSectionSubmit() == "confirm_section"  && (
                            <div className="general-button-question-submit-row-submit"  onClick={this.handleSectionSubmitOpen}>
                              Save & Submit Section
                            </div>
                          )}
                          { this.checkSectionSubmit() == "confirm_test_submit"  && (
                            <div className="general-button-question-submit-row-submit"  onClick={this.handleTestSubmitOpen}>
                              Save & Submit Test
                            </div>
                          )}

                          { (this.checkSectionSubmit() == "confirm_section" || this.checkSectionSubmit() == "confirm_test_submit") && (
                            <div className="general-button-question-submit-row-submit"  onClick={this.handleSave}>
                              Save
                            </div>
                          )}
  
  
                            <div className="general-button-question-submit-row" onClick={this.handleClearResponse}>
                              Clear Response
                            </div>
  
                            { (this.checkSectionSubmit() == "next_question" || this.checkSectionSubmit() == "next_section") && (test.interface_type != "nmat")  && (
                            <div className="general-button-question-submit-row"  onClick={this.handleMarkNext}>
                              Mark for Review & Next
                            </div>
                            )}
                            { this.checkSectionSubmit() == "confirm_section" && (test.interface_type != "nmat") && (
                            <div className="general-button-question-submit-row-submit"  onClick={this.handleSectionMarkSubmitOpen}>
                              Mark Ques. & Submit Section
                            </div>
                          )}
                          { this.checkSectionSubmit() == "confirm_test_submit" && (test.interface_type != "nmat")  && (
                            <div className="general-button-question-submit-row-submit"  onClick={this.handleTestMarkSubmitOpen}>
                              Mark Ques. & Submit Test
                            </div>
                          )}
  
  
                          </div>
  
                        </div>
                    </div>
                    {test.interface_type !="nmat" && (
                      <div className="general-question-sidebar">
                        <div className="sidebar-header">
                          Legends:
                        </div>
                        <div className="legends">
                          <div className="details">
                              <div className="answered-legend"></div>
                              <div className="legend-name">
                                Answered
                              </div>
                              
                          </div>
                          <div className="details">
                              <div className="unanswered-legend"></div>
                              <div className="legend-name">
                              Not Answered
                              </div>
  
                          </div>
                          <div className="details">
                              <div className="marked-legend"></div>
                              <div className="legend-name">
                              Marked
                              </div>
  
                          </div>
                          <div className="details">
                              <div className="answer-marked-legend"></div>
                              <div className="legend-name">
                              Marked & Answered
                              </div>
  
                          </div>
                          <div className="details">
                              <div className="unvisited-legend"></div>
                              <div className="legend-name">
                                Not Visited
                              </div>
                              
                          </div>
                        </div>
                        <div className="sidebar-header">
                          Questions:
                        </div>
                        <div style = {{height: (window.innerHeight - 470) + 'px' }} className="questions">
                            {questionRender}
                        </div>
                        <div className="sidebar-header">
                          {!test.is_sectional_jump && (this.props.individualCourseSection.length > 1) && (
                          <div className="general-button-question-header" onClick={this.handleSectionSubmitOpen}>
                            Submit Section
                          </div>
                          )}
                          <div className="general-button-question-header" onClick={this.handleTestSubmitOpen}>
                            Submit Test
                          </div>
                        </div>
  
  
                    </div>
                    )}
                </div>
                )}
  
                {this.state.isPaused && ( 
                  <div style = {{height: (window.innerHeight - 167) + 'px' , 'text-align': 'center', 'line-height': (window.innerHeight - 167) + 'px', 'font-size': '90px'}} className="paused-reminder">
                    Test Paused
                  </div>
                )}
              </div>

              {(this.state.markedForReview && !this.state.isPaused) && (
                <div className='marked-for-review-page'>
                  <div className="question-marked-list">
                    <div className="general-button-question-submit-row" onClick={this.handleMarkedForReviewClose}>
                      Close
                    </div>
                    
                  </div>
                  <div className="question-marked-list">
                      {renderNmatQuestionList}
                  </div>
                  {!test.is_sectional_jump && (this.props.individualCourseSection.length > 1) && (
                  <div className="general-test-button-strong" onClick={this.handleSectionSubmitOpen}>
                      Submit Section
                  </div>
                  )}
                  <div className="general-test-button-strong" onClick={this.handleTestSubmitOpen}>
                    Submit Test
                  </div>

                </div>
              )}

              {(this.state.questionPaperOpen && !this.state.isPaused) && (
                <div className='marked-for-review-page'>
                  <div className="question-marked-list">
                    <div className="general-button-question-submit-row" onClick={this.handleQuestionPaperClose}>
                      Close
                    </div>
                  </div>
                  <div style = {{height: (window.innerHeight - 236) + 'px' }} className="question-paper-outer">
                    {questionPaper}
                  </div> 
                </div>
              )}


              
              <div style = {this.state.isCalculatorShow ? {} : {display:"none"}} className="calculator">
                <div className="calculator-close" onClick={this.calculatorClose}>
                  Close
                </div>
                <div className="calculator-frame">
                  <iframe width="219" height="302" src="https://calculator-1.com/outdoor/?f=525152&r=000000" scrolling="no" frameBorder="0"></iframe>
                </div>
              </div>
  
  
              <ModalTransition>
                    {this.state.isSectionSubmitConfirm && (
                      <Modal autoFocus={false}  actions={
                        [
                          { text: 'Confirmed', appearance: 'primary', onClick: this.handleSubmitSection },
                          { text: 'Close', appearance: 'normal', onClick: this.handleSectionSubmitClose },
                        ]
                      } onClose={this.handleSectionSubmitClose} heading={"Confirm Section Submit"}>
                          {"Are you sure you want to submit the section?"}              
                      </Modal>
                    )}
              </ModalTransition>
              <ModalTransition>
                    {this.state.isSectionMarkSubmitConfirm && (
                      <Modal autoFocus={false}  actions={
                        [
                          { text: 'Confirmed', appearance: 'primary', onClick: this.handleMarkNext },
                          { text: 'Close', appearance: 'normal', onClick: this.handleSectionMarkSubmitClose },
                        ]
                      } onClose={this.handleSectionMarkSubmitClose} heading={"Confirm Section Submit"}>
                          {"Are you sure you want to submit the section?"}              
                      </Modal>
          
                    )}
              </ModalTransition>
  
  
              <ModalTransition>
                    {this.state.isTestSubmitConfirm && (
                      <Modal autoFocus={false}  actions={
                        [
                          { text: 'Confirmed', appearance: 'primary', onClick: this.handleSubmitTest },
                          { text: 'Close', appearance: 'normal', onClick: this.handleTestSubmitClose },
                        ]
                      } onClose={this.handleTestSubmitClose} heading={"Confirm Test Submit"}>
                          {"Are you sure you want to submit the test?"}              
                      </Modal>
                    )}
              </ModalTransition>
              <ModalTransition>
                    {this.state.isTestMarkSubmitConfirm && (
                      <Modal autoFocus={false}  actions={
                        [
                          { text: 'Confirmed', appearance: 'primary', onClick: this.handleMarkSubmitTest },
                          { text: 'Close', appearance: 'normal', onClick: this.handleTestMarkSubmitClose },
                        ]
                      } onClose={this.handleTestMarkSubmitClose} heading={"Confirm Test Submit"}>
                          {"Are you sure you want to submit the test?"}              
                      </Modal>
          
                    )}
              </ModalTransition>
  
  
  
  
  
              <ModalTransition>
                    {this.state.instructionOpen && (
                      <Modal width={'80%'} height={'80%'} autoFocus={false}  actions={[
                          { text: 'Close', appearance: 'normal', onClick: this.handleInstructionClose }
                        ]
                      } onClose={this.handleInstructionClose}>
                        <GeneralInstructions instructionOnly={true}>
                        </GeneralInstructions>
  
                      </Modal>
          
                    )}
              </ModalTransition>

              {/* {this.state.questionPaperOpen && (
              <ModalPadding>
                <ModalTransition  className="question-paper-div-test-outer">
                        <Modal width={'80%'} autoFocus={false} className="question-paper-div-test" actions={[
                            { text: 'Close', appearance: 'normal', onClick: this.handleQuestionPaperClose }
                          ]
                        } onClose={this.handleQuestionPaperClose}>
                          <div className="question-paper-inner-div">
                            {questionPaper}
                          </div>
                        </Modal>      
                </ModalTransition>
              </ModalPadding>
              )}   */}
          
          
  
  
            </div>
        )
      }


    }
}


function mapStateToProps(store) {
  return {
    ...store.coursetest
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...coursetest, ...flag }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TestQuestion);
