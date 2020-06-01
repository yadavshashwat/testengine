// React
import React, { Component } from 'react';
import PropTypes from "prop-types";
import { Link } from 'react-router';
// Styles
// import "../css/dashboard.css"
import "../../css/dashboard.css"
// Backend Connection
import { api } from "../../helpers/api";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../../redux/actions/flag";
import section from "../../redux/actions/section";

// Atlaskit Packages
import Button from '@atlaskit/button';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import Lozenge from "@atlaskit/lozenge";

//Icons
import Arrow from '@atlaskit/icon/glyph/arrow-right';
import HipchatChevronUpIcon from '@atlaskit/icon/glyph/hipchat/chevron-up';
import HipchatChevronDownIcon from '@atlaskit/icon/glyph/hipchat/chevron-down';

// Components
import AddEditSection from "../Test/AddEditSection"
// Other Packages
import styled from "styled-components";
var changeCase = require("change-case");


// api url path
var url = "/test/crud_section/";

const deleteConfMessage = "Are you sure you want to delete the section? Note: Questions in section tests can't be deleted. Question will be removed from all the tests which are not live."
const deleteConfHeader = "Confirm Question Deletion"



class SectionCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConfModalOpen: false,
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

  handleDelete = () => {
    const dataId = this.props.data.id
    api(url, {
      operation: "delete",
      data_id: dataId
    }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.removeSection({
          dataID: dataId
        });
        // To Handle Delete
        this.handleConfModalClose();
      } else {
        this.setState({
          loaded: true
        })
      }
    });
  }


  handleEditSection = event => {
    this.props.actions.setEditSection({ editSection: this.props.data })
  }

  

  handleMovement = (direction) =>{
    const dataId = this.props.data.id
    api(url, {
      operation: "order_change",
      data_id: dataId,
      up_down:direction
    }).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.changeOrder({
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
    const selected = (this.props.selectedSectionId.indexOf(dataId)>=0)
    if(selected){
        this.props.actions.removeSelectedSection({id:dataId});
    }else{
        this.props.actions.addSelectedSection({id:dataId});
    }
  }

  handleMakeLive = () =>{
    this.makeLiveOffline(true);
  }

  handleMakeOffline = () =>{
    this.makeLiveOffline(false);
    
  }


  makeLiveOffline = (isComplete) =>{
    api(url, { operation: "complete", section_ids:this.props.data.id, is_complete : isComplete ? '1' : '0' }).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" :  "warning")
      });
      if (status){
        this.props.actions.editSection({result:result[0]})  
      }
      
  })
}

  render() {
    var data = this.props.data;
    const DropdownStatusItem = styled.div`
        align-items: center;
        display: flex;
        width: 80px;
    `;




      


    if (this.props.editSection && (this.props.editSection.id === this.props.data.id)) {
      return (
        <div>
            <AddEditSection
              testData = {data ? data.test : {}}
              assignedToOptions={this.props.assignedToOptions}
              percentileOptions = {this.props.percentileOptions}
            />
        </div>
      )
    } else {
      return (
        <div className="add-question">
          <div className="add-edit-question-div">
            <div className="question-header">
              <div className="question-add-header">
                Section - {data ? data.order : ''}
              </div>
              <div className="bank-name">
                {(data && data.test.id) ? data.test.test_name : 'None'}
              </div>
              {(data && data.order > 1 && !this.props.individualCard) && (
              <div className="move-up" onClick={this.moveUpOrder}>
                <HipchatChevronUpIcon ></HipchatChevronUpIcon>
              </div>
              )}
              {(data && (data.order < this.props.sectionlist.length) && !this.props.individualCard) && (
              <div className="move-down" onClick={this.moveDownOrder}>
                <HipchatChevronDownIcon ></HipchatChevronDownIcon>
              </div>
              )}
              <div className="question-status">
                <Lozenge appearance={(data && data.is_complete) ? "success" : "moved"}>{(data && data.is_complete) ? "Complete" : "Pending"}</Lozenge>
              </div>
            </div>



          <div className="question-details section-question">
            <div className="general-details-passage">
              <span className="detail-item">
                <span className="detail-name">Assigned To: </span><span className="detail">{data ? changeCase.titleCase(data.assigned_to.first_name) + ' ' +changeCase.titleCase(data.assigned_to.last_name) : '' }</span>
              </span>
              <span className="detail-item">
                <span className="detail-name">Due Date: </span><span className="detail">{data ? data.to_complete_date : ''}</span>
              </span>
            </div>
            <div className="operation-details-sectioncard">
            <div className="open-button-container">
             {!this.props.individualCard && (
              <div className="open-button">
              <Link to={data ? data.path : ''}><Button
                isSelected
              >
                Open
              </Button></Link>
              </div>
             
               )}
              </div>
              {(data && !data.test.is_live) && (
              <div className="operation-dropdown">
                <DropdownMenu
                  trigger="Options"
                  triggerType="button"
                  shouldFlip={true}
                  role="bottom"
                >
                  <DropdownItemGroup>
                      <DropdownItem
                        onClick={(data && data.is_complete) ? this.handleMakeOffline.bind(this) : this.handleMakeLive.bind(this)}
                        elemAfter={
                          <DropdownStatusItem>
                            <Arrow label="" size="small" />
                            <Lozenge appearance={(data && data.is_complete) ? "moved" : "success"}>{(data && data.is_complete) ? "Pending" : "Complete"}</Lozenge>
                          </DropdownStatusItem>
                        }
                      >{(data && data.is_complete) ? "Mark Pending" : "Mark Complete"}</DropdownItem>
                    <DropdownItem onClick={this.handleEditSection.bind(this)}>Edit</DropdownItem>
                      <DropdownItem onClick={this.handleConfModalOpen.bind(this)}>Delete</DropdownItem>
                    
                  </DropdownItemGroup>
                </DropdownMenu>
              </div>
              )}
            </div>
          </div>
            <div className="question-text-div  section-question">
              <div className="question-text">
              <div className="section-details">
                <span className="detail-item">
                  <span className="detail-name">Section: </span><span className="detail">{data? data.name : ''}</span>
                </span>
                { (data && data.name !== data.sub_section_name)  && (
                <span className="detail-item">
                  <span className="detail-name">Sub Section: </span><span className="detail">{data? data.sub_section_name : ''}</span>
                </span>
                )}
                <span className="detail-item">
                  <span className="detail-name">Auto Evaluation: </span><span className="detail">{(data && data.is_eval_manual) ? 'No' : 'Yes'}</span>
                </span>
                <span className="detail-item">
                  <span className="detail-name">Calculator: </span><span className="detail">{(data && data.is_calculator) ? 'Yes' : 'No'}</span>
                </span>
                </div>
                <div className="section-details">
                <span className="detail-item">
                  <span className="detail-name">Default +ve/-ve Marks: </span><span className="detail">+{data ? data.default_positive_marks : ''}/-{data ? data.default_negative_marks : ''}</span>
                </span>

                {!this.props.individualCard && (
                <span className="detail-item">
                  <span className="detail-name">Questions: </span><span className="detail">{data ? data.number_questions : ''}</span>
                </span>
                )}
                {this.props.individualCard && (
                <span className="detail-item">
                  <span className="detail-name">Questions: </span><span className="detail">{this.props.numQuestions ? this.props.numQuestions : ''}</span>
                </span>
                )}
                <span className="detail-item">
                  <span className="detail-name">Cut Off: </span><span className="detail">{(data && data.cutoff) ? data.cutoff : 'Undefined'}</span>
                </span>

                <span className="detail-item">
                  <span className="detail-name">Percentile Table: </span><span className="detail">{(data && data.percentile.table_name) ? data.percentile.table_name : 'Undefined'}</span>
                </span>

                { (data && data.test.time_calculation === "sectional") && (
                <span className="detail-item">
                  <span className="detail-name">Section Time: </span><span className="detail">{(data && data.section_time) ? data.section_time : 'Unassigned'}</span>
                </span>
                )}
                {(data && data.test.is_blank_negative  && data.test.blank_negative_type === "sectional") && (
                <span className="detail-item">
                  <span className="detail-name">Num. Blank Allowed: </span><span className="detail">{(data && data.num_blank_allowed) ? data.num_blank_allowed : 'Unassigned'}</span>
                </span>
                )}
                { (data && data.test.is_blank_negative  && data.test.blank_negative_type === "sectional") && (
                <span className="detail-item">
                  <span className="detail-name">Blank -ve Marks: </span><span className="detail">{(data && data.blank_negative_marks) ? data.blank_negative_marks : 'Unassigned'}</span>
                </span>
                )}
              </div>
              </div>
            </div>
            <div className="question-details section-question">
            <div className="general-details-passage">
              <span className="detail-item">
                <span className="detail-name">Created at: </span><span className="detail">{data ? data.created_at : ''}</span>
              </span>
              <span className="detail-item">
                <span className="detail-name">Modified at: </span><span className="detail">{data ? data.modified_at : ''}</span>
              </span>
            </div>
          </div>


          </div>
          <ModalTransition>
            {this.state.isConfModalOpen && (
              <Modal  autoFocus={false}  actions={
                [
                  { text: 'Confirm', appearance: 'primary', onClick: this.handleDelete },
                  { text: 'Close', appearance: 'normal', onClick: this.handleConfModalClose }

                ]
              } onClose={this.handleConfModalClose} heading={deleteConfHeader}>
                {deleteConfMessage}
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
    ...store.section
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...section, ...flag }, dispatch)
  };
}

SectionCard.propTypes = {
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
)(SectionCard);
