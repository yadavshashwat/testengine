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

import Fullscreen from "react-full-screen";


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
        mobile:"",
        fullScreen:false
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
    var textPath = null;

    console.log('here')
    const cookies = new Cookies();
    // const auth_token = cookies.get('auth_token')
    var userEmail = cookies.get('email')
    var fName = cookies.get('first_name')
    var lName = cookies.get('last_name')
    // var mobile = "9717353148"
    var toPreview = false
    if (Path[2] == "adminpanel"){
      textPath = decodeURIComponent(Path[4])
      toPreview = true
    }else{
      textPath = decodeURIComponent(Path[3])
      toPreview = false
    }

    
  
    api(url_test, { operation: "read", 
                  test_name: textPath,
                  email:userEmail,
                  is_admin: toPreview ? "1" : "0"
            }).then(response => {
      const { result, status } = response;
      if (status) {
        this.props.actions.setCourseTest({
          individualCourseTest:result['test'],
          individualCourseSection:result['sections'],
          activeSection:result['next_section'],
          activeQuestion:result['next_question']
        })
        this.setState(
          {
            // loaded:true,
            isNew:false,
            userEmail:userEmail,
            fName:fName,
            lName:lName,
            // mobile:mobile
          })

          this.setState(
            {
              fullScreen:true
            }
          )
      
      } else{
            
        this.props.actions.setCourseTest({
          individualCourseTest:result['test'],
          individualCourseSection:result['sections'],
          activeSection:result['next_section'],
          activeQuestion:result['next_question']
        })

            this.setState(
              {
                loaded:true,
                isNew:true,
                userEmail:userEmail,
                fName:fName,
                lName:lName,
                // mobile:mobile
    
              })
              this.setState(
                {
                  fullScreen:true
                }
              )
    
      }
    });
  }

  render() {
    let pageToRender = null;
    if(this.props.individualCourseTest && this.props.individualCourseTest.is_complete){
      pageToRender = <Analysis></Analysis>
    }else{
      if (this.state.isNew){
        if (this.props.activeQuestion == null){
          if(this.props.activeSection == null){
            pageToRender =  
            <GeneralInstructions 
              userEmail = {this.state.userEmail}
              fName = {this.state.fName}
              lName = {this.state.lName}
              mobile = {this.state.mobile}
            >
            </GeneralInstructions>
          }else{
            pageToRender =  <SectionInstructions></SectionInstructions>              
          }
        }else{
              pageToRender = <TestQuestion></TestQuestion>
        }          
  }else{
    if (this.props.activeQuestion == null){
      if(this.props.activeSection == null){

        pageToRender =  
        <GeneralInstructions 
          userEmail = {this.state.userEmail}
          fName = {this.state.fName}
          lName = {this.state.lName}
          mobile = {this.state.mobile}
        >
        </GeneralInstructions>
      }else{
        pageToRender = <SectionInstructions></SectionInstructions>              
      }
    }else{
        pageToRender = <TestQuestion></TestQuestion>
      
    }          

  }
      
    }


    if (this.props.loaded){
      return (
        // <Fullscreen
        //   enabled={this.state.fullScreen}
        // >
        <Page>
          <div className="general-test">
            {pageToRender}
          </div>
        </Page>
        // </Fullscreen>
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
