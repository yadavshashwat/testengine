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
import coursetest from "../../../redux/actions/coursetest";
// Atlaskit Packages
import Button from '@atlaskit/button';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Grid, GridColumn } from '@atlaskit/page';
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import Lozenge from "@atlaskit/lozenge";
import Tag from '@atlaskit/tag';

//Icons


// Components

// Other Packages
import styled from "styled-components";
import Checkbox from 'react-simple-checkbox';
import Parser from "html-react-parser";


var changeCase = require("change-case");


// api url path
var url_start = "/usertest/start_continue/";
var url_test_update = "/usertest/update/";
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


var permArr = [],
  usedChars = [];
function permute(input) {
  var i, ch;
  for (i = 0; i < input.length; i++) {
    ch = input.splice(i, 1)[0];
    usedChars.push(ch);
    if (input.length == 0) {
      permArr.push(usedChars.slice());
    }
    permute(input);
    input.splice(i, 0, ch);
    usedChars.pop();
  }
  return permArr
};

class Instructions extends Component {
  constructor(props) {
    super(props);
    this.state = {
        instructionPage : 0,
        isConfirmed:false,
        isSequence:false,
        sectionOrders:[],
        selectedOrder:0
        
    };
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

  handleCheckBoxToggle = () => {
    this.setState({
        isConfirmed:!this.state.isConfirmed
    });
}

handleChooseSequence = () => {
  const perCobinations = permute(this.props.individualCourseTest.sections)
  this.setState({
    isSequence:true,
    sectionOrders:perCobinations
  })
  console.log(perCobinations) 
}

onRadioChange = (event) => {
  const data = event.target.value;

  this.setState({
    selectedOrder: data
  })
  // console.log(this.state.correctAnswer)
};


handleStartTest = () =>{
  api(url_start, { 
          email:this.props.userEmail,
          fname:this.props.fName, 
          lname:this.props.lName, 
          test_id:this.props.individualCourseTest.test_id, 
          mobile:this.props.mobile, 
          section_order: this.props.individualCourseTest.is_section_sequence_choose ? this.state.sectionOrders[this.state.selectedOrder].map(x => x['id']).join(",") : ''
          }).then(response => {
    const { result, status, error } = response;
    if (!error){
      if (status) {
        this.props.actions.setCourseTest({
          individualCourseTest:result['test'],
          individualCourseSection:result['sections'],
          activeSection:result['next_section'],
          activeQuestion:result['next_question']
        })
        // if (this.props.individualCourseSection.length > 0 ){
        //   api(url_test_update, {
        //     test_id: this.props.individualCourseTest.id,
        //     next_section_id : this.props.individualCourseSection[0],
        //     time_elapsed:0
        //   }).then(response => {


        //   })
  
        // }
      }
    }
  });



}






  render() {
      var instructions = this.props.individualCourseTest ? this.props.individualCourseTest.instructions : [];
      var activeInstruction = this.props.individualCourseTest ? (instructions.length ? instructions[this.state.instructionPage] : "") : "";
      var instructionPages = this.props.individualCourseTest ? this.props.individualCourseTest.instructions.length : 0
      let renderOptions = null;

      renderOptions = this.state.sectionOrders.map((row, key) => {
        var isOptionSelected = false
        if(this.state.selectedOrder === key){
            isOptionSelected = true
        }else{
            isOptionSelected = false
        }
        let optionList = null
        optionList = row.map((option) => {
          return (
            <li>
              {option.name}
            </li>
          )
        })

        return (
          <GridColumn medium={4}>
            <div key={key} className="general-option-creator-section">
                <div className="option-radio-button">
                    <input type="radio" name="option" defaultChecked={isOptionSelected} value={key} />
                </div>
                <div className="option-content">
                    <ol>
                      {optionList}
                    </ol>
                </div>
            </div>
            </GridColumn>
        );
    });



      return (
        <div>
            <div>
              <div className="general-header">
                <div className="general-test-header" align="center">{this.props.individualCourseTest ? this.props.individualCourseTest.test_name : ""}</div>
              </div>
              <div className="general-test-content-page">
                <div className="general-instructions-header"><b>{ this.state.isSequence ? "Please select the sequence order" : "Please read the following instructions carefully"}</b></div>
                { !this.state.isSequence && (
                  <div className="general-instructions-html">{Parser(activeInstruction)}</div>
                )}
                <br></br>
                { (this.state.instructionPage + 1 == instructionPages && !this.state.isSequence && !this.props.instructionOnly )   && (
                    <div className="general-checkbox-confirm">
                      <div className="general-checkbox-container">
                        <Checkbox
                          color={checkboxTheme}
                          size={3}
                          tickSize={3}
                          borderThickness={2}
                          className="checkbox-style-dashboard"
                          onChange={this.handleCheckBoxToggle}
                          checked={this.state.isConfirmed}
                        />
                      </div>
                      <div className="general-confirmation-statement">
                        The computer provided to me is in proper working condition. I have read and understood the instructions given above.
                      </div>
                  </div>
                )}
                <div className="general-instruction-buttons">
                  { (this.state.instructionPage + 1 > 1   && !this.state.isSequence)&& (
                    <div className="general-test-button"  onClick={this.handlePageBack}>
                      Back
                    </div>
                  )}
                  { (this.state.instructionPage + 1 < instructionPages && !this.state.isSequence)  && (
                    <div className="general-test-button" onClick={this.handlePageNext}>
                      Next
                    </div>
                  )}
                  { (this.state.instructionPage + 1 == instructionPages  && !this.state.isSequence  && !this.props.instructionOnly) && (
                      <div className={this.state.isConfirmed ? "general-test-button-strong" : "disabled-general-test-button"} onClick={this.props.individualCourseTest ? (this.props.individualCourseTest.is_section_sequence_choose ? this.handleChooseSequence : this.handleStartTest) : null}>
                        Start
                      </div>
                  )}
                </div>
                <div className="general-section-orders">
                  { this.state.isSequence && (
                    <div className="general-section-order-selection">
                      <form className="general-section-order-selection" onChange={this.onRadioChange} value={this.state.selectedOrder}>
                            <Grid spacing="compact">
                              {renderOptions}
                            </Grid>
                      </form>
                    
                    </div>
                  )}
                  { this.state.isSequence && ( 
                    <div className="general-instruction-buttons-centre">
                      <div className={"general-test-button-strong"} onClick={this.handleStartTest}>
                        Start Test
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </div>
      )
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
)(Instructions);
