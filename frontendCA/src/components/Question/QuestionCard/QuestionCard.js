// React
import React, { Component } from 'react';
import PropTypes from "prop-types";
// Styles
// import "../css/dashboard.css"
import "../../../css/dashboard.css"
// Backend Connection
import { api } from "../../../helpers/api.js";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../../../redux/actions/flag";
import question from "../../../redux/actions/question";
import sectionquestion from "../../../redux/actions/sectionquestion";

// Atlaskit Packages
import Button from '@atlaskit/button';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Grid, GridColumn } from '@atlaskit/page';
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import Lozenge from "@atlaskit/lozenge";
import Tag from '@atlaskit/tag';

//Icons
import CopyIcon from '@atlaskit/icon/glyph/copy';
import Arrow from '@atlaskit/icon/glyph/arrow-right';
import HipchatChevronUpIcon from '@atlaskit/icon/glyph/hipchat/chevron-up';
import HipchatChevronDownIcon from '@atlaskit/icon/glyph/hipchat/chevron-down';
// Components
import AddEditQuestion from "../AddEditQuestion"
// Other Packages
import styled from "styled-components";
import Checkbox from 'react-simple-checkbox';
import Parser from "html-react-parser";
import { CopyToClipboard } from 'react-copy-to-clipboard';
var changeCase = require("change-case");


// api url path
var url = "/question/crud_questions/";

var url_secquestions = "/question/crud_sectionquestions/";

const deleteConfMessage = "Are you sure you want to delete the question? Note: Questions in live tests can't be deleted. Question will be removed from all the tests which are not live."
const deleteConfHeader = "Confirm Question Deletion"

const deleteConfMessageSec = "Are you sure you want to delete the question? Note: Questions in live tests can't be deleted. Question will be removed from this test and will remain in the question bank"

function toLetters(num) {
  var mod = num % 26,
    pow = num / 26 | 0,
    out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? toLetters(pow) + out : out;
}


const checkboxTheme = {
  backgroundColor:'#fff', 
  borderColor:'#0847A6', 
  uncheckedBorderColor:'#243859', 
  tickColor:'#0847A6'     
}

class QuestionCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConfModalOpen: false,
      isPassageModalOpen: false,
      isSolutionModalOpen: false,
    };
  }

  handleConfModalOpen = event => {
    this.setState({
      isConfModalOpen: true,
    })
  }

  handleConfModalClose = () => {
    this.setState({
      isConfModalOpen: false,
    })
  }


  handlePassageModalOpen = event => {
    this.setState({
      isPassageModalOpen: true,
    })
  }

  handlePassageModalClose = () => {
    this.setState({
      isPassageModalOpen: false,
    })
  }

  handleSolutionModalOpen = event => {
    this.setState({
      isSolutionModalOpen: true,
    })
  }

  handleSolutionModalClose = () => {
    this.setState({
      isSolutionModalOpen: false,
    })
  }


  handleDelete = () => {
    const dataId = this.props.data.id
    api(this.props.sectionId ? url_secquestions : url, {
      operation: "delete",
      data_id: dataId,
      section_id:this.props.sectionId ? this.props.sectionId : ''
    }).then(response => {
      const { status, message } = response;
      // this.props.actions.addFlag({
      //   message: message,
      //   appearance: (status ? "normal" : "warning")
      // });
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {

        if (this.props.sectionId){
          // this.props.actions.removeSectionQuestion({
          //   dataID: dataId©
          // });  

          api(url_secquestions, { operation: "read", page_num: this.props.pageNum, page_size: this.props.pageSize.value, section_id: this.props.sectionId }).then(response => {
            const { result, status, total_records } = response;
            // this.props.actions.addFlag({
            //   message: message,
            //   appearance: (status ? "normal" : "warning")
            // });
            if (status) {
              this.props.actions.setSectionQuestionList({
                sectionQuestionList: result,
                totalSectionQuestions: total_records,
                setTotal: true
              });
            }});

        }else{
          this.props.actions.removeQuestion({
            dataID: dataId
          });
        }
        // To Handle Delete
        this.handleConfModalClose();
      } else {
        this.setState({
          loaded: true
        })
      }
    });
  }


  handleEditQuestion = event => {
    if (this.props.sectionId){
      this.props.actions.setEditSectionQuestion({ editSectionQuestion: this.props.data })
    }else{
      this.props.actions.setEditQuestion({ editQuestion: this.props.data })
    }

  }

  
  handleCopyPassageId = event => {
    this.props.actions.addFlag({
      message: "Passage ID Copied!",
      appearance: "normal"
    });
  }

  handleMovement = (direction) =>{
    const dataId = this.props.data.id
    const pageNum = this.props.pageNum
    const pageSize = this.props.pageSize

    api(url_secquestions, {
      operation: "order_change",
      data_id: dataId,
      up_down: direction,
      page_num: pageNum,
      page_size:pageSize.value,
      section_id:this.props.sectionId
    }).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.changeSectionQuestionOrder({
          result:result
        })
  
      }
    });

  }

moveUpOrder = () => {
  this.handleMovement('up')
}

moveDownOrder = () => {
  this.handleMovement('down')
}




  handleCheckBoxToggle = event => {
    const dataId = this.props.data.id;
    if (this.props.sectionId){
      const selected = (this.props.selectedSectionQuestionId.indexOf(dataId)>=0)
      if(selected){
          this.props.actions.removeSelectedSectionQuestion({id:dataId});
      }else{
          this.props.actions.addSelectedSectionQuestion({id:dataId});
      }
  

    }else{
      const selected = (this.props.selectedQuestionId.indexOf(dataId)>=0)
      if(selected){
          this.props.actions.removeSelectedQuestion({id:dataId});
      }else{
          this.props.actions.addSelectedQuestion({id:dataId});
      }
  
    }
  }

  handleMakeLive = () =>{
    this.makeLiveOffline(true);
  }

  handleMakeOffline = () =>{
    this.makeLiveOffline(false);
    
  }


  makeLiveOffline = (isLive) =>{
    api(this.props.sectionId ? url_secquestions : url , { operation: "live", question_ids:  this.props.data.id, is_live : isLive ? '1' : 0, section_id : this.props.sectionId ? this.props.sectionId : '' }).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" :  "warning")
      });
      if (status){
        if (this.props.sectionId){
          this.props.actions.editSectionQuestion({result:result[0]})                
        }else{
          this.props.actions.editQuestion({result:result[0]})                
        }

      }
      
  })
}
  render() {
    const data = this.props.data;
    const DropdownStatusItem = styled.div`
        align-items: center;
        display: flex;
        width: 60px;
    `;

    
    let renderOptionsElement = null;
    if (data){
      if (['mcq_single', 'mcq_multiple'].indexOf(data.question_type.value) >= 0) {

        renderOptionsElement = (data.answer_options["options"]).map((row, key) => {
          if (((data.correct_answer)["answer"]).indexOf(row.id) >= 0) {
            return (
              <span key={key} className="option option-correct">
                <span key={key} className="option-letter option-letter-correct">{toLetters(row.id) + ")"}</span><span className="option-value option-value-correct">{Parser(row.value)}</span>
              </span>
            );
          } else {
            return (
              <span key={key} className="option">
                <span className="option-letter">{toLetters(row.id)})</span><span className="option-value">{Parser(row.value)}</span>
              </span>
            );
          }
        });
      } else if (['word', 'number'].indexOf(data.question_type.value) >= 0) {
  
        renderOptionsElement = (
          <span className="option">
            <span className="option-letter">Answer: </span><span className="option-value option-value-correct">{((data.correct_answer)["answer"])}</span>
          </span>
        );
  
      } else if (data.question_type.value === "essay") {
  
        renderOptionsElement = null
  
      } else if (data.question_type.value === "chooseorder"){
  
        renderOptionsElement = (data.answer_options["options"]).map((row, key) => {
          return (
            <span key={key} className="option">
              <span key={key} className="option-letter">{toLetters(row.id) + ")"}</span><span className="option-value">{Parser(row.value)}</span>
            </span>
          );
        });
  
      } else {
  
        renderOptionsElement = null
  
      }
  
  

    }


    let renderCourseTags = null;
    if (data){
      renderCourseTags = data.tests.map((row,key) => {
          return (
            <div key={key}><Tag text={row.test_name} color={row.is_live ? "green" : "purple" } /></div>
            // <Lozenge appearance={row.is_live ? "success" : "moved" }>{row.test_name}</Lozenge>
          )
      })
    }else{
      renderCourseTags = null;
    }
    

    // Rendering Question Details
    
     let renderQuestionDetailElement = (
       <div>
        <div className="question-details section-question">
          <div className={(data && data.is_passage && !this.props.addExisting ) ? "general-details-passage" : "general-details-wo-passage"}>
            <span className="detail-item">
              <span className="detail-name">Type: </span><span className="detail">{data ? (data.question_type.label) : ''}</span>
            </span>
            <span className="detail-item">
              <span className="detail-name">Topic Cat: </span><span className="detail">{data && data.topic.category ? changeCase.titleCase(data.topic.category): 'Undefined'}</span>
            </span>
            <span className="detail-item">
              <span className="detail-name">Topic: </span><span className="detail">{data  && data.topic.sub_category ? changeCase.titleCase(data.topic.sub_category) : 'Undefined'}</span>
            </span>
            <span className="detail-item">
              <span className="detail-name">Difficulty: </span><span className="detail">{data && data.difficulty_user ? data.difficulty_user : 'Undefined'}</span>
            </span>
            { this.props.addExisting && (
              <span className="detail-item">
                <span className="detail-name">Passage: </span><span className="detail">{(data && data.is_passage) ? 'Yes' : 'No'}</span>
              </span>
            )}
            
          </div>
          {(data && data.is_passage && !this.props.addExisting) && (
            <div className="passage-details">
            <div className="passage-button">
              <Button onClick={this.handlePassageModalOpen}
                isSelected
              >
                Passage
              </Button>
            </div>
          </div>
          )}
          {!this.props.addExisting && (
          <div className="operation-details">
          <div className="operation-dropdown">
            <DropdownMenu
              trigger="Options"
              triggerType="button"
              shouldFlip={true}
              role="bottom"
            >
              <DropdownItemGroup>
                  <DropdownItem
                    onClick={(data && data.is_live) ? this.handleMakeOffline.bind(this) : this.handleMakeLive.bind(this)}
                    elemAfter={
                      <DropdownStatusItem>
                        <Arrow label="" size="small" />
                        <Lozenge appearance={(data && data.is_live) ? "moved" : "success"}>{( data && data.is_live) ? "Offline" : "Live"}</Lozenge>
                      </DropdownStatusItem>
                  }
                >{(data && data.is_live) ? "Take Offline" : "Make Live"}</DropdownItem>
                <DropdownItem onClick={this.handleEditQuestion.bind(this)}>Edit</DropdownItem>
                <DropdownItem onClick={this.handleConfModalOpen.bind(this)}>Delete</DropdownItem>
              </DropdownItemGroup>
            </DropdownMenu>
          </div>
        </div>
          )}

        </div>
        
          <div className="question-details section-question">
            <div className="general-details-wo-passage">
            {this.props.sectionId && (
              <span>
              <span className="detail-item">
                <span className="detail-name">Postive Marks: </span><span className="detail">{data ? data.positive_marks : ''}</span>
              </span>
              <span className="detail-item">
                <span className="detail-name">Negative Marks: </span><span className="detail">{data ? data.negative_marks : ''}</span>
              </span>
              </span>
              )}
              {(data && data.tests.length > 0) && (
              <span className="detail-item">
              <span className="detail-name">Test Tags: </span><span className="tags-test">{renderCourseTags}</span>
            </span>

              ) }
            </div>
          </div>
        
        </div>
      );
    
    let deletemessage = null;
    if (this.props.sectionId){
      deletemessage = deleteConfMessageSec
    }else{
      deletemessage = deleteConfMessage
    }

    // Rendering Options
    //  If Added New Question
    var selected = false;
    if (this.props.sectionId){
      selected = false;
      if (data){
        selected = (this.props.selectedSectionQuestionId.indexOf(data.id)>=0)
      }else{
        selected = false
      }
  
    }else{
      selected = false;
      if (data){
        selected = (this.props.selectedQuestionId.indexOf(data.id)>=0)
      }else{
        selected = false
      }  
    }
    


    if ((this.props.editQuestion && (this.props.editQuestion.id === this.props.data.id)) || (this.props.editSectionQuestion && (this.props.editSectionQuestion.id === this.props.data.id))) {
      return (
        <div>
          <AddEditQuestion
            difficultyOptions={this.props.difficultyOptions}
            questionTypeOptions={this.props.questionTypeOptions}
            topicOptions={this.props.topicOptions}
            sectionId={this.props.sectionId}
            folderOptions = {this.props.folderOptions}
            // folderValue={this.props.folderValue}
          />
        </div>
      )
    } else {
      return (
        <div className="question-card">
          <div className="question-div">
            <div className="question-header">

              
                
                <div className={selected ? "question-checkbox-selected": "question-checkbox"}>
                  <div className="question-checkbox-container">
                  <Checkbox
                    color={checkboxTheme}
                    size={3}
                    tickSize={3}
                    borderThickness={2}
                    className="checkbox-style-dashboard"
                    onChange={this.handleCheckBoxToggle}
                    checked={selected}
                  />
                  </div>
                  <div className={selected ? "question-number-selected": "question-number"}
                  onClick={this.handleCheckBoxToggle}
              >
                Q { (data && this.props.sectionId)  ?  data.order : this.props.index}
              </div>

                </div>
                
              
              {!this.props.sectionId && (
                <div className="bank-name">
                  {(data && data.question_folder.id) ? data.question_folder.folder_name : 'None'}
                </div>
              )}
              {(data && this.props.sectionId && data.order > 1) && (
              <div className="move-up"  onClick={this.moveUpOrder}>
                <HipchatChevronUpIcon></HipchatChevronUpIcon>
              </div>
              )}
              {(data && this.props.sectionId && (data.order < this.props.totalSectionQuestions)) && (
              <div className="move-down" onClick={this.moveDownOrder}>
                <HipchatChevronDownIcon ></HipchatChevronDownIcon>
              </div>
              )}
              
              <div className="question-status">
                <Lozenge appearance={(data && data.is_live) ? "success" : "moved"}>{(data && data.is_live) ? "Live" : "Offline"}</Lozenge>
              </div>
              
            </div>
            {renderQuestionDetailElement}
            <div className="question-text-div  section-question">
              <div className="question-text">
                {data ? Parser(data.question_text) : ''}
              </div>
            </div>
            <div className="question-options-div  section-question">
              <div className="question-options">
                {renderOptionsElement}
              </div>
            </div>
            {!this.props.addExisting && (
            <div className="question-solution-div  section-question">
              <div className="solution-button">
                <Button onClick={this.handleSolutionModalOpen}
                  isSelected
                >
                  Solution
                </Button>
              </div>
            </div>
            )}
          </div>
          <ModalTransition>
            {this.state.isConfModalOpen && (
              <Modal  autoFocus={false}  actions={
                [
                  { text: 'Confirm', appearance: 'primary', onClick: this.handleDelete },
                  { text: 'Close', appearance: 'normal', onClick: this.handleConfModalClose }

                ]
              } onClose={this.handleConfModalClose} heading={deleteConfHeader}>
              {deletemessage}
                </Modal>

            )}
          </ModalTransition>
          <ModalTransition>
            {this.state.isSolutionModalOpen && (
              <Modal  autoFocus={false}  actions={
                [
                  { text: 'Close', appearance: 'normal', onClick: this.handleSolutionModalClose },
                ]
              } onClose={this.handleSolutionModalClose} heading={"Solution to Q "+ ((data && this.props.sectionId)  ?  data.order : this.props.index)}>
                <span className="solution-data">{data ? Parser(data.solution) : ''}</span>

              </Modal>

            )}
          </ModalTransition>
          <ModalTransition>
            {this.state.isPassageModalOpen && (
              <Modal  autoFocus={false}  actions={
                [
                  { text: 'Close', appearance: 'normal', onClick: this.handlePassageModalClose },
                ]
              } onClose={this.handlePassageModalClose} heading={"Linked Passage to Q " +  ((data && this.props.sectionId)  ?  data.order : this.props.index)}>
                <Grid>
                  <GridColumn medium={12}>
                    <span className="passage-detail-name">Passage id:  </span><span className="passage-id">{data ? data.passage.id : ''}  </span><CopyToClipboard onCopy={this.handleCopyPassageId} text={data ? data.passage.id : ''}><Button><CopyIcon size="small"></CopyIcon>Copy</Button></CopyToClipboard>
                  </GridColumn>
                  <GridColumn medium={12}>
                    <span className="passage-data">{data ? Parser(data.passage.passage) : ''}</span>
                  </GridColumn>
                </Grid>


              </Modal>

            )}
          </ModalTransition>
        </div>
      )
    }

  }
}

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

QuestionCard.propTypes = {
  data: PropTypes.object,
  index: PropTypes.number,
  difficultyOptions: PropTypes.array,
  questionTypeOptions: PropTypes.array,
  topicOptions: PropTypes.array,
  folderId: PropTypes.string
};


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestionCard);
