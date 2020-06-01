import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Page from '@atlaskit/page';
import '@atlaskit/css-reset';

import DashboardNavigation from '../components/DashboardNavigation';
import Cookies from 'universal-cookie';
import { browserHistory } from 'react-router';
import { api } from "../helpers/api";
import authorization from "../redux/actions/authorization";

// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";

const url="/user/login_user/";


class App extends Component {
  state = {

  };

  static contextTypes = {
    navOpenState: PropTypes.object,
    router: PropTypes.object,
  };

  static propTypes = {
    navOpenState: PropTypes.object,
    onNavResize: PropTypes.func,
  };


  componentDidMount(){
    const cookies = new Cookies();
    const auth_token = cookies.get('auth_token')
    const payload={auth_token:auth_token}
    if (!this.props.loggedIn){
      api(url, payload)
      .then(response => {
        const { result, message, status} = response;
        // console.log(result)        
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
            });
            console.log('loggin in try')
        }else{
          browserHistory.push("/testengine/adminpanel/");
          console.log('not logged in')
        }
    });
  }     
  }

  render() {
    return (
      <div>
        <Page
          navigationWidth={this.context.navOpenState.width}
          navigation={<DashboardNavigation/>}
        >
          {this.props.children}
        </Page>        
        
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
    actions: bindActionCreators({ ...authorization }, dispatch)
  };
}




export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);



