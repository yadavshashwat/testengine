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
import section from "../../redux/actions/section";

// Atlaskit Packages

import Button from '@atlaskit/button';
import { Grid, GridColumn } from '@atlaskit/page';
import TextField from '@atlaskit/textfield';
import Select from "@atlaskit/select";
import { ToggleStateless } from '@atlaskit/toggle';
import { DatePicker } from '@atlaskit/datetime-picker';

//Icons
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
// Components



var changeCase = require("change-case");
// api url path
var url = "/test/crud_section/";

// function disableDate() {
//   var dateArray = []
//   for (var i=0; i < 600; i++){
//     var date = new Date();
//     date.setDate(-i);
//     dateArray.push(format(date, 'YYYY-MM-DD'))
//   }
//   return dateArray;
// }


class AddEditSection extends Component {
  constructor(props) {
    super(props);
    const editSection = this.props.editSection;
    if (editSection) {
      this.state = {
        dataId:editSection.id,
        sectionName: editSection.name,
        subSectionName: editSection.sub_section_name,
        isSectionNameValid: true,
        isSubSectionNameValid: true,
        userValue: {'value':editSection.assigned_to.id,'label':changeCase.titleCase(editSection.assigned_to.first_name + ' ' + editSection.assigned_to.last_name )},
        completionValue: editSection.to_complete_date ? editSection.to_complete_date : '',
        percentileValue:editSection.percentile ? {'value' : editSection.percentile.id,'label' :changeCase.titleCase(editSection.percentile.table_name)} : {'value' : '','label' :''} ,
        isManualEval: editSection.is_eval_manual,
        isCalculator: editSection.is_calculator,

        numQuestions: editSection.number_questions,
        numQuestionsValid: true,
        
        positiveMarks: editSection.default_positive_marks,
        positiveMarksValid: true,

        negativeMarks: editSection.default_negative_marks,
        negativeMarksValid: true,

        sectionTime: editSection.section_time ? editSection.section_time : '',
        sectionTimeValid: true,

        numBlankAllowed: editSection.num_blank_allowed ? editSection.num_blank_allowed : '',
        numBlankAllowedValid:true,

        blankNegativeMarks: editSection.blank_negative_marks ? editSection.blank_negative_marks : '',
        blankNegativeMarksValid:true,

        cutoffMarks: editSection.cutoff ? editSection.cutoff : '',
        cutoffMarksValid:true,

        submitError: [],
        testData: this.props.testData ? this.props.testData : this.editSection.test,
        initialSectionName:editSection.name
        

      };

    } else {
      this.state = {
        sectionName: '',
        subSectionName:'',
        isSectionNameValid: true,
        isSubSectionNameValid:true,
        userValue: '',
        completionValue:'',

        isManualEval: false,
        isCalculator: false,

        numQuestions: '',
        numQuestionsValid: true,
        
        positiveMarks: '1',
        positiveMarksValid: true,

        negativeMarks: '0',
        negativeMarksValid: true,

        sectionTime: '',
        sectionTimeValid: true,

        numBlankAllowed: '',
        numBlankAllowedValid:true,

        blankNegativeMarks: '',
        blankNegativeMarksValid:true,

        cutoffMarks: '',
        cutoffMarksValid:true,

        submitError: [],
        percentileValue:'',
        testData:this.props.testData,
        initialSectionName:''
      };
    }
      this.continueDefaults = {
        sectionName: '',
        subSectionName:'',
        isSectionNameValid: true,
        isSubSectionNameValid:true,
        userValue: '',
        completionValue:'',
        initialSectionName:''
      }
  }



handleSectionNameChange = event => {
  var data = event.target.value
  this.setState({ sectionName: data });
};

handleSubSectionNameChange = event => {
  var data = event.target.value
  this.setState({ subSectionName: data });
};

handlePercentileChange = value => {
  this.setState({ percentileValue: value })
}


handleSectionNameValidator = () => {
  if (this.state.sectionName.length) {
    api(url, {
      "operation": "validate",
      "section_name": this.state.sectionName,
      "test_id": this.state.testData.id
    }).then(response => {
      const { message, status } = response;
      
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
    
      if (status) {
        this.setState({ isSectionNameValid: true });
      } else {
        this.setState({ isSectionNameValid: false });
      }
    });
  }
}


handleUserChange = value => {
  this.setState({
    userValue: value
  })
}


handleCompletionDate = value => {
  this.setState({
    completionValue: value
  });
}



handleIsManualChange = () => {
  this.setState({
    isManualEval: !this.state.isManualEval
  });
}


handleIsCalculatorChange = () => {
  this.setState({
    isCalculator: !this.state.isCalculator
  });
}

handleNumQuestions = event => {
  var data = event.target.value
  if (data > 0) {
    this.setState({
      numQuestions: data,
      numQuestionsValid: true
    });
  } else {
    this.setState({
      numQuestions: '',
      numQuestionsValid: false
    });
  }
};

handlePositiveMarksChange = event => {
  var data = event.target.value
  if (data > 0) {
    this.setState({
      positiveMarks: data,
      positiveMarksValid: true
    });
  } else {
    this.setState({
      positiveMarks: '',
      positiveMarksValid: false
    });
  }
};

handleNegativeMarksChange = event => {
  var data = event.target.value
  if (data >= 0) {
    this.setState({
      negativeMarks: data,
      negativeMarksValid: true
    });
  } else {
    this.setState({
      negativeMarks: '',
      negativeMarksValid: false
    });
  }
};

handleCutoffMarksChange = event => {
  var data = event.target.value
  if (data >= 0) {
    this.setState({
      cutoffMarks: data,
      cutoffMarksValid: true
    });
  } else {
    this.setState({
      cutoffMarks: '',
      cutoffMarksValid: false
    });
  }
};


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


handleSectionTime = event => {
  var data = event.target.value
  if (data > 0) {
    this.setState({
      sectionTime: data,
      sectionTimeValid: true
    });
  } else {
    this.setState({
      sectionTime: '',
      sectionTimeValid: false
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



handleAddSectionClose = () => {
  this.props.actions.closeAddSection({});
}

handleEditSectionClose = () => {
  this.props.actions.setEmptyEditSection({});
}

handleSaveSection = () =>{
  this.SaveSection('save');
}

handleSaveContinueSection = () =>{
  this.SaveSection('continue');
}

checkError = () => {
  var noError = true
  var errorMessage = ""

  // console.log(noError)
  if (this.state.negativeMarks == "" && this.state.negativeMarks !=0 ){
    console.log(this.state.negativeMarks,'here')
    noError = false;
    errorMessage = "Missing Negative Marks!"
  }

  if (this.state.positiveMarks == ""  && this.state.positiveMarks !=0 ){
    noError = false;
    errorMessage = "Missing Positive Marks!"
  }


  if (this.state.sectionName == ""){
      noError = false;
      errorMessage = "Missing Section Name!"
  }


  if (!noError){
      this.props.actions.addFlag({
          message: errorMessage,
          appearance: "warning"
        });        
  }
  return noError

}

SaveSection = (type) => {
  const submitCheck = this.checkError();
  var payloadSend = null;
  if (submitCheck){
    if(this.props.editSection === null){
      payloadSend = {
          operation: "create",
          name                  : this.state.sectionName,
          number_questions      : this.state.numQuestions,
          assigned_to           : this.state.userValue ? this.state.userValue.value : '',
          is_eval_manual        : this.state.isManualEval === true ? 1 : 0,
          test_id               : this.state.testData.id,
          to_complete_date      : this.state.completionValue,
          num_blank_allowed     : this.state.numBlankAllowed,
          blank_negative_marks  : this.state.blankNegativeMarks,
          section_time          : this.state.sectionTime,
          is_calculator         : this.state.isCalculator === true ? 1 : 0,
          percentile_id         :this.state.percentileValue ? this.state.percentileValue.value : '',
          def_positive_marks    : this.state.positiveMarks,
          def_negative_marks    : this.state.negativeMarks          ,
          sub_section_name    : this.state.subSectionName          ,
          section_cutoff    : this.state.cutoffMarks          
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
            this.props.actions.addSection({result:result[0],continueSection:false});
          }else{
            console.log("continue")
            this.setState(this.continueDefaults);
            this.props.actions.addSection({result:result[0],continueSection:true})     
          } 
      }
    })
    .catch(error => console.log(error))
    }else{
        payloadSend = {
            operation: "update",
            data_id               :this.state.dataId,
            name                  : this.state.sectionName,
            number_questions      : this.state.numQuestions,
            assigned_to           : this.state.userValue ? this.state.userValue.value : '',
            is_eval_manual        : this.state.isManualEval === true ? 1 : 0,
            to_complete_date      : this.state.completionValue,
            num_blank_allowed     : this.state.numBlankAllowed,
            blank_negative_marks  : this.state.blankNegativeMarks,
            section_time          : this.state.sectionTime,
            percentile_id         :this.state.percentileValue ? this.state.percentileValue.value : '',
            is_calculator         : this.state.isCalculator === true ? 1 : 0,
            def_positive_marks    : this.state.positiveMarks,
            def_negative_marks    : this.state.negativeMarks,        
            sub_section_name      : this.state.subSectionName,
            section_cutoff        : this.state.cutoffMarks                
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
            this.props.actions.editSection({result:result[0]})
          }



        }
        }
      )
      .catch(error => console.log(error))
    }
  }

};    


render() {

  const editSection = this.props.editSection;
  return (
    <div className="add-question">
      <div className="add-edit-question-div">
        <div className="question-header">
          <div className="question-add-header">{editSection ? 'Edit Section'  : 'Add Section'} </div>
          <div className="close-add-question" >
            <CrossCircleIcon onClick={editSection ? this.handleEditSectionClose : this.handleAddSectionClose}></CrossCircleIcon>
          </div>
        </div>
        <Grid>
          <GridColumn medium={3}>
            <div className="field-div">
              <span className="field-label">Section Name<span className="is-required">*</span></span>
              <TextField
                // placeholder="Verbal..."
                name="testName"
                isInvalid={!this.state.isSectionNameValid}
                // onBlur={this.handleSectionNameValidator}
                onChange={this.handleSectionNameChange}
                value={this.state.sectionName}
              />
            </div>
          </GridColumn>
          <GridColumn medium={3}>
            <div className="field-div">
              <span className="field-label">Sub Section Name</span>
              <TextField
                // placeholder="RC..."
                name="subSectionName"
                isInvalid={!this.state.isSubSectionNameValid}
                onChange={this.handleSubSectionNameChange}
                value={this.state.subSectionName}
              />
            </div>
          </GridColumn>

          <GridColumn medium={3}>
            <div className="field-div">
              <span className="field-label">Assigned to</span>
              <Select
                name="userValue"
                validationState={this.state.submitError.indexOf('userValue') >= 0 ? 'error' : ''}
                options={this.props.assignedToOptions}
                // placeholder="John Doe.."
                onChange={this.handleUserChange}
                value={this.state.userValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={3}>
            <div className="field-div">
              <span className="field-label">Completion Date</span>
              <DatePicker
                // placeholder="2018/07/21"
                id="datepicker-1"
                name="completionDate"
                onChange={this.handleCompletionDate}
                value={this.state.completionValue}
              />
            </div>
          </GridColumn>

          <GridColumn medium={2}>
            <div className="field-div-toggle">
              <span className="field-label">Manual Evaluation?</span>
              <ToggleStateless isChecked={this.state.isManualEval}
                name="isManualEval"
                size="large"
                onChange={this.handleIsManualChange}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div-toggle">
              <span className="field-label">Calculator?</span>
              <ToggleStateless isChecked={this.state.isCalculator}
                name="isCalculator"
                size="large"
                onChange={this.handleIsCalculatorChange}
              />
            </div>
          </GridColumn>
          <GridColumn medium={3}>
              <div className="field-div">
                <span className="field-label">Positive Marks<span className="is-required">*</span></span>
                <TextField
                  // placeholder="1,2,3..."
                  name="positiveMarks"
                  type="number"
                  min={0}
                  isInvalid={!this.state.positiveMarksValid}
                  onChange={this.handlePositiveMarksChange}
                  value={this.state.positiveMarks}
                />
              </div>
          </GridColumn>
          <GridColumn medium={3}>
              <div className="field-div">
                <span className="field-label">Negative Marks<span className="is-required">*</span></span>
                <TextField
                  // placeholder="1,2,3..."
                  name="negativeMarks"
                  type="number"
                  min={0}
                  isInvalid={!this.state.negativeMarksValid}
                  onChange={this.handleNegativeMarksChange}
                  value={this.state.negativeMarks}
                />
              </div>
          </GridColumn>
          <GridColumn medium={2}>
              <div className="field-div">
                <span className="field-label">Cutoff Marks</span>
                <TextField
                  // placeholder="1,2,3..."
                  name="cutOff"
                  type="number"
                  min={0}
                  isInvalid={!this.state.cutoffMarksValid}
                  onChange={this.handleCutoffMarksChange}
                  value={this.state.cutoffMarks}
                />
              </div>
          </GridColumn>
          {(!this.state.testData || this.state.testData.time_calculation === "sectional") && (
          <GridColumn medium={2}>
              <div className="field-div">    
                <span className="field-label">Section Time (Min)</span>
                <TextField
                  // placeholder="100 Mins."
                  name="sectionTime"
                  type="number"
                  min={0}
                  isInvalid={!this.state.sectionTimeValid}
                  onChange={this.handleSectionTime}
                  value={this.state.sectionTime}
                />
              </div>
          </GridColumn>
          )}
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

          {(!this.state.testData || (this.state.testData.is_blank_negative && this.state.testData.blank_negative_type ===  "sectional")) && (
          <GridColumn medium={2}>
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
          </GridColumn>
          )}
          {(!this.state.testData || (this.state.testData.is_blank_negative && this.state.testData.blank_negative_type ===  "sectional")) && (
          <GridColumn medium={2}>
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
          </GridColumn>
          )}
        </Grid>
        <div className="submit-button-row">
          <div className="button-save">
            <Button onClick={this.handleSaveSection} appearance="primary">
              {editSection ? 'Update' : 'Add'}
            </Button>
          </div>
          <div className="button-save">
            {!editSection && (
              <Button onClick={this.handleSaveContinueSection} appearance="primary">
                Add and Continue
              </Button>
            )}
          </div>
          <div className="button-save">
            <Button onClick={editSection ? this.handleEditSectionClose : this.handleAddSectionClose} appearance="normal">
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
    ...store.section
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...section, ...flag }, dispatch)
  };
}

AddEditSection.propTypes = {
  topicOptions: PropTypes.array,
  folderId: PropTypes.string
};



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddEditSection);
