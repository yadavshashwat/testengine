// React
import React, { Component } from 'react';
import { Link } from 'react-router';
// Styles
import "../css/dashboard.css"

// Backend Connection
import { api } from "../helpers/api.js";
// Redux 
import { connect } from "react-redux";
import { browserHistory } from 'react-router';
// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../redux/actions/flag";
import test from "../redux/actions/test";
import section from "../redux/actions/section";

// Atlaskit Packages

import Button from '@atlaskit/button';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import Lozenge from "@atlaskit/lozenge";
import Tag from '@atlaskit/tag';

//Icons
import pathIcon from "../routing/BreadCrumbIcons"
import Arrow from '@atlaskit/icon/glyph/arrow-right';
// Components
import ContentWrapper from '../components/ContentWrapper';
import AddEditTest from '../components/Test/AddEditTest';
import AddEditSection from '../components/Test/AddEditSection';
// import EditorInstructions from "../components/Editors/EditorInstructions";
import EditorInstructions from "../components/Editors/EditorTable";
import SectionCard from "../components/Test/SectionCard";
import AllSections from "./AllSections";

// Other Packages

import styled from "styled-components";
import { Element, scroller } from 'react-scroll'
import Parser from "html-react-parser";


var changeCase = require("change-case");

// api url path
var url = "/test/crud_test/";
var url_section = "/test/crud_section/";


const deleteConfMessage = "Are you sure you want to delete the question? Note: Questions in live tests can't be deleted. Question will be removed from all the tests which are not live."
const deleteConfHeader = "Confirm Question Deletion"




class IndividualTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      // pagination variables
      loaded: false,
      pageNum: 1, //Current page
      pageSize: {'value':50,'label':'50 Items/Page'},
      // filter variables
      isStaff: "1",
      sortByOptions: [],
      orderByOptions: [],

      sortValue: "",
      orderBy: "asc",


      blankNegativeTypeOptions: [],
      isPausableOptions: [],
      isBlankNegativeOptions: [],
      isQuestionJumpOptions: [],
      timeCalculationOptions: [],
      isSectionalSequenceChooseOptions: [],
      interfaceTypeOptions: [],
      timerTypeTypeOptions: [],
      isSectionalJumpOptions: [],
      numMcqOptions: [],
      searchIcon: true,
      folderOptionsSelect: [],
      courseOptions: [],
      categoryOptions: [],
      topicOptions: [],
      isLiveOptions: [],
      folderOptionsMove: [],
      isEvalManualOptions :[],
      assignedToOptions   :[],
      isCalculatorOptions :[],
      instructionValue: '',
      activeInstructionKey: '',
      isNewInstruction: true,
      
      analysisValue:'',
      isNewAnalysis: true,
      isLiveModalOpen:false,
      warnings: [],
      critical_errors:[]




    };
  }

  // Filters Handling


  handleConfModalOpen = event => {
    this.setState({
      isConfModalOpen: true
    })
  }

  handleConfModalClose = () => {
    this.setState({
      isConfModalOpen: false
    })
  }


  handleDelete = () => {

    const dataId = this.props.testlist[0].id
    this.handleConfModalClose();
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
        this.props.actions.removeTest({
          dataID: dataId
        });
        // To Handle Delete
      } else {
        this.setState({
          loaded: true
        })
      }
    });
  }

  handleEditTest = event => {
    this.props.actions.setEditTest({ editTest: this.props.testlist[0] })
  }


  handleMakeLive = () => {
    this.makeLiveOffline(true);
  }

  handleMakeOffline = () => {
    this.makeLiveOffline(false);
  }

  handleInstructionModalOpen = () => {
    this.setState({
      instructionsModalOpen: true,
      instructionValue: '',
      isNewInstruction: true,
      activeInstructionKey: ''
    })
  }

  handleInstructionModalClose = () => {
    this.setState({
      instructionsModalOpen: false,
      instructionValue: '',
      isNewInstruction: true,
      activeInstructionKey: ''

    })
  }

  handleAnalysisModalOpen = () =>{
    this.setState({
      analysisModalOpen:true,
      isNewAnalysis:true,
      analysisValue:''
    })
  }

  handleAnalysisModalClose = () =>{
    this.setState({
      analysisModalOpen:false
    })
  }

  handleAnalysisChange = html  =>{
    this.setState({
      analysisValue:html
    })
  }


  handleInstructionChange = html => {
    this.setState({
      instructionValue: html
    });
  }




  handleInstructionEditModalOpen = event => {
    const activeInstructionKey = event.currentTarget.dataset.id
    const activeInstructionHtml = event.currentTarget.dataset.html

    this.setState({
      instructionsModalOpen: true,
      instructionValue: activeInstructionHtml,
      activeInstructionKey: activeInstructionKey,
      isNewInstruction: false
    })


  }


  handleEditInstruction = event => {
    var newInstructions = [...this.props.testlist[0].instructions.slice(0, this.state.activeInstructionKey),
    this.state.instructionValue,
    ...this.props.testlist[0].instructions.slice(this.state.activeInstructionKey + 1)]
    this.handleInstructionModalClose();

    api(url, { operation: "instructions", data_id: this.props.testlist[0].id, instructions: JSON.stringify(newInstructions) }).then(response => {
      const { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editTest({ result: result[0]})
      }

    });
  }

  handleAnalysisDelete = event => {
    const index = event.currentTarget.dataset.id
    var analysis = ''
    api(url, { operation: "analysis", data_id: this.props.testlist[0].id, analysis: '' }).then(response => {
      const { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editTest({ result: result[0]})
      }
    });

  }

  handleAnalysisAdd = event => {
    const index = event.currentTarget.dataset.id
    var analysis = this.state.analysisValue
    api(url, { operation: "analysis", data_id: this.props.testlist[0].id, analysis: analysis }).then(response => {
      const { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.handleAnalysisModalClose();
        this.props.actions.editTest({ result: result[0]})
      }
    });
  }


  handleAnalysisEdit = () =>{
    this.setState({
      analysisModalOpen:true,
      isNewAnalysis:false,
      analysisValue:this.props.testlist[0].analysis
    })
  }



  handleInstructionDelete = event => {
    const index = event.currentTarget.dataset.id
    var newInstructions = [...this.props.testlist[0].instructions.slice(0, index), ...this.props.testlist[0].instructions.slice(index + 1)]
    api(url, { operation: "instructions", data_id: this.props.testlist[0].id, instructions: JSON.stringify(newInstructions) }).then(response => {
      const { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editTest({ result: result[0]  })
      }
    });

  }



  handleAddInstructions = () => {
    var newInstructions = [...this.props.testlist[0].instructions, this.state.instructionValue]
    console.log(newInstructions)
    this.handleInstructionModalClose();
    api(url, { operation: "instructions", data_id: this.props.testlist[0].id, instructions: JSON.stringify(newInstructions) }).then(response => {
      const { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editTest({ result: result[0]  })
      }

    });
  }



  handlePreviewTest = () => {
    const dataId = this.props.testlist[0].id
    api(url, { operation: "live", test_ids: dataId, is_live: '1', validate: '1'}).then(response => {
      const { message, status, result,warnings,critical_errors } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        // if (critical_errors.length != 0){
        //   this.props.actions.addFlag({
        //     message: "Critical Errors in test!",
        //     appearance: "warning"
        //   });
        // }else{

        browserHistory.push('/testengine/test/'+ this.props.testlist[0].test_name + '/')

        // }
      }
    })

  }

  validateTest = event => {
    const dataId = this.props.testlist[0].id
    api(url, { operation: "live", test_ids: dataId, is_live: '1', validate: '1'}).then(response => {
      const { message, status, result,warnings,critical_errors } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.setState({
          warnings:warnings,
          critical_errors:critical_errors,
          isLiveModalOpen:true
        })
      }
    })

  }




  makeLiveOffline = event => {
    const dataId = this.props.testlist[0].id
    const isLive = this.props.testlist[0].is_live
    api(url, { operation: "live", test_ids: dataId, is_live: isLive ? '0' : '1', validate: '0'}).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
          if (result.length > 0 ){
            api(url_section, {
              operation: "read",
              test_id:result[0].id
            })
            .then(response => {
              const { result, message, status,total_records } = response;
              this.props.actions.addFlag({
                message: message,
                appearance: (status ? "normal" :  "warning")
              });    
              if (status){
                    this.props.actions.setSectionList({
                      sectionlist:result,
                      totalSections:total_records,
                      setTotal:true
                    });
              }
            })
          this.props.actions.editTest({ result: result[0]  })  
          }
          this.handleLiveModalClose();
      }

    })
  }

  handleAddNewSection = () => {
    const position = "end";
    this.props.actions.viewAddSection({
      position: position
    });
    scroller.scrollTo('add-section-top', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -50
    });

  }

  handleAddExistingSectionModalOpen = () => {
    this.setState({isExisitingSectionOpen:true})
  }

  handleCloseExisitingSection = () => {
    this.setState({isExisitingSectionOpen:false})
  }


handleLiveModalClose = () => {
  this.setState({
    isLiveModalOpen:false,
    warning:[],
    critical_errors:[]
  })
}

handleLiveModalOpen = () => {
  this.setState({
    isLiveModalOpen:true
  })
}


  // On Load
  componentDidMount() {
    var Path = window.location.pathname.split("/")
    this.props.actions.setDefaultTest({});
    this.props.actions.setDefaultSection({});
    // this.props.actions.setEmptyEditTest({});
    // this.props.actions.setEmptyEditSection({});
    var testNamePath = null;
    
    testNamePath = decodeURIComponent(Path[5])

    api(url, { operation: "read", test_name: testNamePath }).then(response => {
      const { result, filter, status, num_pages, total_records } = response;
      // this.props.actions.addFlag({
      //   message: message,
      //   appearance: (status ? "normal" : "warning")
      // });
      if (status) {
        this.props.actions.setTestList({
          testlist: result,
          totalTests: total_records,
          setTotal: true
        });
        if (result.length > 0 ){
          this.setState({
            testId:result[0].id
          })  
          api(url_section, {
            operation: "read",
            test_id:result[0].id
          })
          .then(response => {
            const { result, message, status,total_records } = response;
            // this.props.actions.addFlag({
            //   message: message,
            //   appearance: (status ? "normal" :  "warning")
            // });    
            if (status){
                  this.props.actions.setSectionList({
                    sectionlist:result,
                    totalSections:total_records,
                    setTotal:true
                  });
              
            }
          })
        }
        
  
        
        var TOPIC_DICT = [];
        (filter.category).map((row) => (
          TOPIC_DICT.push({ 'label': row.label, 'options': [] })
        )
        );
        (filter.sub_category).map((row) => (
          TOPIC_DICT.map((cat) => {
            if (cat.label === row.category) {
              cat.options.push({
                'value': row.id,
                'label': row.sub_category
              });
            }
          })
        ));
        if (result.length > 0 ){
          this.setState(
            {
              loaded: true,
              numPages: num_pages,
              sortByOptions: filter.sort_by,
              orderByOptions: filter.order_by,
              topicOptions: TOPIC_DICT,
              categoryOptions: filter.category,
              percentileOptions: filter.percentile,
              folderOptions: filter.folders,
              isBlankNegativeOptions: filter.is_blank_negative,
              blankNegativeTypeOptions: filter.blank_negative_type,
              isQuestionJumpOptions: filter.is_question_jump,
              timeCalculationOptions: filter.time_calculation,
              isSectionalSequenceChooseOptions: filter.is_section_sequence_choose,
              isPausableOptions: filter.is_pausable,
              isLiveOptions: filter.is_live,
              interfaceTypeOptions: filter.interface_type,
              timerTypeTypeOptions: filter.timer_type,
              isSectionalJumpOptions: filter.is_sectional_jump,
              numMcqOptions: filter.num_options_mcq,
              courseOptions: filter.courses,
              isEvalManualOptions : filter.is_eval_manual,
              assignedToOptions   :filter.assigned_to,
              isCalculatorOptions : filter.is_calculator,
              folderId:result[0].folder.id
            }
          );
            
        }
        
      }
    });
  }


  render() {
  

    const DropdownStatusItem = styled.div`
    align-items: center;
    display: flex;
    width: 60px;
`;


    let breadCrumbElement = null
    var Path = window.location.pathname.split("/")
    var textPath = null;
    breadCrumbElement = Path.map((row, index) => {
      if (index > 2 && index < (Path.length - 1)) {
        if (['question-bank', 'test-bank'].indexOf(Path[index - 1]) >= 0) {
          textPath = decodeURIComponent(Path[index])
        } else if (['question-bank', 'test-bank'].indexOf(Path[index - 2]) >= 0) {
          textPath = decodeURIComponent(Path[index])
        } else {
          textPath = changeCase.titleCase(Path[index])
        }
        var link = (Path.slice(0, index + 1).join("/")) + "/"
        try {
          if (['question-bank', 'test-bank'].indexOf(Path[index - 1]) >= 0) {
            return (<BreadcrumbsItem key={index} iconBefore={pathIcon['folder']} href={link} text={textPath} />);
          } else {
            return (<BreadcrumbsItem key={index} iconBefore={pathIcon[Path[index]]} href={link} text={textPath} />);
          }
        }
        catch (err) {
          return (<BreadcrumbsItem key={index} href={link} text={textPath} />);
        }
      } else {
        return null;
      }
    });

    let renderInstructions = null;
    if (this.props.testlist.length > 0) {
      renderInstructions = this.props.testlist[0].instructions.map((row, key) => {
        return (
          <div key={key} className="add-edit-instruction-div">
            <div className="question-header">
              <div className="question-add-header">Instruction {key + 1}</div>
            </div>
            <div className="question-header">
              <div className="edit-button-row">
                <DropdownMenu
                  trigger="Options"
                  triggerType="button"
                  shouldFlip={true}
                  role="bottom">
                  <DropdownItemGroup>
                    <DropdownItem data-html={row} data-id={key} onClick={this.handleInstructionEditModalOpen}>Edit</DropdownItem>
                    <DropdownItem data-id={key} onClick={this.handleInstructionDelete}>Delete</DropdownItem>
                  </DropdownItemGroup>
                </DropdownMenu>
              </div>
            </div>
            <Grid className="instruction-content">
              <GridColumn medium={12}>
                {Parser(row)}
              </GridColumn>
            </Grid>
          </div>

        )

      })
    }

    let renderAnalysis = null;
    if (this.props.testlist.length > 0) {
      if (this.props.testlist[0].analysis){
      
          renderAnalysis = (
          <div className="add-edit-instruction-div">
            <div className="question-header">
              <div className="question-add-header">Test Analysis</div>
            </div>
            <div className="question-header">
              <div className="edit-button-row">
                <DropdownMenu
                  trigger="Options"
                  triggerType="button"
                  shouldFlip={true}
                  role="bottom">
                  <DropdownItemGroup>
                    <DropdownItem  onClick={this.handleAnalysisEdit}>Edit</DropdownItem>
                    <DropdownItem  onClick={this.handleAnalysisDelete}>Delete</DropdownItem>
                  </DropdownItemGroup>
                </DropdownMenu>
              </div>
            </div>
            <Grid className="instruction-content">
              <GridColumn medium={12}>
                {Parser(this.props.testlist[0].analysis)}
              </GridColumn>
            </Grid>
          </div>
          )
      }
    }

  
    var sectionlist = this.props.sectionlist;
    let renderSectionElement = null;
    
    if (this.state.loaded === true) {
      renderSectionElement = null
      // debugger;
      console.log(sectionlist)
      renderSectionElement = sectionlist.map((row,key) => {
        return (
              <SectionCard key={key} data={row}
                assignedToOptions={this.state.assignedToOptions}
                percentileOptions = {this.state.percentileOptions}
              ></SectionCard>)
      })
    }else{
      renderSectionElement = null
    }

    return (
      <ContentWrapper>
        <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        <Grid spacing="compact">
          {!this.props.editTest && (


            <div className="add-edit-question-div">
              <div className="question-header">
                <div className="question-add-header">Test Details</div>
                <div className="lozenge-live">
                  <Lozenge appearance={this.props.testlist.length > 0 && this.props.testlist[0].is_live ? "success" : "moved"}>{this.props.testlist.length > 0 && this.props.testlist[0].is_live ? "Live" : "Offline"}</Lozenge>
                </div>
              </div>
              <div className="question-header">
                <div className="edit-button-row">
                  <DropdownMenu
                    trigger="Options"
                    triggerType="button"
                    shouldFlip={true}
                    role="bottom"
                  >
                    <DropdownItemGroup>
                      <DropdownItem
                        onClick={this.props.testlist.length > 0 && this.props.testlist[0].is_live ? this.makeLiveOffline.bind(this) : this.validateTest.bind(this)}
                        elemAfter={
                          <DropdownStatusItem>
                            <Arrow label="" size="small" />
                            <Lozenge appearance={this.props.testlist.length > 0 && this.props.testlist[0].is_live ? "moved" : "success"}>{this.props.testlist.length > 0 && this.props.testlist[0].is_live ? "Offline" : "Live"}</Lozenge>
                          </DropdownStatusItem>
                        }
                      >{this.props.testlist.length > 0 && this.props.testlist[0].is_live ? "Take Offline" : "Make Live"}</DropdownItem>
                      {this.props.testlist.length > 0 && !this.props.testlist[0].is_live  && (<DropdownItem onClick={this.handleEditTest}>Edit</DropdownItem>)}
                      <a href={'/testengine/adminpanel/tests/' + (this.props.testlist.length > 0 ? this.props.testlist[0].test_name : '') + '/'} target="_blank"><DropdownItem>Preview</DropdownItem></a>
                      {this.props.testlist.length > 0 && !this.props.testlist[0].is_live && (
                        <DropdownItem onClick={this.handleConfModalOpen.bind(this)}>Delete</DropdownItem>
                      )}

                    </DropdownItemGroup>
                  </DropdownMenu>
                </div>
              </div>
              <div>
                <Grid>
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Test Name</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 ? this.props.testlist[0].test_name : ''}
                      </div>
                    </div>
                  </GridColumn>
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Category</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 ? changeCase.titleCase(this.props.testlist[0].category.category) : ''} - {this.props.testlist.length > 0 ? changeCase.titleCase(this.props.testlist[0].category.sub_category) : ''}
                      </div>
                    </div>
                  </GridColumn>
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Scheduled For:</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 ? this.props.testlist[0].scheduled_for : ''}
                      </div>
                    </div>
                  </GridColumn>
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Number MCQ Options:</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 && this.props.testlist[0].num_options_mcq ? this.props.testlist[0].num_options_mcq : 'Undefined'}
                      </div>
                    </div>
                  </GridColumn>
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Cutoff Marks:</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 && this.props.testlist[0].cutoff ? this.props.testlist[0].cutoff : 'Undefined'}
                      </div>
                    </div>
                  </GridColumn>

                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Test Interface:</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 && this.props.testlist[0].interface_type ? changeCase.titleCase(this.props.testlist[0].interface_type) : 'Undefined'}
                      </div>
                    </div>
                  </GridColumn>
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Pausable?</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 && this.props.testlist[0].is_pausable ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </GridColumn>
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Section Shuffle?</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 && this.props.testlist[0].is_section_sequence_choose ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </GridColumn>
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Question Jump?</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 && this.props.testlist[0].is_question_jump ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </GridColumn>
                  {this.props.testlist.length > 0 && this.props.testlist[0].is_question_jump && (
                  <GridColumn medium={3}>
                      <div className="field-div">
                        <div className="field-name">
                          <span className="field-label">Section Jump?</span>
                        </div>
                        <div className="field-details">
                          {this.props.testlist.length > 0 && this.props.testlist[0].is_sectional_jump ? 'Yes' : 'No'}
                        </div>
                      </div>
                    
                  </GridColumn>
                  )}
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Timer Type:</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 && this.props.testlist[0].timer_type ? changeCase.titleCase(this.props.testlist[0].timer_type) : 'Undefined'}
                      </div>

                    </div>
                  </GridColumn>
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Time Calculation:</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 && this.props.testlist[0].time_calculation ? changeCase.titleCase(this.props.testlist[0].time_calculation) : 'Undefined'}
                      </div>
                    </div>
                  </GridColumn>
                  {this.props.testlist.length > 0 && (this.props.testlist[0].time_calculation === "overall") && (
                  <GridColumn medium={3}>
                    
                      <div className="field-div">
                        <div className="field-name">
                          <span className="field-label">Total Time:</span>
                        </div>
                        <div className="field-details">
                          {this.props.testlist.length > 0 ? this.props.testlist[0].total_time : ''} Mins.
                  </div>
                      </div>
                    
                  </GridColumn>
                  )}
                  <GridColumn medium={3}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Blank Negative?</span>
                      </div>
                      <div className="field-details">
                        {this.props.testlist.length > 0 && this.props.testlist[0].is_blank_negative ? 'Yes' : 'No'}
                      </div>
                    </div>

                  </GridColumn>
                  {this.props.testlist.length > 0 && this.props.testlist[0].is_blank_negative && (
                  <GridColumn medium={3}>
                    
                      <div className="field-div">
                        <div className="field-name">
                          <span className="field-label">Blank Negative Type</span>
                        </div>
                        <div className="field-details">
                          {this.props.testlist.length > 0 && this.props.testlist[0].blank_negative_type ? changeCase.titleCase(this.props.testlist[0].blank_negative_type) : 'Undefined'}
                        </div>
                      </div>

                    
                  </GridColumn>
                  )}
                  {(this.props.testlist.length > 0 && this.props.testlist[0].is_blank_negative && this.props.testlist[0].blank_negative_type === "overall") && (
                  <GridColumn medium={3}>
                    
                      <div className="field-div">
                        <div className="field-name">
                          <span className="field-label">No. Blank Allowed</span>
                        </div>
                        <div className="field-details">
                          {this.props.testlist.length > 0 && this.props.testlist[0].num_blank_allowed? this.props.testlist[0].num_blank_allowed : 'Undefined'}
                        </div>
                      </div>
                    
                  </GridColumn>
                  )}
                  {(this.props.testlist.length > 0 && this.props.testlist[0].is_blank_negative && this.props.testlist[0].blank_negative_type === "overall") && (
                  <GridColumn medium={3}>
                    
                      <div className="field-div">
                        <div className="field-name">
                          <span className="field-label">Blank Negative Marks</span>
                        </div>
                        <div className="field-details">
                          {this.props.testlist.length > 0 && this.props.testlist[0].blank_negative_marks ? this.props.testlist[0].blank_negative_marks : 'Undefined'}
                        </div>
                      </div>
                    
                  </GridColumn>
                  )}
                    <GridColumn medium={6}>
                    <div className="field-div">
                      <div className="field-name">
                        <span className="field-label">Percentile Table:</span>
                      </div>
                      <div className="field-details">
                        {(this.props.testlist.length > 0 && this.props.testlist[0].percentile.id) ? changeCase.titleCase(this.props.testlist[0].percentile.table_name) : 'Undefined'}
                      </div>
                    </div>
                  </GridColumn>
                  {this.props.testlist.length > 0 && (
                  <GridColumn medium={12}>
                  <div className="field-div">
                    <div className="field-name">
                      <span className="field-label">Courses:</span>
                    </div>
                    <div className="field-details">{
                      this.props.testlist[0].used_in_courses.map((row,key) => {
                        return <div className="course-name" key={key}><Link href="" target="_blank"><Tag text={row.course_name} color="purpleLight" /></Link></div>
                    })
                    }
                      
                    </div>
                  </div>
                </GridColumn>
                  )}
                    
                  

                </Grid>
              </div>
            </div>

          )}
        </Grid>

        <Grid spacing="compact">
          <Element name="add-test-top">
            {(this.props.editTest) && (
              <AddEditTest
                blankNegativeTypeOptions={this.state.blankNegativeTypeOptions}
                timeCalculationOptions={this.state.timeCalculationOptions}
                percentileOptions = {this.state.percentileOptions}
                interfaceTypeOptions={this.state.interfaceTypeOptions}
                timerTypeTypeOptions={this.state.timerTypeTypeOptions}
                numMcqOptions={this.state.numMcqOptions}
                courseOptions={this.state.courseOptions}
                topicOptions={this.state.topicOptions}
                folderId={this.state.folderId}
                TopEnd="top"
              />
            )}
          </Element>
        </Grid>
        <Grid>
          {renderInstructions}
        </Grid>
        <Grid spacing="compact">
          <div className="add-instructions">
            <div className="add-section">
              <Button onClick={this.handleInstructionModalOpen} appearance="primary">
                Add Instructions
            </Button>
            </div>
          </div>
        </Grid>
        <Grid>
            {renderSectionElement}
        </Grid>
        <Grid spacing="compact">
          <Element name="add-section-top">
          {(this.props.addSectionEnd) && (
              <AddEditSection
              assignedToOptions={this.state.assignedToOptions}
              percentileOptions = {this.state.percentileOptions}
              testData={this.props.testlist.length > 0 ? this.props.testlist[0] : null}
              />
            )}
          </Element>
        </Grid>
        <Grid>
          <div className="add-instructions">
            <div className="add-section">
              <Button onClick={this.handleAddNewSection} appearance="primary">
                Add New Section
                </Button>
            </div>
            <div className="add-section">
              <Button onClick={this.handleAddExistingSectionModalOpen} appearance="primary">
                Add Existing Section
              </Button>
            </div>
          </div>
        </Grid>
        <Grid>
          {renderAnalysis}
        </Grid>

        { (this.props.testlist.length > 0 && !this.props.testlist[0].analysis) && (
        <Grid spacing="compact">
        <div className="add-instructions">
          <div className="add-section">
            <Button onClick={this.handleAnalysisModalOpen} appearance="primary">
              Add Analysis
          </Button>
          </div>
        </div>
      </Grid>
        ) }

        {this.state.instructionsModalOpen && (
          <ModalTransition>
            <Modal autoFocus={false} width={'60%'} actions={
              [
                { text: this.state.isNewInstruction ? 'Add Instruction' : 'Edit Instruction', appearance: 'primary', onClick: this.state.isNewInstruction ? this.handleAddInstructions : this.handleEditInstruction },
                { text: 'Close', appearance: 'normal', onClick: this.handleInstructionModalClose },
              ]
            } onClose={this.handleInstructionModalClose} heading={this.state.isNewInstruction ? 'New Instruction' : 'Edit Instruction'}>
              <Grid>
                <GridColumn medium={12}>
                  <div className="passage-editor">
                    <EditorInstructions
                      onChange={this.handleInstructionChange}
                      html={this.state.instructionValue}
                    />
                  </div>
                </GridColumn>
              </Grid>
            </Modal>
          </ModalTransition>
        )}
        {this.state.analysisModalOpen && (
          <ModalTransition>
            <Modal autoFocus={false} width={'60%'} actions={
              [
                { text: this.state.isNewAnalysis ? 'Add Analysis' : 'Edit Analysis', appearance: 'primary', onClick: this.handleAnalysisAdd},
                { text: 'Close', appearance: 'normal', onClick: this.handleAnalysisModalClose },
              ]
            } onClose={this.handleAnalysisModalClose} heading={this.state.isNewAnalysis ? 'New Analysis' : 'Edit Analysis'}>
              <Grid>
                <GridColumn medium={12}>
                  <div className="passage-editor">
                    <EditorInstructions
                      onChange={this.handleAnalysisChange}
                      html={this.state.analysisValue}
                    />
                  </div>
                </GridColumn>
              </Grid>
            </Modal>
          </ModalTransition>
        )}


        <ModalTransition>
          {this.state.isConfModalOpen && (
            <Modal autoFocus={false} actions={
              [
                { text: 'Confirm', appearance: 'primary', onClick: this.handleDelete },
                { text: 'Close', appearance: 'normal', onClick: this.handleConfModalClose }
              ]
            } onClose={this.handleConfModalClose} heading={deleteConfHeader}>
              {deleteConfMessage}
            </Modal>
          )}
        </ModalTransition>

        <ModalTransition>
          {this.state.isExisitingSectionOpen && (
            <Modal width={"60%"} autoFocus={false} actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleCloseExisitingSection }
              ]
            } onClose={this.handleCloseExisitingSection} heading={"Add Existing Section"}>
            <AllSections testId={this.state.testId}/>
            </Modal>
          )}
        </ModalTransition>

        <ModalTransition>
          {this.state.isLiveModalOpen && (
            <Modal autoFocus={false} actions={
              [
                { text: 'Make Live', appearance: 'primary', onClick: this.makeLiveOffline },
                { text: 'Close', appearance: 'normal', onClick: this.handleLiveModalClose }
              ]
            } onClose={this.handleLiveModalClose} heading={"Test Warnings and Errors"}>
             <b>Critical Errors: </b>
             <ul>
              {
                this.state.critical_errors.map((row) => {
                  return <li>{row}</li>
                })

              }
              </ul>
              <br></br>
              <b>Warnings: </b>
             <ul>
              {
                this.state.warnings.map((row) => {
                  return <li>{row}</li>
                })

              }
              </ul>
            </Modal>
          )}
        </ModalTransition>
      </ContentWrapper>

    );
  }
}

function mapStateToProps(store) {
  return {
    ...store.test,
    ...store.section
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...test,...section, ...flag }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IndividualTest);
