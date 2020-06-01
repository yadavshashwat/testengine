import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router';
import '@atlaskit/css-reset';
import "../css/dashboard.css"

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

import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import Lozenge from "@atlaskit/lozenge";
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import TextField from '@atlaskit/textfield';
import Form, { Field } from '@atlaskit/form';
import Button from '@atlaskit/button';
import { CheckboxSelect } from '@atlaskit/select';
import SearchIcon from "@atlaskit/icon/glyph/search";
import Arrow from '@atlaskit/icon/glyph/arrow-right';
import pathIcon from "../routing/BreadCrumbIcons"
import ContentWrapper from '../components/ContentWrapper';
import styled from "styled-components";

import LockIcon from '@atlaskit/icon/glyph/lock';
var changeCase = require("change-case");
const url_test = "/test/crud_test/";
const url_course = "/course/crud_courses/";

const deleteConfMessage = "Are you sure you want to remove the test from the course? Please note this will not delete the test just the link to the course."
const deleteConfHeader = "Confirm Test Removal"


class CoursePage extends Component {
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
      isAdminPanel:false,
      courseId: "",
      courseName: "",
      isLiveModalOpen:false,
      isConfModalOpen:false,
      activeDataId:"",
      activeDataType:"",
      searchIcon: true,
      searchValue: "",
      testOptions: [],
      addTestModalOpen:false

    }
  }



  handleConfModalOpen = event => {
    const dataId = event.currentTarget.dataset.id;
    const testType = event.currentTarget.dataset.type;
    console.log(dataId)
    this.setState({
      isConfModalOpen: true,
      activeDataId:dataId,
      activeDataType:testType
    })
  }

  handleConfModalClose = () => {
    this.setState({
      isConfModalOpen: false,
      activeDataId:'',
      activeDataType:''
    })
  }


  validateTest = event => {
    const dataId = event.currentTarget.dataset.id;
    api(url_test, { operation: "live", test_ids: dataId, is_live: '1', validate: '1'}).then(response => {
      const { message, status, result,warnings,critical_errors } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.setState({
          warnings:warnings,
          critical_errors:critical_errors,
          isLiveModalOpen:true,
          activeDataId:dataId
        })
      }
    })
  }

  handleRemove = event => {
    const dataId = this.state.activeDataId;
    const testType = this.state.activeDataType;
    api(url_test, { operation: "remove_course", test_id: dataId, course_id : this.state.courseId}).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        console.log(dataId,testType)
        this.props.actions.removeCourseTest({
          dataID:dataId,
          testType:testType
        })
        this.handleConfModalClose();
      }
    })
  }


  handleAddTestModalClose = () => {
    this.setState({
      addTestModalOpen:false
    })
  }

  handleAddTestModalOpen = () => {
    this.setState({
      addTestModalOpen:true
    })
  }

  handleAddTest = data => {
    console.log(data)
    api(url_test, { operation: "add_course", test_id: (data.testId).map(x => x['value']).join(","), course_id : this.state.courseId}).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.addCourseTest({
          result:result
        })
        this.handleAddTestModalClose();
      }
    })

  }


  handleLiveModalClose = () => {
    this.setState({
      isLiveModalOpen:false,
      warning:[],
      critical_errors:[],
      activeDataId:''
    })
  }
  
  handleLiveModalOpen = () => {
    this.setState({
      isLiveModalOpen:true
    })
  }
  
  makeLive = event => {
    const dataId = this.state.activeDataId;
    api(url_test, { operation: "live", test_ids: dataId, is_live: '1',validate: '0' }).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editCourseTest({ result: result[0] })
        this.handleLiveModalClose()
      }
      
    })
  }




  makeOffline = event => {
    const dataId = event.currentTarget.dataset.id;
    api(url_test, { operation: "live", test_ids: dataId, is_live: '0',validate: '0' }).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editCourseTest({ result: result[0] })
      }
      this.handleLiveModalClose()
    })
  }
  hideSearchIcon = () => {
    this.setState({ searchIcon: false });
  };

  showSearchIcon = event => {
    if (event.target.value === "") {
      this.setState({ searchIcon: true });
    }
  };

  handleSearchChange = event => {
    // console.log(event.target.value)
    const data = event.target.value
    this.setState({ searchValue: data, pageNum: 1 }, () => {
      this.applyFilter({ search: data, page_num: 1 });
    });
  }
  applyFilter = obj => {
    this.setState({ loaded: false });
    let payloadData = {
      operation: "read",
      // Basic Filters
      search: this.state.searchValue,
      page_num: 1,
      page_size: 200000,
      course_name : this.state.courseName,
    };
    let payload = Object.assign({}, payloadData, obj);
    // console.log(payload, "Payload");
    api(url_test, payload)
      .then(response => {
        const { result, status, num_pages, total_records } = response;
        if (status) {
          this.props.actions.setCourseTestList({
            coursetestlist: result,
            totalCourseTests: total_records,
            setTotal: true
          });
        }
      })
      .catch(error => {
        console.log("Handle Filter Failed");
      });
  };



  componentDidMount() {
    this.props.actions.setDefaultCourseTest({});
    var Path = window.location.pathname.split("/")
    var textPath = null;
    var isAdminPanel = false;
    var userEmail = "y.shashwat@gmail.com"
    
    if (Path.indexOf('adminpanel') >= 0){
      isAdminPanel = true
    }else{
      isAdminPanel = false
    }
    console.log(isAdminPanel)
    if(isAdminPanel){
      textPath = decodeURIComponent(Path[4])
    }else{
      textPath = decodeURIComponent(Path[3])
    }
    console.log(textPath)
    
    // console.log(textPath)
    api(url_course, { operation: "read", 
                course_name: textPath,
                page_num: 1,
                page_size: 200000 }).then(response => {
      const { result,status,filter } = response;
      if (status) {
        if (result.length > 0 ){
          this.setState(
            {
              courseId: result[0].id,
              courseName: textPath,
              testOptions:filter.tests,
              isAdminPanel:isAdminPanel
              
            }
          )
          api(url_test, { operation: "read", 
                          is_adminpanel : isAdminPanel ? "1" : "0",                
                          course_id: result[0].id,              
                          user_email : isAdminPanel ? "" : userEmail,
         }).then(response => {
            const { result,  status, total_records } = response;
              if (status){
                this.props.actions.setCourseTestList({
                  coursetestlist: result,
                  totalCourseTests: total_records,
                  setTotal: true
                });
                console.log(result,textPath)              
              } 
          })  
        }
      }
    });
  }









  render() {

    const DropdownStatusItem = styled.div`
    align-items: center;
    display: flex;
    width: 60px;
`;

const SearchIconContainer = styled.div`
position: absolute;
top: 49px;
left: 20px;
`;




    let breadCrumbElement = null
    var Path = window.location.pathname.split("/")
    var textPath = null;
    breadCrumbElement = Path.map((row, index) => {
      if (index > 2 && index < (Path.length - 1)){
        if (['question-bank', 'test-bank','courses'].indexOf(Path[index - 1]) >= 0) {
          textPath = decodeURIComponent(Path[index])
        } else {
          textPath = changeCase.titleCase(Path[index])
        }
        var link =  (Path.slice(0,index + 1).join("/")) + "/"
        try{
          return (<BreadcrumbsItem key={index} iconBefore={pathIcon[Path[index]]} href={link} text={textPath} />);
        }
        catch(err){
          return (<BreadcrumbsItem key={index} href={link} text={textPath} />);
        }
      } else {
        return null;
      }
    });
    // let status_test = null
    // if (row.active_test){
    //   if (row.active_test.is_complete){
        
    //   }
    // }else{
    //   status_test = "Not Started"
    // }
    let overallTests = null;
    overallTests = this.props.overalltests.map((row,index) => {
      return (
              <GridColumn medium={12} className="folder-grid">
                  <div className="settings-div">
                    <div className="test-name">
                      {this.state.isAdminPanel && (
                        <span>{index + 1}. <Link to={"/testengine/adminpanel/test-bank/allbanks/" + row.test_name + "/"}>{row.test_name}</Link></span>
                      )}
                      {!this.state.isAdminPanel && (
                        <span>{index + 1}. {row.test_name}</span>
                      )}
                      
                    </div>
                    <div className={this.state.isAdminPanel ? "test-schedule-name" : "test-schedule-name-course"}>
                      {row.is_live ?  "Live" : "Scheduled: " + row.scheduled_for}
                    </div>
                    { !this.state.isAdminPanel && (
                      <div className="test-score">
                          { row.active_test ? (row.active_test.is_complete ? "Score: " + row.active_test.score : "Incomplete") : "Not Started"}
                      </div>
                    )}
                    { !this.state.isAdminPanel && ( 
                      <div className="test-schedule-option">
                        {row.is_live && (
                        <Link to={"/testengine/tests/" + row.test_name + "/"}>
                        <Button appearance="primary" className="start-test-button">
                          {row.active_test ? (row.active_test.is_complete ? "Analysis" : "Continue") : "Take Test"}
                        </Button>
                        </Link>
                        )}
                      {!row.is_live && (
                        <LockIcon size="small"></LockIcon>
                      )}

                      </div>
                   )}

                    { this.state.isAdminPanel && (
                    <div className="test-schedule-option">
                      <DropdownMenu
                        trigger="Options"
                        triggerType="button"
                        shouldFlip={true}
                        role="bottom"
                       >
                        <DropdownItemGroup>
                        <Link to={"/testengine/adminpanel/test-bank/allbanks/" + row.test_name + "/"}><DropdownItem>Open</DropdownItem></Link>
                        <a target="_blank" href={"/testengine/adminpanel/tests/" + row.test_name + "/"}><DropdownItem>Preview</DropdownItem></a>
                          <DropdownItem
                            data-id={row.id} 
                            data-live={row.is_live}
                            onClick={row.is_live ? this.makeOffline.bind(this) : this.validateTest.bind(this)}
                            elemAfter={
                              <DropdownStatusItem>
                                <Arrow label="" size="small" />
                                <Lozenge appearance={row.is_live ? "moved" : "success"}>{row.is_live ? "Offline" : "Live"}</Lozenge>
                              </DropdownStatusItem>
                            }
                          >{row.is_live ? "Take Offline" : "Make Live"}</DropdownItem>
                          
                            { !row.is_live && (
                              <DropdownItem data-id={row.id} data-type={row.category ? row.category.category : "overall"} onClick={this.handleConfModalOpen.bind(this)}>Remove</DropdownItem>
                            )}
                        </DropdownItemGroup>
                      </DropdownMenu>                                              
                    </div>
                    )}
                  </div>
            </GridColumn>

              )
    })

    let sectionalTests = null;
    sectionalTests = this.props.sectionaltests.map((row,index) => {
      return (
              <GridColumn medium={12} className="folder-grid">
                  <div className="settings-div">
                    <div className="test-name">
                    
                    {this.state.isAdminPanel && (
                        <span>{index + 1}. <Link to={"/testengine/adminpanel/test-bank/allbanks/" + row.test_name + "/"}>{row.test_name}</Link></span>
                      )}
                      {!this.state.isAdminPanel && (
                        <span>{index + 1}. {row.test_name}</span>
                        )}
                    </div>
                    <div className="test-schedule-name">
                      {row.is_live ?  "Live" : "Scheduled: " + row.scheduled_for}
                    </div>
                    { !this.state.isAdminPanel && (
                      <div className="test-score">
                          { row.active_test ? (row.active_test.is_complete ? "Score: " + row.active_test.score : "Incomplete") : "Not Started"}
                      </div>
                    )}
                    { !this.state.isAdminPanel && ( 
                      <div className="test-schedule-option">
                      {row.is_live && (
                        <Link to={"/testengine/tests/" + row.test_name + "/"}>
                        <Button appearance="primary" className="start-test-button">
                          {row.active_test ? (row.active_test.is_complete ? "Analysis" : "Continue") : "Take Test"}
                        </Button>
                        </Link>
                        )}        
                      {!row.is_live && (
                        <LockIcon size="small"></LockIcon>
                      )}
                      </div>
                   )}
                    { this.state.isAdminPanel && (
                    <div className="test-schedule-option">
                    <DropdownMenu
                      trigger="Options"
                      triggerType="button"
                      shouldFlip={true}
                      role="bottom"
                     >
                      <DropdownItemGroup>
                      <Link to={"/testengine/adminpanel/test-bank/allbanks/" + row.test_name + "/"}><DropdownItem>Open</DropdownItem></Link>
                      <a target="_blank" href={"/testengine/adminpanel/tests/" + row.test_name + "/"}><DropdownItem>Preview</DropdownItem></a>
                        <DropdownItem
                          data-id={row.id} 
                          data-live={row.is_live}
                          onClick={row.is_live ? this.makeOffline.bind(this) : this.validateTest.bind(this)}
                          elemAfter={
                            <DropdownStatusItem>
                              <Arrow label="" size="small" />
                              <Lozenge appearance={row.is_live ? "moved" : "success"}>{row.is_live ? "Offline" : "Live"}</Lozenge>
                            </DropdownStatusItem>
                          }
                        >{row.is_live ? "Take Offline" : "Make Live"}</DropdownItem>
                        
                          { !row.is_live && (
                            <DropdownItem data-id={row.id} data-type={row.category ? row.category.category : "overall"} onClick={this.handleConfModalOpen.bind(this)}>Remove</DropdownItem>
                          )}
                      </DropdownItemGroup>
                    </DropdownMenu>                                              
                  </div>
                
                     )}
                </div>
            </GridColumn>

              )
    })
    let topicwiseTests = null;
    topicwiseTests = this.props.topicwisetests.map((row,index) => {
      return (
              <GridColumn medium={12} className="folder-grid">
                  <div className="settings-div">
                    <div className="test-name">
                    
                    {this.state.isAdminPanel && (
                        <span>{index + 1}. <Link to={"/testengine/adminpanel/test-bank/allbanks/" + row.test_name + "/"}>{row.test_name}</Link></span>
                      )}
                      {!this.state.isAdminPanel && (
                        <span>{index + 1}. {row.test_name}</span>
                        )}
                    </div>
                    <div className="test-schedule-name">
                      {row.is_live ?  "Live" : "Scheduled: " + row.scheduled_for}
                    </div>
                    { !this.state.isAdminPanel && (
                      <div className="test-score">
                          { row.active_test ? (row.active_test.is_complete ? "Score: " + row.active_test.score : "Incomplete") : "Not Started"}
                      </div>
                    )}
                    { !this.state.isAdminPanel && ( 
                      <div className="test-schedule-option">
                        {row.is_live && (
                        <Link to={"/testengine/tests/" + row.test_name + "/"}>
                        <Button appearance="primary" className="start-test-button">
                          {row.active_test ? (row.active_test.is_complete ? "Analysis" : "Continue") : "Take Test"}
                        </Button>
                        </Link>
                        )} 
                      {!row.is_live && (
                        <LockIcon size="small"></LockIcon>
                      )}

                      </div>
                   )}
                    { this.state.isAdminPanel && (
                    <div className="test-schedule-option">
                      <DropdownMenu
                        trigger="Options"
                        triggerType="button"
                        shouldFlip={true}
                        role="bottom"
                       >
                        <DropdownItemGroup>
                        <Link to={"/testengine/adminpanel/test-bank/allbanks/" + row.test_name + "/"}><DropdownItem>Open</DropdownItem></Link>
                        <a target="_blank" href={"/testengine/adminpanel/tests/" + row.test_name + "/"}><DropdownItem>Preview</DropdownItem></a>
                          <DropdownItem
                            data-id={row.id} 
                            data-live={row.is_live}
                            onClick={row.is_live ? this.makeOffline.bind(this) : this.validateTest.bind(this)}
                            elemAfter={
                              <DropdownStatusItem>
                                <Arrow label="" size="small" />
                                <Lozenge appearance={row.is_live ? "moved" : "success"}>{row.is_live ? "Offline" : "Live"}</Lozenge>
                              </DropdownStatusItem>
                            }
                          >{row.is_live ? "Take Offline" : "Make Live"}</DropdownItem>
                            { !row.is_live && (
                              <DropdownItem data-id={row.id} data-type={row.category ? row.category.category : "overall"} onClick={this.handleConfModalOpen.bind(this)}>Remove</DropdownItem>
                            )}
                        </DropdownItemGroup>
                      </DropdownMenu>                                              
                    </div>
                    )}
                  </div>
            </GridColumn>

              )
    })

    return (

            <ContentWrapper>
            { this.state.isAdminPanel && (
              <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
              )
            }
            { !this.state.isAdminPanel && (
              <h1>{this.state.courseName}</h1>
              )
            }
            { this.state.isAdminPanel && (
            <Grid>
              <GridColumn medium={10}></GridColumn>
              <GridColumn medium={2}>
                <div className="add-question-div">
                    <Button onClick={this.handleAddTestModalOpen} appearance="primary">
                      Add Test
                  </Button>
                </div>
              </GridColumn>
            </Grid>
            )
            }
            <Grid spacing="compact">
              <GridColumn medium={2}>
                <div className="field-div">
                  {this.state.searchIcon === true && (
                    <SearchIconContainer>
                      <SearchIcon />
                    </SearchIconContainer>
                  )}
                  <span className="field-label">Search</span>
                  <TextField
                    onFocus={this.hideSearchIcon}
                    onBlur={this.showSearchIcon}
                    onChange={this.handleSearchChange}
                    value={this.state.searchValue}
                    appearance="standard"
                  />
                </div>
              </GridColumn>
            </Grid>
            
            <br></br>
            
            <Grid>
              { this.props.overalltests.length > 0 && (<GridColumn medium={12}><h2>Overall Tests</h2></GridColumn>)}
              {overallTests}
            </Grid>
            <br></br>
            <Grid>
              { this.props.sectionaltests.length > 0 && (<GridColumn medium={12}><h2>Sectional Tests</h2></GridColumn>)}
              {/* <GridColumn medium={12}><h2>Sectional Tests</h2></GridColumn> */}
              {sectionalTests}
            </Grid>
            <br></br>
            <Grid>
            { this.props.topicwisetests.length > 0 && (<GridColumn medium={12}><h2>Topicwise Tests</h2></GridColumn>)}
              {/* <GridColumn medium={12}><h2>Topicwise Tests</h2></GridColumn> */}
              {topicwiseTests}
            </Grid>
            <ModalTransition>
              {this.state.isLiveModalOpen && (
                <Modal autoFocus={false} actions={
                  [
                    { text: 'Make Live', appearance: 'primary', onClick: this.makeLive },
                    { text: 'Close', appearance: 'normal', onClick: this.handleLiveModalClose }
                  ]
                } onClose={this.handleLiveModalClose} heading={"Test Warnings and Errors"}>
                <b>Critical Errors: </b>
                <ul>
                  {
                    this.state.critical_errors.map((row) => {
                      return <li>{row}</li>
                    })

                  }
                  </ul>
                  <br></br>
                  <b>Warnings: </b>
                <ul>
                  {
                    this.state.warnings.map((row) => {
                      return <li>{row}</li>
                    })

                  }
                  </ul>
                </Modal>
              )}
            </ModalTransition>
            <ModalTransition>
            {this.state.isConfModalOpen && (
              <Modal autoFocus={false}  actions={
                [
                  { text: 'Confirm', appearance: 'primary', onClick: this.handleRemove},
                  { text: 'Close', appearance: 'normal', onClick: this.handleConfModalClose }
                ]
              } onClose={this.handleConfModalClose} heading={deleteConfHeader}>
                {deleteConfMessage}
              </Modal>

            )}
          </ModalTransition>

            {this.state.addTestModalOpen && (
          <ModalTransition>
          <Modal height={500} autoFocus={false} autoFocus={false} actions={
            [
              { text: 'Close', appearance: 'normal', onClick: this.handleAddTestModalClose },
            ]
          } onClose={this.handleAddTestModalClose} heading="Add Tests">
            Please select the tests to be added to the course.
            <Form onSubmit={this.handleAddTest}>
              {({ formProps }) => (
                <form {...formProps}>
                  <Grid>
                    <GridColumn medium={12}>
                      <Field name="testId" label="Test Name" isRequired>
                        {({ fieldProps }) => 
                        <CheckboxSelect
                        className="checkbox-select"
                        classNamePrefix="select"
                        options={this.state.testOptions}
                        {...fieldProps}
                      />
                        
                        // <Select
                        //   options={this.state.testOptions}
                        //   placeholder="TB1..."
                        //   {...fieldProps}
                        // />
                        }
                      </Field>
                    </GridColumn>
                  </Grid>
                  <Grid>
                    <GridColumn medium={12}>
                      <br></br>
                      <br></br>
                      <Button type="submit" appearance="primary">
                        Add
                      </Button>
                    </GridColumn>
                  </Grid>
                </form>
              )}
            </Form>

          </Modal>
        </ModalTransition>
          )}



          </ContentWrapper>
  
      );
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
)(CoursePage);
