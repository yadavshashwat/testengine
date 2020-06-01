
import React, { Component } from 'react';


import { browserHistory } from 'react-router';
//do something...


// Backend Connection
import { api } from "../helpers/api";
// Redux 
import { connect } from "react-redux";
import Cookies from 'universal-cookie';

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../redux/actions/flag";
import authorization from "../redux/actions/authorization";

const url="/user/logout_user/";

class Logout extends Component {
  
  componentDidMount(){
    const cookies = new Cookies();
    const payload = {data_id:this.props.userId};
    
    api(url, payload)
    .then(response => {
      const { result, message, status} = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" :  "warning")
      });    

      // console.log(result)        
      if (status) {
          this.props.actions.logoutUser({});
          cookies.set('auth_token', '', { path: '/' });
          cookies.set('user_id', '', { path: '/' });
          browserHistory.push("/testengine/adminpanel/");
      }

  });
}

  render() {
    return (
        <div>

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
)(Logout);
