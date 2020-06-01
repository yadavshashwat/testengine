import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import DashboadSidebarApp from './DashboardSidebarApp';
// import HomePage from '../pages/HomePage';
// import SettingsPage from '../pages/SettingsPage';
import Routes from "../routing/RoutesList"
import { Provider } from 'react-redux';
import store from '../store';
import Flag from "../components/Flag";
export default class MainRouter extends Component {
  constructor() {
    super();
    this.state = {
      navOpenState: {
        isOpen: true,
        width: 304,
      }
    }
  }

  getChildContext () {
    return {
      navOpenState: this.state.navOpenState,
    };
  }

  appWithSidebar = () => (props) => (
    <DashboadSidebarApp
      onNavResize={this.onNavResize}
      {...props}
    />
  )


  onNavResize = (navOpenState) => {
    this.setState({
      navOpenState,
    });
  }
  store
  render() {
    return (
      
      <Provider store={store} key="provider">
      <Router history={browserHistory}>
        {
          Routes.map((prop, key) => {
            if (prop.pageType === "dashboard"){
              return (
                <Route key={key} component={this.appWithSidebar()}>
                  <Route path={prop.path} component={prop.component} key={key} />
                </Route>
              );
            }else{
              return(
                <Route path={prop.path} component={prop.component} key={key} />
              )
            }
          })
        }
      </Router>
      <Flag/>
      </Provider>
      
      
    );
  }
}

MainRouter.childContextTypes = {
  navOpenState: PropTypes.object,
}
