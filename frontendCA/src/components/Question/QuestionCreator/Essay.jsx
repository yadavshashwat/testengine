// React
import React, { Component } from 'react';
import PropTypes from "prop-types";
import {api} from '../../../helpers/api';
// Styles
import "../../../css/dashboard.css"


// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../../../redux/actions/flag";
import question from "../../../redux/actions/question";
import sectionquestion from "../../../redux/actions/sectionquestion";

// Atlaskit Packages

import Button from '@atlaskit/button';

//Icons

// Components
import EditorQuestion from "../../Editors/EditorQuestion"
import {Element, scroller } from 'react-scroll'
// Other Packages
import Checkbox2 from 'react-simple-checkbox';
import {
    Checkbox,
    // CheckboxIcon
  } from '@atlaskit/checkbox';
var htmlToText = require('html-to-text');
var changeCase = require("change-case");

var url_ques            = "/question/crud_questions/"
var url_sectionquestion = "/question/crud_sectionquestions/"
function toLetters(num) {
    var mod = num % 26,
        pow = num / 26 | 0,
        out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
    return pow ? toLetters(pow) + out : out;
}

const emptyOptionDict = {
    'options': [
        { 'id': '1', 'value': '' },
        { 'id': '2', 'value': '' },
        { 'id': '3', 'value': '' },
        { 'id': '4', 'value': '' }
    ]
}

const emptyCorrectAnswer = {}

const checkboxTheme = {
    backgroundColor:'#fff', 
    borderColor:'#0847A6', 
    uncheckedBorderColor:'#243859', 
    tickColor:'#0847A6'     
  }
  
class Essay extends Component {
    constructor(props) {
        super(props);
        const editQuestion = this.props.editQuestion;
        const editSectionQuestion = this.props.editSectionQuestion
        if(editQuestion){
            this.state = {
                correctAnswer: editQuestion.correct_answer ? editQuestion.correct_answer : emptyCorrectAnswer,
                questionHTML: editQuestion.question_text,
                solutionHTML: editQuestion.solution,
                optionHTML: editQuestion.answer_options ? editQuestion.answer_options : {},
                numOptions: editQuestion.answer_options ? editQuestion.answer_options.options.length : '',
                dataId:editQuestion.id,
                isLive:editQuestion.is_live
            };    
        }else if(editSectionQuestion){
            this.state = {
                correctAnswer: editSectionQuestion.correct_answer ? editSectionQuestion.correct_answer : emptyCorrectAnswer ,
                questionHTML: editSectionQuestion.question_text,
                solutionHTML: editSectionQuestion.solution,
                optionHTML: editSectionQuestion.answer_options ? editSectionQuestion.answer_options : {},
                numOptions: editSectionQuestion.answer_options ? editSectionQuestion.answer_options.options.length : '',
                dataId:editSectionQuestion.id,
                isLive:editSectionQuestion.is_live,
            };    
        }else{
            this.state = {
                correctAnswer: emptyCorrectAnswer,
                questionHTML: "",
                solutionHTML: "",
                optionHTML: {},
                numOptions: '',
                isLive:false,
            };    
        }    
        this.defaultState = this.state;
    }

    // checkIsLiveAllowed = () => {
    //     var allowed = true;
    //     if (htmlToText.fromString(this.state.solutionHTML, {ignoreHref:true}) == "" ){
    //         allowed = false;
    //     }

    //     if (!this.props.topicId){
    //         allowed = false;
    //     }

    //     if (!this.props.difficulty){
    //         allowed = false;
    //     }
    //     this.setState({
    //         isLiveAllowed:allowed
    //     });
    // }

    // handleAddOption = event => {
    //     var Options = this.state.optionHTML.options;
    //     this.setState({
    //         optionHTML: {
    //             'options': [...Options,
    //             { 'id': (Options.length + 1), 'value': '' }
    //             ]
    //         },
    //         numOptions: (this.state.numOptions + 1),

    //     })

    // }

    // handleRemoveOption = event => {
    //     var Options = this.state.optionHTML.options;
    //     var correctAnswer = this.state.correctAnswer.answer
    //     // Options.pop();
    //     correctAnswer = correctAnswer.filter(item => item !== String(this.state.numOptions))

    //     // console.log(Options);
    //     this.setState({
    //         optionHTML: {
    //             'options': Options.slice(0,Options.length-1)
    //         },
    //         numOptions: (this.state.numOptions - 1),
    //         correctAnswer: {'answer':correctAnswer}
    //     })

    // }
    handleQuestionChange = (html) => {
        this.setState({
            questionHTML: html
        })
    }

    handleSolutionChange = (html) => {
        this.setState({
            solutionHTML: html
        })
    }


    // onCheckboxChange = (event) => {
    //     // const data = event.current
    //     const data = event.target.value
    //     // console.log(dataId)
    //     var answer = String(data)
    //     // console.log(answer)
    //     if (this.state.correctAnswer.answer.indexOf(answer) < 0){
    //         var newAnswers = this.state.correctAnswer.answer
    //         newAnswers.push(answer)
    //         newAnswers.sort()
    //         this.setState({
    //             correctAnswer: { 'answer': newAnswers }
    //         })
    
    //     }else{
    //         var correctAnswer = this.state.correctAnswer.answer
    //     // Options.pop();
    //         correctAnswer = correctAnswer.filter(item => item !== answer)
    //         console.log()
    //         this.setState({
    //             correctAnswer: {'answer':correctAnswer}
    //         })
    //     }
    //     console.log(this.state.correctAnswer)
    // };

    // handleOptionChange = (html, data_id) => {
    // // console.log(html)
    //     var oldOptionHTML = this.state.optionHTML
    //     var newHTML = { 'options': [] }
    //     for (var i = 0; i < oldOptionHTML.options.length; i++) {
    //         if (i === (data_id)) {
    //             newHTML.options.push({ 'id': String(data_id + 1), 'value': html })
    //         } else {
    //             newHTML.options.push(oldOptionHTML.options[i])

    //         }
    //     }
    //     this.setState({
    //         optionHTML: newHTML
    //     });
    //     // console.log(data_id, html, oldOptionHTML, newHTML)

    // }

    handleCheckBoxToggle = event => {
        this.setState({
            isLive:!this.state.isLive
        });
    }
    

    handleAddQuestionClose = () => {
        this.props.actions.closeAddQuestion({});
        this.props.actions.closeAddSectionQuestion({});
      }

      handleEditQuestionClose = () =>{
        this.props.actions.setEmptyEditQuestion({});
        this.props.actions.setEmptyEditSectionQuestion({})
        // if (this.props.editQuestion){
        //     this.props.actions.editQuestion({result:this.props.editQuestion})                
        // }else if(this.props.editSectionQuestion){
        //     this.props.actions.editSectionQuestion({result:this.props.editSectionQuestion})                
        // }
        
    }
  
    


    handleSaveQuestion = () =>{
        this.SaveQuestion('save');
        scroller.scrollTo("edit-question-div-2", {
            duration: 800,
            delay: 0,
            smooth: 'easeInOutQuart',
            offset:-150
          });
    }
    
    handleSaveContinueQuestion = () =>{
        this.SaveQuestion('continue');
    }

    checkError = () => {
        var noError = true
        var errorMessage = ""
        // var Options = this.state.optionHTML.options;
        // var optionValList = Options.map((row)=> {
        //     return changeCase.lowerCase(htmlToText.fromString(row.value, {
        //         ignoreHref:true
        //     }));
        // });

        

        // optionValList.map((data) => {
        //     if (optionValList.filter(i => i === data).length > 1 ){
        //         noError = false;
        //         errorMessage = "Duplicate Option Values!"
        //     }
        //     if (data == "" ){
        //         noError = false;
        //         errorMessage = "Missing Option Value!"
        //     }
        // });
        // console.log(noError)
        // console.log(this.state.correctAnswer.answer.length);
        // if (this.state.correctAnswer.answer.length == 0){
        //     noError = false;
        //     errorMessage = "Missing Correct Answer!"
        // }

        if (htmlToText.fromString(this.state.questionHTML, {ignoreHref:true}) == ""){
            noError = false;
            errorMessage = "Missing Question Text!"
        }


        if (!noError){
            this.props.actions.addFlag({
                message: errorMessage,
                appearance: "warning"
              });        
        }
        return noError
    
    }


    SaveQuestion = (type) => {
        const submitCheck = this.checkError();
        if (submitCheck){
        console.log(type)
        const optionDict = JSON.stringify({})
        const correctAns = JSON.stringify({});
        if(this.props.editQuestion === null && this.props.editSectionQuestion ===null){
        console.log(this.props.folderValue)
        const payloadSend = {
            operation: "create",
            question_text: this.state.questionHTML,
            question_type: this.props.questionType.value,
            topic_id: this.props.topicId ? this.props.topicId.value : '',
            num_set: 1,
            difficulty: this.props.difficulty ? this.props.difficulty.value : '',
            is_passage: this.props.isPassage === true ? 1 : 0,
            passage_id: this.props.passageId,
            option_dict: optionDict,
            correct_dict: correctAns,
            folder_id: this.props.folderValue ? this.props.folderValue.value : '',
            solution: this.state.solutionHTML,
            is_live: this.state.isLive === true ? 1 : 0,
            positive_marks : this.props.positiveMarks ? this.props.positiveMarks : '',
            negative_marks : this.props.negativeMarks ?  this.props.negativeMarks : '',
            section_id : this.props.sectionId ? this.props.sectionId : ''
          }
        console.log(this.props.folderValue,payloadSend);
        api(this.props.sectionId ? url_sectionquestion : url_ques , payloadSend)
        .then(response => {
          const { result, message, status } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (status ? "normal" :  "warning")
          });    
          if (status){
              if(type==="save"){    
            console.log("save")
                    if (this.props.sectionId){
                        this.props.actions.addSectionQuestion({result:result[0],continueSectionQuestion:false,individualQues:null})
                    }else{
                        this.props.actions.addQuestion({result:result[0],continueQues:false,individualQues:null})
                    }
              }else{
                console.log("continue")
                const questionData = {
                    questionType:this.props.questionType,
                    topicId: this.props.topicId,
                    difficulty:this.props.difficulty,
                    isPassage:this.props.isPassage,
                    isNewPassage:!this.props.isPassageVerified,
                    passageId:this.props.passageId,
                    passageValue:this.props.passageHTML,
                    folderValue:this.props.folderValue,
                    positiveMarks : this.props.positiveMarks ? this.props.positiveMarks : '',
                    negativeMarks : this.props.negativeMarks ? this.props.negativeMarks : ''
        
                }
                this.setState(this.defaultState)
                    if (this.props.sectionId){
                        this.props.actions.addSectionQuestion({result:result[0],continueSectionQuestion:true,individualQues:questionData})
                    }else{
                        this.props.actions.addQuestion({result:result[0],continueQues:true,individualQues:questionData})
                    }

              } 
          }
        })
        .catch(error => console.log(error))
        }
        else{
            const payloadSend = {
                operation: "update",
                question_text: this.state.questionHTML,
                question_type: this.props.questionType.value,
                topic_id: this.props.topicId ? this.props.topicId.value : '',
                data_id:this.state.dataId,
                num_set: 1,
                difficulty: this.props.difficulty ? this.props.difficulty.value : '',
                is_passage: this.props.isPassage === true ? 1 : 0,
                is_live: this.state.isLive === true ? 1 : 0,
                passage_id: this.props.passageId,
                option_dict: optionDict,
                correct_dict: correctAns,
                folder_id: this.props.folderValue.value,
                solution: this.state.solutionHTML,
                positive_marks : this.props.positiveMarks ? this.props.positiveMarks : '',
                negative_marks : this.props.negativeMarks ?  this.props.negativeMarks : '',
                section_id : this.props.sectionId ? this.props.sectionId : '' 
              }

        api(this.props.sectionId ? url_sectionquestion : url_ques, payloadSend)
          .then(response => {
            const { result, message, status } = response;
            this.props.actions.addFlag({
                message: message,
                appearance: (status ? "normal" :  "warning")
            });    
            if(status){
                if (this.props.sectionId){
                    this.props.actions.editSectionQuestion({result:result[0]})                
                }else{
                    this.props.actions.editQuestion({result:result[0]})                
                }
            }
            }
          )
          .catch(error => console.log(error))
        }
    }
};    
componentWillMount = () => {
    if (this.props.editQuestion){
        if (this.props.questionType.value != this.props.editQuestion.question_type.value){
            if (this.props.questionType.value === "mcq_single"){
                this.setState({
                    correctAnswer:{'answer':''}
                })
            }else if (this.props.questionType.value === "mcq_multiple"){
                this.setState({
                    correctAnswer:{'answer':[]}
                })
            }else if(this.props.questionType.value === 'word' || this.props.questionType.value === 'number' ){
                this.setState({
                    correctAnswer:{'answer':''}
                })
            }else if(this.props.questionType.value === 'chooseorder' || this.props.questionType.value === 'essay' ){
                this.setState({
                    correctAnswer:{}
                })
            }
        }
    }else if(this.props.editSectionQuestion){
        if (this.props.questionType.value != this.props.editSectionQuestion.question_type.value){
            if (this.props.questionType.value === "mcq_single"){
                this.setState({
                    correctAnswer:{'answer':''}
                })
            }else if (this.props.questionType.value === "mcq_multiple"){
                this.setState({
                    correctAnswer:{'answer':[]}
                })
            }else if(this.props.questionType.value === 'word' || this.props.questionType.value === 'number' ){
                this.setState({
                    correctAnswer:{'answer':''}
                })
            }else if(this.props.questionType.value === 'chooseorder' || this.props.questionType.value === 'essay' ){
                this.setState({
                    correctAnswer:{}
                })
            }
        }
    }
    
}



    render() {
        const editQuestion = this.props.editQuestion;
        const editSectionQuestion = this.props.editSectionQuestion;
        // let renderOptions = null
        // renderOptions = [...Array(this.state.numOptions)].map((row, key) => {
        //     // var isOptionSelected = false
        //     // if(this.state.correctAnswer.answer.indexOf(String(key+1)) >= 0 ){
        //     //     isOptionSelected = true
        //     // }else{
        //     //     isOptionSelected = false
        //     // }
            
        //     return (
        //         <div key={key} className="option-mcq-creator">
        //             {/* <div className="option-radio-button">
        //                 <div className="radio-mcq-multiple">
        //                 <Checkbox
        //                     value={key + 1}
        //                     data-id={key + 1}
        //                     onChange={this.onCheckboxChange}
        //                     name="options"
        //                     defaultChecked={isOptionSelected}
        //                 />
        //                 </div>
        //             </div>

        //  */}
        //             <div className="option-alpha-value">
        //                 {toLetters(key + 1)}
        //             </div>
        //             <div className="option-editor">
        //                 <EditorQuestion
        //                     onChange={html => this.handleOptionChange(html, key)}
        //                     html={(this.state.optionHTML.options)[key].value}
        //                 />
        //             </div>
        //         </div>
        //     );
        // });
        return (
            <Element name="edit-question-div-2" className="question-creator-div">
                <div>
                    <div className="field-div-2">
                        <span className="field-label">Question</span>
                        <EditorQuestion
                            onChange={this.handleQuestionChange}
                            html={this.state.questionHTML}
                        />
                    </div>
                </div>
                <div>
                    <div className="field-div-2">
                        <span className="field-label">Solution</span>
                        <EditorQuestion
                            onChange={this.handleSolutionChange}
                            html={this.state.solutionHTML}
                        />
                    </div>
                </div>
                {!(!this.props.topicId || !this.props.difficulty || (htmlToText.fromString(this.state.solutionHTML, {ignoreHref:true}) == "" )) && (
                <div className="live-ready-checkbox">
                <div className="checkbox-container">
                    <Checkbox2
                    color={checkboxTheme}
                    size={3}
                    tickSize={3}
                    borderThickness={2}
                    className="checkbox-style-dashboard"
                    onChange={this.handleCheckBoxToggle}
                    checked={this.state.isLive}
                    />
                </div>
                <div className="confirmation-live">
                    The question is live ready!
                </div>
            </div>
                
                )}
                <div className="submit-button-row">
                    <div className="button-save">
                    {!this.props.sectionId && (
                        <Button onClick={this.handleSaveQuestion} appearance="primary">
                            {( editQuestion )? 'Update' : 'Add'} 
                        </Button>
                      )}
                      {this.props.sectionId && (
                        <Button onClick={this.handleSaveQuestion} appearance="primary">
                            {( editSectionQuestion )? 'Update' : 'Add'} 
                        </Button>
                      )}

                    </div>
                    <div className="button-save">
                    {!this.props.sectionId && !editQuestion && (
                        <Button onClick={this.handleSaveContinueQuestion} appearance="primary">
                            Add and Continue
                        </Button>
                    )}
                      {this.props.sectionId && !editSectionQuestion && (
                        <Button onClick={this.handleSaveContinueQuestion} appearance="primary">
                            Add and Continue
                        </Button>
                      )}

                    </div>
                    <div className="button-save">
                    <Button onClick={editQuestion || editSectionQuestion ? this.handleEditQuestionClose: this.handleAddQuestionClose} appearance="normal">
                        Close
                    </Button>
                    </div>
                </div>
            </Element>
        );

    }
}

Essay.propTypes = {
    // questionType: PropTypes.object || PropTypes.string,
    // topicId: PropTypes.object || PropTypes.string,
    // difficulty: PropTypes.object || PropTypes.string,
    isPassage: PropTypes.bool,
    isPassageVerified: PropTypes.bool,
    passageId: PropTypes.string,
    // folderValue: PropTypes.string
};

function mapStateToProps(store) {
    return {
        ...store.question,
        ...store.sectionquestion
    };
}


function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ ...question,...sectionquestion, ...flag }, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Essay);
