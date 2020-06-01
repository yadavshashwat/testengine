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
// var url_start = "/usertest/start_continue/";
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


class Instructions extends Component {
  constructor(props) {
    super(props);
    this.state = {
        instructionPage : 0
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



handleSectionStart = () =>{
  var next_section_id = null;
  var next_question_id = null;

  next_question_id = this.props.individualCourseSection.filter(row => row.id === this.props.activeSection.id)[0].questions[0].id

  console.log(next_question_id)
  api(url_test_update, { 
          test_id:this.props.individualCourseTest.id, 
          section_id:this.props.activeSection.id,
          next_section_id:this.props.activeSection.id,
          question_id:"",
          next_question_id:next_question_id,
          time_elapsed:"0",
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
          nextQuestion:result['next_question']
        })
      }
    }
  });



}






  render() {
      var instructions = this.props.activeSection ? this.props.activeSection.instructions : [];
      var activeInstruction = this.props.individualCourseTest ? (instructions.length ? instructions[this.state.instructionPage] : "") : "";
      var instructionPages = this.props.activeSection ? this.props.activeSection.instructions.length : 0

      return (
        <div>
            <div>
            <div className="general-header">
                <div className="general-test-header" align="center">{this.props.individualCourseTest ? this.props.individualCourseTest.test_name : ""}</div>
                <div className="general-section-header" align="center">{this.props.activeSection ? this.props.activeSection.name : ""}</div>
              </div>
              <div className="general-test-content-page">
                <div className="general-instructions-header"><b>Please read the following instructions carefully.</b></div>
                <div className="general-instructions-html">{Parser(activeInstruction)}</div>
                <br></br>
                <div className="general-instruction-buttons">
                  { (this.state.instructionPage + 1 > 1)&& (
                    <div className="general-test-button"  onClick={this.handlePageBack}>
                      Back
                    </div>
                  )}
                  { (this.state.instructionPage + 1 < instructionPages)  && (
                    <div className="general-test-button" onClick={this.handlePageNext}>
                      Next
                    </div>
                  )}
                  { (this.state.instructionPage + 1 == instructionPages) && (
                      <div className="general-test-button-strong" onClick={this.handleSectionStart}>
                        Start Section
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
