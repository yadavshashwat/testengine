// React
import React, { Component } from 'react';
import PropTypes from "prop-types";
// Styles
import "../../css/dashboard.css"

// Backend Connection
import { api } from "../../helpers/api.js";
// Redux 
import { connect } from "react-redux";
import { browserHistory } from 'react-router';
// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../../redux/actions/flag";
import test from "../../redux/actions/test";
import section from "../../redux/actions/section";

// Atlaskit Packages

import Button from '@atlaskit/button';
import { Grid, GridColumn } from '@atlaskit/page';
import TextField from '@atlaskit/textfield';
import Select from "@atlaskit/select";
import { ToggleStateless } from '@atlaskit/toggle';
import { DatePicker } from '@atlaskit/datetime-picker';
import { CheckboxSelect } from '@atlaskit/select';

//Icons
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
// Components

// Other Packages
import { format } from 'date-fns';


var changeCase = require("change-case");
// api url path
var url = "/test/crud_test/";
var url_section = "/test/crud_section/";

function disableDate() {
  var dateArray = []
  for (var i=0; i < 600; i++){
    var date = new Date();
    date.setDate(-i);
    dateArray.push(format(date, 'YYYY-MM-DD'))
  }
  return dateArray;
}


class AddEditTest extends Component {
  constructor(props) {
    super(props);
    const editTest = this.props.editTest;
    console.log(editTest)
    if (editTest) {
      this.state = {
        dataId:editTest.id,
        testName: editTest.test_name,
        isTestNameValid: true,
        topicValue: { 'value': editTest.category.id, 'label': changeCase.titleCase(editTest.category.sub_category) },
        interfaceTypeValue:editTest.interface_type ? { 'value': editTest.interface_type, 'label': changeCase.titleCase(editTest.interface_type) } : '',
        numMcqOptionsValue: editTest.num_options_mcq ? { 'value': String(editTest.num_options_mcq), 'label': String(editTest.num_options_mcq) } : '',
        scheduledForValue: editTest.scheduled_for,
        isPausable: editTest.is_pausable,
        isSectionShuffle: editTest.is_section_sequence_choose,
        isQuestionJump: editTest.is_question_jump,
        isSectionJump: editTest.is_sectional_jump,
        timeCalculation: editTest.time_calculation ? { 'value': editTest.time_calculation, 'label': changeCase.titleCase(editTest.time_calculation) } : '',
        timerTypeValue: editTest.timer_type ? { 'value': editTest.timer_type, 'label': changeCase.titleCase(editTest.timer_type) } : '',
        totalTime: editTest.total_time ? editTest.total_time : '',
        isBlankNegative: editTest.is_blank_negative,
        blankNegativeType: editTest.blank_negative_type ? {'value': editTest.blank_negative_type, 'label': changeCase.titleCase(editTest.blank_negative_type) } : '',
        numBlankAllowed: editTest.num_blank_allowed ? editTest.num_blank_allowed : '',
        blankNegativeMarks: editTest.blank_negative_marks ? editTest.blank_negative_marks : '',
        cutOffMarks: editTest.cutoff ? editTest.cutoff : '',
        courseValue:editTest.used_in_courses.map((row) => { return {'value' : row.id,'label' :row.course_name}}),
        percentileValue:editTest.percentile ? {'value' : editTest.percentile.id,'label' :changeCase.titleCase(editTest.percentile.table_name)} : '' ,
        // courseValue:[],
        cutOffMarksValid:true,
        submitError:[],
        totalTimeValid: true,
        numBlankAllowedValid:true,
        blankNegativeMarksValid:true,
        initialTestName: editTest.test_name


      };
      console.log({ 'value': editTest.time_calculation, 'label': changeCase.titleCase(editTest.time_calculation) })

    } else {
      this.state = {
        testName: '',
        isTestNameValid: true,
        topicValue: '',
        interfaceTypeValue:'',
        numMcqOptionsValue: '',
        scheduledForValue: '',
        isPausable: false,
        isSectionShuffle: false,
        isQuestionJump: false,
        isSectionJump: false,
        timeCalculation: '',
        timerTypeValue: '',
        totalTime: '',
        totalTimeValid: true,
        isBlankNegative: false,
        blankNegativeType: { value: '', label: '' },
        numBlankAllowed: '',
        blankNegativeMarks: '',
        numBlankAllowedValid:true,
        blankNegativeMarksValid:true,
        cutOffMarks: '',
        cutOffMarksValid:true,
        submitError: [],
        courseValue:[],
        percentileValue:'',
        initialTestName: ''
      };
    }
      this.continueDefaults = {
        testName: '',
        isTestNameValid: true,
        totalTimeValid: true,
        numBlankAllowedValid:true,
        blankNegativeMarksValid:true,
        scheduledForValue: '',
        submitError: [],
        topicValue: '',
        initialTestName: ''
      }
  }



handleTestNameChange = event => {
  var data = event.target.value
  this.setState({ testName: data });
};

handleTestValidateBlur = event => {
  this.handleTestValidate('flag');
}


handleTestValidate = (flag) => {
  if (this.state.testName.length) {
    api(url, {
      "operation": "validate",
      "test_name": this.state.testName
    }).then(response => {
      const { message, status } = response;
      if (flag === "flag") {
        this.props.actions.addFlag({
          message: message,
          appearance: (status ? "normal" : "warning")
        });
      }
      if (status) {
        this.setState({ isTestNameValid: true });
      } else {
        this.setState({ isTestNameValid: false });
      }
    });
  }
}


handleInterfaceTypeChange = value => {
  this.setState({ interfaceTypeValue: value })
}


handleTopicChange = value => {
  this.setState({ topicValue: value })
}

handleMcqOptionsChange = value => {
  this.setState({ numMcqOptionsValue: value })
}

handlePercentileChange = value => {
  this.setState({ percentileValue: value })
}

handleMcqOptionsChange = value => {
  this.setState({ numMcqOptionsValue: value })
}

handleScheduledForChange = value => {
  this.setState({
    scheduledForValue: value
  });
}


handleIsPausableChange = () => {
  this.setState({
    isPausable: !this.state.isPausable
  });
}

handleSectionShuffleChange = () => {
  this.setState({
    isSectionShuffle: !this.state.isSectionShuffle
  });
}

handleIsQuestionJump = () => {
  this.setState({
    isQuestionJump: !this.state.isQuestionJump,
    isSectionJump: false
  });
}

handleIsSectionJump = () => {
  
  this.setState({
    isSectionJump: !this.state.isSectionJump
  });
}

handleTimeCalculationChange = value => {
  this.setState({
    timeCalculation: value,
    totalTime: value.value === this.state.timeCalculation.value ? this.state.totalTime : ''
  })
}

handleTimerTypeChange = value => {
  this.setState({
    timerTypeValue: value
  })
}

handleTotalTime = event => {
  var data = event.target.value
  if (data > 0) {
    this.setState({
      totalTime: data,
      totalTimeValid: true
    });
  } else {
    this.setState({
      totalTime: '',
      totalTimeValid: false
    });
  }
};

checkTotalTime = event => {
  var data = event.target.value
  if (data>0){
    return true
  }else{
    return false
  }
}

handleCourseChange = value => {
  this.setState({ courseValue: value});
};


handleBlankNegativeTypeChange = value => {
  this.setState({
    blankNegativeType: value,
    numBlankAllowed: value.value === this.state.blankNegativeType.value ? this.state.numBlankAllowed : '',
    blankNegativeMarks: value.value === this.state.blankNegativeType.value ? this.state.blankNegativeMarks : '',
    numBlankAllowedValid: true,
    blankNegativeMarksValid: true
  })
}

handleIsBlankNegative = () => {
  this.setState({
    isBlankNegative: !this.state.isBlankNegative,
    blankNegativeType: '',
    numBlankAllowed: '',
    blankNegativeMarks: '',
    numBlankAllowedValid: true,
    blankNegativeMarksValid: true

  });

}

handleNumBlankAllowed = event => {
  var data = event.target.value
  if (data > 0) {
    this.setState({
      numBlankAllowed: data,
      numBlankAllowedValid: true
    });
  } else {
    this.setState({
      numBlankAllowed: '',
      numBlankAllowedValid: false
    });
  }
};


handleBlankNegativeMarksChange = event => {
  var data = event.target.value
  if (data > 0) {
    this.setState({
      blankNegativeMarks: data,
      blankNegativeMarksValid: true
    });
  } else {
    this.setState({
      blankNegativeMarks: '',
      blankNegativeMarksValid: false
    });
  }
};

handleCutOffMarks = event => {
  var data = event.target.value
  if (data >= 0) {
    this.setState({
      cutOffMarks: data,
      cutOffMarksValid: true
    });
  } else {
    this.setState({
      cutOffMarks: '',
      cutOffMarksValid: false
    });
  }
};


handleAddTestClose = () => {
  this.props.actions.closeAddTest({});
}

handleEditTestClose = () => {
  this.props.actions.setEmptyEditTest({});
}

handleSaveTest = () =>{
  this.SaveTest('save');

}

handleSaveContinueTest = () =>{
  this.SaveTest('continue');
}

checkError = () => {
  var noError = true
  var errorMessage = ""

if (this.state.scheduledForValue == ""){
  noError = false;
  errorMessage = "Missing Scheduled For!"
}


if (!this.state.topicValue){
  noError = false;
  errorMessage = "Missing Test Category!"
}

  // console.log(noError)
  if (this.state.testName == ""){
      noError = false;
      errorMessage = "Missing Test Name!"
  }


  if (!noError){
      this.props.actions.addFlag({
          message: errorMessage,
          appearance: "warning"
        });        
  }
  return noError

}

SaveTest = (type) => {
  const submitCheck = this.checkError();
  var payloadSend = null;
  if (submitCheck){
    if(this.props.editTest === null){
      payloadSend = {
          operation: "create",
          test_name: this.state.testName,
          is_question_jump: this.state.isQuestionJump === true ? 1 : 0,
          is_pausable : this.state.isPausable === true ? 1 : 0,                
          is_section_sequence_choose : this.state.isSectionShuffle === true ? 1 : 0,
          is_sectional_jump : this.state.isSectionJump === true ? 1 : 0,    
          scheduled_for :this.state.scheduledForValue,
          category_id                :this.state.topicValue ? this.state.topicValue.value : '',
          time_calculation           :this.state.timeCalculation ? this.state.timeCalculation.value : '',
          total_time                 :this.state.totalTime,
          timer_type                 :this.state.timerTypeValue ? this.state.timerTypeValue.value : '',
          interface_type             :this.state.interfaceTypeValue ? this.state.interfaceTypeValue.value : '',
          num_options_mcq            :this.state.numMcqOptionsValue ? this.state.numMcqOptionsValue.value : '',
          percentile_id              : this.state.percentileValue ? this.state.percentileValue.value : '',
          is_blank_negative          :this.state.isBlankNegative === true ? 1 : 0,
          blank_negative_type        :this.state.blankNegativeType ? this.state.blankNegativeType.value : '',
          num_blank_allowed          :this.state.numBlankAllowed,
          blank_negative_marks       :this.state.blankNegativeMarks,
          test_cutoff                :this.state.cutOffMarks,
          course_ids                 :(this.state.courseValue).map(x => x['value']).join(","),          
          folder_id:              this.props.folderId,
        }
    console.log(payloadSend);
    api(url, payloadSend)
    .then(response => {
      const { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" :  "warning")
      });    
      if (status){
          if(type==="save"){    
            console.log("save")
            this.props.actions.addTest({result:result[0],continueTest:false});
          }else{
            console.log("continue")
            this.setState(this.continueDefaults);
            this.props.actions.addTest({result:result[0],continueTest:true})     
          } 
      }
    })
    .catch(error => console.log(error))
    }else{
        payloadSend = {
            operation: "update",
            data_id:this.state.dataId,
            test_name: this.state.testName,
            is_question_jump: this.state.isQuestionJump === true ? 1 : 0,
            is_pausable : this.state.isPausable === true ? 1 : 0,                
            is_section_sequence_choose : this.state.isSectionShuffle === true ? 1 : 0,
            is_sectional_jump : this.state.isSectionJump === true ? 1 : 0,    
            scheduled_for :this.state.scheduledForValue,
            category_id                :this.state.topicValue ? this.state.topicValue.value : '',
            time_calculation           :this.state.timeCalculation ? this.state.timeCalculation.value : '',
            total_time                 :this.state.totalTime,
            timer_type                 :this.state.timerTypeValue ? this.state.timerTypeValue.value : '',
            interface_type             :this.state.interfaceTypeValue ? this.state.interfaceTypeValue.value : '',
            num_options_mcq            :this.state.numMcqOptionsValue ? this.state.numMcqOptionsValue.value : '',
            percentile_id              : this.state.percentileValue ? this.state.percentileValue.value : '',
            is_blank_negative          :this.state.isBlankNegative === true ? 1 : 0,
            blank_negative_type        :this.state.blankNegativeType ? this.state.blankNegativeType.value : '',  
            num_blank_allowed          :this.state.numBlankAllowed,
            blank_negative_marks       :this.state.blankNegativeMarks,
            course_ids                 :(this.state.courseValue).map(x => x['value']).join(","),          
            test_cutoff       :this.state.cutOffMarks,
            folder_id: this.props.folderId,
          }
    api(url, payloadSend)
      .then(response => {
        const { result, message, status } = response;
        this.props.actions.addFlag({
            message: message,
            appearance: (status ? "normal" :  "warning")
        });    
        if(status){
          if (result.length > 0 ){
            console.log(this.state.initialTestName, result[0].test_name)
            if (this.state.initialTestName != result[0].test_name){
              var PathOld = decodeURIComponent(window.location.pathname)
              var PathNew = PathOld.replace(this.state.initialTestName,result[0].test_name)
              console.log(PathOld,PathNew)
              browserHistory.push(PathNew)
            }              
            this.props.actions.editTest({result:result[0]})    
          }
          
          

            

            api(url_section, {
              operation: "read",
              test_id: this.state.dataId
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



        
          }
        }
      )
      .catch(error => console.log(error))
    }
  }

};    


render() {

  const editTest = this.props.editTest;

  return (
    <div className="add-question">
      <div className="add-edit-question-div">
        <div className="question-header">
          <div className="question-add-header">{editTest ? 'Edit Test'  : 'Add Test'} </div>
          <div className="close-add-question" >
            <CrossCircleIcon onClick={editTest ? this.handleEditTestClose : this.handleAddTestClose}></CrossCircleIcon>
          </div>
        </div>
        <Grid>
          <GridColumn medium={4}>
            <div className="field-div">
              <span className="field-label">Test Name<span className="is-required">*</span></span>
              <TextField
                // placeholder="CAT Mock.."
                name="testName"
                isInvalid={!this.state.isTestNameValid}
                onBlur={this.handleTestValidateBlur}
                onChange={this.handleTestNameChange}
                value={this.state.testName}
              />
            </div>
          </GridColumn>
          <GridColumn medium={4}>
            <div className="field-div">
              <span className="field-label">Category<span className="is-required">*</span></span>
              <Select
                name="topicValue"
                validationState={this.state.submitError.indexOf('topicValue') >= 0 ? 'error' : ''}
                options={this.props.topicOptions}
                // placeholder="Topicwise.."
                onChange={this.handleTopicChange}
                value={this.state.topicValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">Scheduled For<span className="is-required">*</span></span>
              <DatePicker
                // placeholder="2018/07/21"
                id="datepicker-1"
                name="scheduledForValue"
                disabled = {disableDate()}
                onChange={this.handleScheduledForChange}
                value={this.state.scheduledForValue}
              />
            </div>
          </GridColumn>

          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">Number MCQ Options:</span>
              <Select
                name="numMcqOptionsValue"
                options={this.props.numMcqOptions}
                // placeholder="4,5,6..."
                onChange={this.handleMcqOptionsChange}
                value={this.state.numMcqOptionsValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={4}>
            <div className="field-div">
              <span className="field-label">Test Interface:</span>
              <Select
                name="interfaceTypeValue"
                validationState={this.state.submitError.indexOf('interfaceTypeValue') >= 0 ? 'error' : ''}
                options={this.props.interfaceTypeOptions}
                // placeholder="Remaining.."
                onChange={this.handleInterfaceTypeChange}
                value={this.state.interfaceTypeValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div-toggle">
              <span className="field-label">Pausable?</span>
              <ToggleStateless isChecked={this.state.isPausable}
                name="isPausable"
                size="large"
                onChange={this.handleIsPausableChange}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div-toggle">
              <span className="field-label">Section Shuffle?</span>
              <ToggleStateless isChecked={this.state.isSectionShuffle}
                name="isSectionShuffle"
                size="large"
                onChange={this.handleSectionShuffleChange}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div-toggle">
              <span className="field-label">Question Jump?</span>
              <ToggleStateless isChecked={this.state.isQuestionJump}
                name="isQuestionJump"
                size="large"
                onChange={this.handleIsQuestionJump}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            {(this.state.isQuestionJump &&  !this.state.isSectionShuffle) && (
              <div className="field-div-toggle">
                <span className="field-label">Section Jump?</span>
                <ToggleStateless isChecked={this.state.isSectionJump}
                  name="isSectionJump"
                  size="large"
                  onChange={this.handleIsSectionJump}
                />
              </div>
            )}
          </GridColumn>
          <GridColumn medium={4}>
            <div className="field-div">
              <span className="field-label">Timer Type:</span>
              <Select
                name="timerTypeValue"
                validationState={this.state.submitError.indexOf('timerTypeValue') >= 0 ? 'error' : ''}
                options={this.props.timerTypeTypeOptions}
                // placeholder="Remaining.."
                onChange={this.handleTimerTypeChange}
                value={this.state.timerTypeValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={4}>
            <div className="field-div">
              <span className="field-label">Time Calculation:</span>
              <Select
                name="timeCalculation"
                validationState={this.state.submitError.indexOf('timeCalculation') >= 0 ? 'error' : ''}
                options={this.props.timeCalculationOptions}
                // placeholder="Sectional.."
                onChange={this.handleTimeCalculationChange}
                value={this.state.timeCalculation}
              />
            </div>
          </GridColumn>
          <GridColumn medium={4}>
            {(this.state.timeCalculation.value === "overall") && (
              <div className="field-div">
                <span className="field-label">Total Time (Min)</span>
                <TextField
                  // placeholder="100 Mins."
                  name="totalTime"
                  type="number"
                  min={0}
                  isInvalid={!this.state.totalTimeValid}
                  onChange={this.handleTotalTime}
                  value={this.state.totalTime}
                />
              </div>
            )}
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div-toggle">
              <span className="field-label">Blank Negative?</span>
              <ToggleStateless isChecked={this.state.isBlankNegative}
                name="isBlankNegative"
                size="large"
                onChange={this.handleIsBlankNegative}
              />
            </div>

          </GridColumn>
          <GridColumn medium={4}>
            {this.state.isBlankNegative && (
              <div className="field-div">
                <span className="field-label">Blank Negative Type</span>
                <Select
                  name="blankNegativeType"
                  options={this.props.blankNegativeTypeOptions}
                  // placeholder="Sectional.."
                  validationState={this.state.submitError.indexOf('blankNegativeType') >= 0 ? 'error' : ''}
                  onChange={this.handleBlankNegativeTypeChange}
                  value={this.state.blankNegativeType}
                />
              </div>

            )}
          </GridColumn>
          <GridColumn medium={3}>

            {(this.state.isBlankNegative && this.state.blankNegativeType.value === "overall") && (
              <div className="field-div">
                <span className="field-label">No. Blank Allowed</span>
                <TextField
                  // placeholder="1,2,3.."
                  name="numBlankAllowed"
                  type="number"
                  min={0}
                  isInvalid={!this.state.numBlankAllowedValid}
                  onChange={this.handleNumBlankAllowed}
                  value={this.state.numBlankAllowed}
                />
              </div>
            )}
          </GridColumn>
          <GridColumn medium={3}>
            {(this.state.isBlankNegative && this.state.blankNegativeType.value === "overall") && (
              <div className="field-div">
                <span className="field-label">Blank Negative Marks</span>
                <TextField
                  // placeholder="1,2,3.."
                  name="blankNegativeMarks"
                  type="number"
                  min={0}
                  isInvalid={!this.state.blankNegativeMarksValid}
                  onChange={this.handleBlankNegativeMarksChange}
                  value={this.state.blankNegativeMarks}
                />
              </div>
            )}
          </GridColumn>
          <GridColumn medium={4}>
            <div className="field-div">
                <span className="field-label">Cut Off Marks</span>
                <TextField
                  // placeholder="1,2,3.."
                  name="cutOffMarks"
                  type="number"
                  min={0}
                  isInvalid={!this.state.cutOffMarksValid}
                  onChange={this.handleCutOffMarks}
                  value={this.state.cutOffMarks}
                />
              </div>
          </GridColumn>
          <GridColumn medium={4}>
            <div className="field-div">
              <span className="field-label">Courses</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.props.courseOptions}
                // placeholder="CAT,XAT.."
                onChange={this.handleCourseChange}
                value={this.state.courseValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={4}>
            <div className="field-div">
              <span className="field-label">Percentile Table</span>
                <Select
                className="checkbox-select"
                classNamePrefix="select"
                options={this.props.percentileOptions}
                // placeholder="Table 1.."
                onChange={this.handlePercentileChange}
                value={this.state.percentileValue}
              />
            </div>
          </GridColumn>


        </Grid>
        <div className="submit-button-row">
          <div className="button-save">
            <Button onClick={this.handleSaveTest} appearance="primary">
              {editTest ? 'Update' : 'Add'}
            </Button>
          </div>
          <div className="button-save">
            {!editTest && (
              <Button onClick={this.handleSaveContinueTest} appearance="primary">
                Add and Continue
              </Button>

            )}
          </div>
          <div className="button-save">
            <Button onClick={editTest ? this.handleEditTestClose : this.handleAddTestClose} appearance="normal">
              Close
            </Button>
          </div>
        </div>
    </div>
    </div>
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

AddEditTest.propTypes = {
  topicOptions: PropTypes.array,
  folderId: PropTypes.string
};



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddEditTest);
