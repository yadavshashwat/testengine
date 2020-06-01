import PropTypes from 'prop-types';
import React, { Component } from 'react';
import '@atlaskit/css-reset';
import "../css/dashboard.css"

import { browserHistory } from 'react-router';
//do something...
import Page from '@atlaskit/page';

// Backend Connection
import { api } from "../helpers/api";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../redux/actions/flag";
import authorization from "../redux/actions/authorization";

import { Grid, GridColumn } from '@atlaskit/page';


import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button';
import Cookies from 'universal-cookie';
// import { Router, Route, Redirect, browserHistory  } from 'react-router';

const url="/user/reset_pass_user/";

class LoginPage extends Component {
  static contextTypes = {
    showModal: PropTypes.func,
    addFlag: PropTypes.func,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    onClose: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: ""
    }
  }

  handleEmailChange = event => {
    var data = event.target.value
    this.setState({
      email: data
    });
  };

  handlePasswordchange = event => {
    var data = event.target.value
    this.setState({
      password: data
    });
  };

  handleForgetPassword = () =>{


  }

  handleReset = () => {
    var Path = window.location.pathname.split("/")
    var secString = Path[4]
    const password = this.state.password;
    const cookies = new Cookies();
    // console.log(eMail,password)
    const payload = {
      sec_string:secString,
      pass:password
    }
    api(url, payload)
      .then(response => {
        const { result, message, status} = response;
        // console.log(result)
        
        this.props.actions.addFlag({
          message: message,
          appearance: (status ? "normal" :  "warning")
        });    
        if (status) {
            this.props.actions.loginUser({
              auth:result.auth,
              auth_token: result.user.auth_token,
              email: result.user.email,
              first_name: result.user.first_name,
              id: result.user.id,
              is_staff: result.user.is_staff,
              last_name: result.user.last_name,
              user_role: result.user.user_role
            })
            cookies.set('auth_token', result.user.auth_token, { path: '/' });
            cookies.set('user_id', result.user.id, { path: '/' });
            cookies.set('first_name', result.user.first_name, { path: '/' });
            cookies.set('last_name', result.user.last_name, { path: '/' });
            cookies.set('email', result.user.email, { path: '/' });
            browserHistory.push("/testengine/adminpanel/sections/");
        }else{

            cookies.set('auth_token', '', { path: '/' });
            cookies.set('user_id', '', { path: '/' });
            cookies.set('first_name', '', { path: '/' });
            cookies.set('last_name', '', { path: '/' });
            cookies.set('email', '', { path: '/' });
          }
      })
      .catch(error => {
        console.log("Handle Filter Failed");
      });
  }


  render() {

      return (
        
        <div className="outer-login">
          <div className="middle-login">
          <Page>
  
            <Grid>
              <GridColumn medium={3}></GridColumn>
              <GridColumn medium={6}>
                <Grid>
                  <div className="inner-login">
                    <GridColumn medium={12}>
  
                      <div className="image-container">
                        <div className="logo-image"></div>
                      </div>
  
                    </GridColumn>
                    <GridColumn medium={12}>
                    <GridColumn medium={12}>
                      <div className="field-div">
                        <TextField type="password" value={this.state.password} placeholder="Password" onChange={this.handlePasswordchange} />
                      </div>
                    </GridColumn>
                    <GridColumn medium={12}>
                    <br></br>
                      <div className="button-row-login">
                          <div className="login-button">
                          <Button onClick={this.handleReset} type="submit" appearance="primary">
                            Reset Password
                          </Button>
                          </div>
                        </div>
                    </GridColumn>  
                    </GridColumn>
                  </div>
                </Grid>
              </GridColumn>
              <GridColumn medium={3}></GridColumn>
            </Grid>
            </Page>
          </div>
        </div>
        
  
      );
    }
  
    }
  


function mapStateToProps(store) {
  return {
    ...store.authorization
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...authorization, ...flag }, dispatch)
  };
}




export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);
