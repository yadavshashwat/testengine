// React
import React, { Component } from 'react';
import PropTypes from "prop-types";
// Styles
import "../../css/dashboard.css"

// Backend Connection
import { api } from "../../helpers/api.js";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../../redux/actions/flag";
import question from "../../redux/actions/question";
import sectionquestion from "../../redux/actions/sectionquestion";

// Atlaskit Packages

import Button from '@atlaskit/button';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Grid, GridColumn } from '@atlaskit/page';
import TextField from '@atlaskit/textfield';
import Select from "@atlaskit/select";
import { ToggleStateless } from '@atlaskit/toggle';


//Icons
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
// Components
import McqSingle from "./QuestionCreator/McqSingle"
import McqMultiple from "./QuestionCreator/McqMultiple"
import ChooseOrder from "./QuestionCreator/ChooseOrder"
import Word from "./QuestionCreator/Word"
import Number from "./QuestionCreator/Number"
import Essay from "./QuestionCreator/Essay"

import EditorInstructions from "../Editors/EditorInstructions"

// Other Packages
var changeCase = require("change-case");

// api url path
var url = "/question/crud_passages/";


class AddEditQuestion extends Component {
  constructor(props) {
    super(props);
    const editQuestion = this.props.editQuestion;
    const editSectionQuestion = this.props.editSectionQuestion;
    if(editQuestion){
        this.state = {
          questionTypeValue: editQuestion.question_type,
          topicValue:editQuestion.topic.id ? {'value':editQuestion.topic.id,'label':changeCase.titleCase(editQuestion.topic.sub_category)} : '',
          difficultyValue:editQuestion.difficulty_user ? {'value':editQuestion.difficulty_user,'label':editQuestion.difficulty_user} : '',
          isPassageChecked:editQuestion.passage.id ? true : false,
          passageId:editQuestion.passage.id,
          passageValue:editQuestion.passage.passage,
          isNewPassage:editQuestion.passage.id ? false : true,
          folderValue: {'value' : editQuestion.question_folder.id, 'label':editQuestion.question_folder.folder_name},
          positiveMarks : editQuestion.positive_marks ? editQuestion.positive_marks : '',
          negativeMarks : editQuestion.negative_marks ? editQuestion.negative_marks : ''
        };

    }else if(editSectionQuestion){
      this.state = {
        questionTypeValue: editSectionQuestion.question_type,
        topicValue: editSectionQuestion.topic.id ? {'value':editSectionQuestion.topic.id,'label':changeCase.titleCase(editSectionQuestion.topic.sub_category)} : '',
        difficultyValue:editSectionQuestion.difficulty_user ? {'value':editSectionQuestion.difficulty_user,'label':editSectionQuestion.difficulty_user} : '',
        isPassageChecked:editSectionQuestion.passage.id ? true : false,
        passageId:editSectionQuestion.passage.id,
        passageValue:editSectionQuestion.passage.passage,
        isNewPassage:editSectionQuestion.passage.id ? false : true,
        folderValue: {'value' : editSectionQuestion.question_folder.id, 'label':editSectionQuestion.question_folder.folder_name},
        positiveMarks : editSectionQuestion.positive_marks ? editSectionQuestion.positive_marks : '1',
        negativeMarks : editSectionQuestion.negative_marks ? editSectionQuestion.negative_marks : '0'
      };

    }else{
      if(this.props.continueQues){
        this.state = {
          questionTypeValue: this.props.individualQues.questionType,
          topicValue:this.props.individualQues.topicId ? this.props.individualQues.topicId : '',
          difficultyValue:this.props.individualQues.difficulty ? this.props.individualQues.difficulty : '',
          isPassageChecked:this.props.individualQues.isPassage,
          passageId:this.props.individualQues.passageId,
          passageValue:this.props.individualQues.passageValue,
          isNewPassage:false,
          folderValue:this.props.individualQues.folderValue,
          positiveMarks:this.props.individualQues.positiveMarks ? this.props.individualQues.positiveMarks : '' ,
          negativeMarks:this.props.individualQues.negativeMarks ? this.props.individualQues.negativeMarks : ''
        };
      }else if(this.props.continueSectionQuestion){
        this.state = {
          questionTypeValue: this.props.individualSectionQues.questionType,
          topicValue:this.props.individualSectionQues.topicId ? this.props.individualSectionQues.topicId : '',
          difficultyValue:this.props.individualSectionQues.difficulty ? this.props.individualSectionQues.difficulty : '',
          isPassageChecked:this.props.individualSectionQues.isPassage,
          passageId:this.props.individualSectionQues.passageId,
          passageValue:this.props.individualSectionQues.passageValue,
          isNewPassage:false,
          folderValue:this.props.individualSectionQues.folderValue,
          positiveMarks:this.props.individualSectionQues.positiveMarks,
          negativeMarks:this.props.individualSectionQues.negativeMarks
        };

      }else{
        this.state = {
          questionTypeValue: {'value':'mcq_single','label':'MCQ Single'},
          topicValue:'',
          difficultyValue:'',
          isPassageChecked:false,
          passageId:"",
          passageValue:"",
          isNewPassage:true,
          folderValue: this.props.folderValue ? this.props.folderValue : '',
          positiveMarks: this.props.sectionPositiveMarks ? this.props.sectionPositiveMarks : '1',
          negativeMarks: this.props.sectionNegativeMarks ? this.props.sectionNegativeMarks : '0'  
        };
      }
    }

  }

  handleQuestionTypeChange = value => {
      this.setState({ questionTypeValue: value })
  };

  handleTopicChange = value => {
    this.setState({ topicValue: value })
  }

  handleDifficultyChange = value => {
    this.setState({ difficultyValue: value })

  }

  handleFolderChange = value => {
    this.setState({ folderValue: value })

  }

  handlePositiveMarksChange = event => {
    var data = event.target.value
    if (data > 0) {
      this.setState({
        positiveMarks: data,
        isPositiveMarksValid: true
      });
    } else {
      this.setState({
        positiveMarks: '',
        isPositiveMarksValid: false
      });
    }
  };
  
  handleNegativeMarksChange = event => {
    var data = event.target.value
    if (data >= 0) {
      this.setState({
        negativeMarks: data,
        isNegativeMarksValid: true
      });
    } else {
      this.setState({
        negativeMarks: '',
        isNegativeMarksValid: false
      });
    }
  };
  


  handleIsPassageChange = () => {
    this.setState({
      isPassageChecked: !this.state.isPassageChecked,
      passageId: "",
      passageValue:"",
      isNewPassage:true
    });

  }


  handlePassageIdChange = event => {
    var data = event.target.value
    if (data === ""){
      this.setState({ passageId: data,
        isNewPassage:true,
        passageValue:""
      });
    }else if (data.length < 24){
      this.setState({ passageId: data,
        isNewPassage:true,
        passageValue:""
    });

  }else if (data.length > 24){
    this.setState({ 
      isNewPassage:true,
      passageValue:""
    });

  }else{

    this.setState({ passageId: data}, () => {
      this.handlePassageValidate();
    });

    
  }
  };

  



  
  handlePassageModalOpen = () => {
    if(this.state.isNewPassage){
      this.setState({
        isPassageModalOpen: true,
        passageValue:"",
        passageId:"",
      });
    }else{
      this.setState({
        isPassageModalOpen: true,
      });
  
    }
  }



  handlePassageValidateBlur = event =>{
    var data = event.target.value
    if (data.length !== 24){
      this.handlePassageValidate();
    }
}

  handlePassageValidate = () =>{
    if (this.state.passageId.length){
      api(url, {
        "operation": "validate",
        "data_id": this.state.passageId
      }).then(response => {
        const { result, message, status } = response;
        this.props.actions.addFlag({
          message: message,
          appearance: (status ? "normal" :  "warning")
        });    
        if(status){
          this.setState({ isNewPassage: false,
          passageValue:result[0].passage });
        }else{
          this.setState({ isNewPassage: true,passageValue:"" });
        }
      });
    }
  }

  handleAddEditPassage = () => {
    if (this.state.isNewPassage){
      api(url, {
        "operation": "create",
        "text": this.state.passageValue
      }).then(response => {
        const { result, message, status } = response;
        this.props.actions.addFlag({
          message: message,
          appearance: (status ? "normal" :  "warning")
        });    
        if(status){
          this.setState({ passageId: result[0].id, 
                        isPassageModalOpen: false,
                        isNewPassage:false
                         });
        }
      });
    }else{
      api(url, {
        "operation": "update",
        "text": this.state.passageValue,
        "data_id":this.state.passageId
      }).then(response => {
        const { message, status } = response;
        this.props.actions.addFlag({
          message: message,
          appearance: (status ? "normal" :  "warning")
        });    
        if(status){
          this.setState({ isPassageModalOpen: false,isNewPassage:false });
        }
      });

    }
  }

  handlePassageModalClose = () => {
    this.setState({
      isPassageModalOpen: false,
    })
  }

  handlePassageChange = html => {
    this.setState({
      passageValue:html
    });
  }




  handleAddQuestionClose = () => {
    this.props.actions.closeAddQuestion({});
    this.props.actions.closeAddSectionQuestion({});
  }

  handleEditQuestionClose = () =>{
      this.props.actions.setEmptyEditQuestion({});
      this.props.actions.setEmptyEditSectionQuestion({});
  }

  render() {

    const editQuestion = this.props.editQuestion;          
    const editSectionQuestion = this.props.editSectionQuestion;                  
    let renderQuestionType = null;
    if(this.state.questionTypeValue.value === 'mcq_single'){
      renderQuestionType = <McqSingle questionType={this.state.questionTypeValue} 
                                topicId={this.state.topicValue}
                            difficulty={this.state.difficultyValue}
                              isPassage={this.state.isPassageChecked}
                              passageId={this.state.passageId}
                              folderValue={this.state.folderValue}
                            isPassageVerified={this.state.isNewPassage}
                            passageHTML={this.state.passageValue}
                            positiveMarks = {this.state.positiveMarks}
                            negativeMarks = {this.state.negativeMarks}
                            sectionId = {this.props.sectionId}
                            />;

    }else if(this.state.questionTypeValue.value === 'mcq_multiple'){
      renderQuestionType = <McqMultiple questionType={this.state.questionTypeValue} 
                                topicId={this.state.topicValue}
                            difficulty={this.state.difficultyValue}
                              isPassage={this.state.isPassageChecked}
                              passageId={this.state.passageId}
                              folderValue={this.state.folderValue}
                            isPassageVerified={this.state.isNewPassage}
                            passageHTML={this.state.passageValue}
                            positiveMarks = {this.state.positiveMarks}
                            negativeMarks = {this.state.negativeMarks}
                            sectionId = {this.props.sectionId}
                            />;

    }else if(this.state.questionTypeValue.value === 'chooseorder'){
      renderQuestionType = <ChooseOrder questionType={this.state.questionTypeValue} 
                                topicId={this.state.topicValue}
                            difficulty={this.state.difficultyValue}
                              isPassage={this.state.isPassageChecked}
                              passageId={this.state.passageId}
                              folderValue={this.state.folderValue}
                            isPassageVerified={this.state.isNewPassage}
                            passageHTML={this.state.passageValue}
                            positiveMarks = {this.state.positiveMarks}
                            negativeMarks = {this.state.negativeMarks}
                            sectionId = {this.props.sectionId}
                            />;
    }else if(this.state.questionTypeValue.value === 'word'){
      renderQuestionType = <Word questionType={this.state.questionTypeValue} 
                                topicId={this.state.topicValue}
                            difficulty={this.state.difficultyValue}
                              isPassage={this.state.isPassageChecked}
                              passageId={this.state.passageId}
                              folderValue={this.state.folderValue}
                            isPassageVerified={this.state.isNewPassage}
                            passageHTML={this.state.passageValue}
                            positiveMarks = {this.state.positiveMarks}
                            negativeMarks = {this.state.negativeMarks}
                            sectionId = {this.props.sectionId}
                            />;
    }else if(this.state.questionTypeValue.value === 'number'){
      renderQuestionType = <Number questionType={this.state.questionTypeValue} 
                                topicId={this.state.topicValue}
                            difficulty={this.state.difficultyValue}
                              isPassage={this.state.isPassageChecked}
                              passageId={this.state.passageId}
                              folderValue={this.state.folderValue}
                            isPassageVerified={this.state.isNewPassage}
                            passageHTML={this.state.passageValue}
                            positiveMarks = {this.state.positiveMarks}
                            negativeMarks = {this.state.negativeMarks}
                            sectionId = {this.props.sectionId}
                            />;
    }else if(this.state.questionTypeValue.value === 'essay'){
      renderQuestionType = <Essay questionType={this.state.questionTypeValue} 
                                topicId={this.state.topicValue}
                            difficulty={this.state.difficultyValue}
                              isPassage={this.state.isPassageChecked}
                              passageId={this.state.passageId}
                              folderValue={this.state.folderValue}
                            isPassageVerified={this.state.isNewPassage}
                            passageHTML={this.state.passageValue}
                            positiveMarks = {this.state.positiveMarks}
                            negativeMarks = {this.state.negativeMarks}
                            sectionId = {this.props.sectionId}
                            />;
    }


    return (
      <div className="add-question">
          <div className="add-edit-question-div">
                <div className="question-header">
                  {!this.props.sectionId && (
                  <div className="question-add-header">{(editQuestion) ? 'Edit' :'Add'} Question</div>  
                  )}
                  {this.props.sectionId && (
                  <div className="question-add-header">{(editSectionQuestion) ? 'Edit' :'Add'} Question</div>  
                  )}
                  <div className="close-add-question" >
                  {!this.props.sectionId && (
                      <CrossCircleIcon onClick={(editQuestion) ? this.handleEditQuestionClose :this.handleAddQuestionClose}></CrossCircleIcon>
                  )}
                  {this.props.sectionId && (
                      <CrossCircleIcon onClick={(editSectionQuestion) ? this.handleEditQuestionClose :this.handleAddQuestionClose}></CrossCircleIcon>
                  )}
                  </div>
                </div>
                <Grid>

                  { this.props.sectionId && (
                    <GridColumn medium={6}>
                      <div className="field-div">
                          <span className="field-label">Question Bank<span className="is-required">*</span></span>
                          <Select
                            name="folderValue"
                            options={this.props.folderOptions}
                            // placeholder="CAT QBank 1..."
                            onChange={this.handleFolderChange}
                            value= {this.state.folderValue}
                          />
                      </div>
                    </GridColumn>
                    )}
                    { this.props.sectionId && (
                    <GridColumn medium={3}>
                    <div className="field-div">
                      <span className="field-label">Positive Marks</span>
                        <TextField 
                            // placeholder="1,2,3.."
                            name="positiveMarks" 
                            label="1,2,3,.." 
                            onChange={this.handlePositiveMarksChange}
                            value={this.state.positiveMarks}
                            />
                    </div>
                    </GridColumn>
                    )}
                    { this.props.sectionId && (
                    <GridColumn medium={3}>
                    <div className="field-div">
                    <span className="field-label">Negative Marks</span>
                        <TextField 
                            // placeholder="0,1,2.."
                            name="negativeMarks" 
                            label="1,2,3,.." 
                            onChange={this.handleNegativeMarksChange}
                            value={this.state.negativeMarks}
                            />
                    </div>
                    </GridColumn>
                  )}
                  <GridColumn medium={3}>
                  <div className="field-div">
                      <span className="field-label">Type</span>
                      <Select
                        name="questionTypeValue"
                        options={this.props.questionTypeOptions}
                        // placeholder="MCQ etc."
                        onChange={this.handleQuestionTypeChange}
                        value= {this.state.questionTypeValue}
                      />
                  </div>
                  </GridColumn>
                  <GridColumn medium={3}>
                  <div className="field-div">
                      <span className="field-label">Topic</span>

                    <Select
                      name="topicValue"
                      options={this.props.topicOptions}
                      // placeholder="Algebra etc."
                      onChange={this.handleTopicChange}
                      value= {this.state.topicValue}
                    />
                  </div>
                  </GridColumn>
                  <GridColumn medium={1}>
                  <div className="field-div">
                      <span className="field-label">Difficulty</span>
                    <Select
                      name="difficultyValue"
                      options={this.props.difficultyOptions}
                      // placeholder="1,2"
                      onChange={this.handleDifficultyChange}
                      value= {this.state.difficultyValue}
                    />
                  </div>
                  </GridColumn>
                  <GridColumn medium={1}>
                    <div className="field-div">
                      <span className="field-label">Passage?</span>
                      <div className="passage-toggle-button">
                      <ToggleStateless isChecked={this.state.isPassageChecked}
                        name="isPassageChecked"
                        size="large"
                        onChange={this.handleIsPassageChange}
                      />
                      </div>
                    </div>
                  </GridColumn>
                  <GridColumn medium={3}>
                  { this.state.isPassageChecked && (
                    <div className="field-div">
                      <span className="field-label">Passage ID</span>
                        <TextField 
                            placeholder="ID"
                            isInvalid={this.state.isNewPassage && (this.state.passageId.length > 0)}
                            name="passageId" 
                            label="Passage ID" 
                            onBlur={this.handlePassageValidateBlur}
                            onChange={this.handlePassageIdChange}
                            value={this.state.passageId}
                            />
                    </div>
                  )}
                  
                    </GridColumn>
                  <GridColumn medium={1}>
                    { this.state.isPassageChecked && (
                    <div className="passage-add-button" >
                      <Button appearance="default" isSelected={!this.state.isNewPassage} onClick={this.handlePassageModalOpen}>
                          {(this.state.isNewPassage ? 'New' : 'Edit') }
                      </Button>
                    </div>
                    )}
                  </GridColumn>
                </Grid>
                <Grid>
                    {renderQuestionType}
                </Grid>
                <Grid>
                </Grid>
          </div>
          {this.state.isPassageModalOpen && (
        <ModalTransition>
            <Modal  autoFocus={false}  width={'60%'} actions={
              [ 
                { text: (this.state.isNewPassage ? 'New Passage' : 'Edit Passage') , appearance: 'primary', onClick: this.handleAddEditPassage },
                { text: 'Close', appearance: 'normal', onClick: this.handlePassageModalClose },
              ]
            } onClose={this.handlePassageModalClose} heading={(this.state.isNewPassage ? 'New Passage' : 'Edit Passage') }>
              <Grid>
                <GridColumn medium={12}>
                    <div className="passage-editor">
                        <EditorInstructions
                        onChange={this.handlePassageChange}
                            html={this.state.passageValue}
                        />
                    </div>

                </GridColumn>
              </Grid>
            </Modal>
        </ModalTransition>
        
        )}
      </div>

    );
  }
}

function mapStateToProps(store) {
  return {
    ...store.question,
    ...store.sectionquestion,
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...question,...sectionquestion, ...flag }, dispatch)
  };
}

AddEditQuestion.propTypes = {
  difficultyOptions: PropTypes.array,
  questionTypeOptions: PropTypes.array,
  topicOptions: PropTypes.array,
  folderId: PropTypes.string
};



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddEditQuestion);
