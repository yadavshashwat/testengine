import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router';
import '@atlaskit/css-reset';
import "../css/dashboard.css"
import Cookies from 'universal-cookie';
import { browserHistory } from 'react-router';
//do something...


// Backend Connection
import { api } from "../helpers/api";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../redux/actions/flag";
import coursetest from "../redux/actions/coursetest";
import Page from '@atlaskit/page';


import GeneralInstructions from "../components/ActiveTests/General/Instructions"
import Analysis from "../components/ActiveTests/Analysis"



import TestQuestion from '../components/ActiveTests/General/TestQuestion';
import SectionInstructions from '../components/ActiveTests/General/SectionInstructions';




var changeCase = require("change-case");
const url_test = "/usertest/validate/";
var url_test_update = "/usertest/update/";
// const url_start_test = "/course/crud_courses/";


class ActiveTest extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
        loaded:false,
        isNew:true,
        userEmail:"",
        fName:"",
        lName:"",
        mobile:""
    }
  }

  handleSequenceOrderPage = () => {
    this.setState({
      isSequenceSelection:true
    })
  }





  componentDidMount() {
    this.props.actions.setDefaultCourseTest({});
    var Path = window.location.pathname.split("/")
    
  
    api(url_test, { operation: "read", 
                  test_name: decodeURIComponent(Path[3]),
                  email:decodeURIComponent(Path[4])
            }).then(response => {
      const { result, status } = response;
      if (status) {
        this.props.actions.setCourseTest({
          individualCourseTest:result['test'],
          individualCourseSection:result['sections'],
          activeSection:result['next_section'],
          activeQuestion:result['next_question']
        })      
    
    }
    });
  }

  render() {
    let pageToRender = <Analysis></Analysis>;

    if (this.props.loaded){
      return (
        <Page>
          <div className="general-test">
            {pageToRender}
          </div>
        </Page>
        );
        
    }else{
      return (
        <div className="loader-page">
          <div className="image-container">
          </div>
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
)(ActiveTest);
