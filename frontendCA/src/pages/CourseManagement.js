// React
import React, { Component } from 'react';
import { Link } from 'react-router';
// Styles
import "../css/dashboard.css"

// Backend Connection
import { api } from "../helpers/api.js";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../redux/actions/flag";

// Atlaskit Packages
import Select from "@atlaskit/select";
import Button from '@atlaskit/button';
import DynamicTable from '@atlaskit/dynamic-table';
import SearchIcon from "@atlaskit/icon/glyph/search";

import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import { CheckboxSelect } from '@atlaskit/select';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import TextArea from '@atlaskit/textarea';

import { CopyToClipboard } from 'react-copy-to-clipboard';
//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import pathIcon from "../routing/BreadCrumbIcons"

// Components
import ContentWrapper from '../components/ContentWrapper';

// Other Packages
import ReactPaginate from 'react-paginate';
import styled from "styled-components";
var changeCase = require("change-case");


// api url path
var url = "/course/crud_courses/";
const itemOptions = [
  {'value':10,'label':'10 Items/Page'},
  {'value':20,'label':'20 Items/Page'},
  {'value':30,'label':'30 Items/Page'},
  {'value':50,'label':'50 Items/Page'},
  {'value':100,'label':'100 Items/Page'}
]


const emptyModalData = {
  "course_name": '',
  "display_name": {
                  'english':'',
                    'hindi':'',
                    'tamil':'',
                    'telugu':''
                    },
  "id": "",
};

const deleteConfMessage = "Are you sure you want to delete the course? "
const deleteConfHeader = "Confirm Course Deletion"

class TestCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      // pagination variables
      loaded: false,
      pageNum: 1, //Current page
      pageSize: {'value':50,'label':'50 Items/Page'},
      // filter variables
      isStaff: "1",
      sortByOptions: [],
      orderByOptions: [],
      searchIcon: true,
      languageOptions : [],
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      // Modal variables
      isModalOpen: false,
      submitError: "",
      isNew: true,
      modalData: emptyModalData,
      activeDataId: "",
      isConfModalOpen:false,

    };
  }

  hideSearchIcon = () => {
    this.setState({ searchIcon: false });
  };

  showSearchIcon = event => {
    if (event.target.value === "") {
      this.setState({ searchIcon: true });
    }
  };


  applyFilter = obj => {
    this.setState({ loaded: false });
    let payloadData = {
      operation: "read",
      is_staff: this.state.isStaff,
      // Basic Filters
      sort_by: this.state.sortValue ? this.state.sortValue.value : "",
      order_by: this.state.orderBy,
      search: this.state.searchValue,
      page_num: 1,
      page_size: this.state.pageSize.value,
    };
    let payload = Object.assign({}, payloadData, obj);
    // console.log(payload, "Payload");
    api(url, payload)
      .then(response => {
        const { result, status, num_pages } = response;
        if (status) {
          this.setState({
            data: result,
            loaded: true,
            numPages: num_pages,
          });

        }
      })
      .catch(error => {
        console.log("Handle Filter Failed");
      });
  };

  // Filters Handling

  handlePageClick = data => {
    let selected = data.selected;
    this.setState({ pageNum: selected + 1 }, () => {
      this.applyFilter({ page_num: selected + 1 });
    });

  };

  handleNumItemsChange = value => {
    this.setState({ pageSize: value ? value: "" , pageNum: 1 }, () => {
      this.applyFilter({ page_size: value ? value.value: "" , page_num: 1 });
    });
  }


  handleSortChange = value => {
    this.setState({ sortValue: value ? value: "" , pageNum: 1 }, () => {
      this.applyFilter({ sort_by: value ? value.value: "" , page_num: 1 });
    });
  };


  toggleOrderBy = () => {
    let orderBy = this.state.orderBy;
    let toggle = orderBy === "asc" ? "desc" : "asc";
    this.setState({ orderBy: toggle });
    if (this.state.sortValue !== "") {
      this.setState({ pageNum: 1 }, () => {
        this.applyFilter({ order_by: toggle, page_num: 1 });
      });
    }
  };



  handleSearchChange = event => {
    // console.log(event.target.value)
    const data = event.target.value
    this.setState({ searchValue: data, pageNum: 1 }, () => {
      this.applyFilter({ search: data, page_num: 1 });
    });
  }


  handleConfModalOpen = event => {
    const dataId = event.currentTarget.dataset.id;
    this.setState({
      isConfModalOpen:true,
      activeDataId:dataId
    })
  }


  handleConfModalClose = () => {
    this.setState({
      isConfModalOpen:false,
      activeDataId:""
    })
  }


  handleDelete = () => {
    const dataId = this.state.activeDataId
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === dataId);
    api(url, {
      operation: "delete",
      data_id:dataId
    }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" :  "warning")
      });    
      if (status){
        this.setState({            
          data: [
            ...this.state.data.slice(0, index),
            ...this.state.data.slice(index + 1)
          ],
          loaded: true,    
        });
        this.handleConfModalClose();  
      }else{
        this.setState({
          loaded:true
        })
      }
    });
  }

  
  handleEditModalOpen = event => {
    const user_id = event.currentTarget.dataset.id
    this.setState({ isNew: false, activeDataId: user_id });

    api(url, {
      operation: "read",
      data_id: user_id,
    }).then(response => {
      const { result, status } = response;
      if (status) {
        this.setState(
          {
            modalData: result[0],
          }, () => {
            this.setState({ isModalOpen: true });
          });
      }
      // console.log(result[0])
    });
  }

  handleCopyCourse = event => {
    const course_id = event.currentTarget.dataset.id
    api(url, {
      operation: "copy",
      data_id: course_id,
    }).then(response => {
      const { result, status,message } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" :  "warning")
      });    
      if (status) {
        this.setState({            
          data: [
            ...this.state.data,
               result[0]
          ],
          loaded: true,            
        });
      }
    });
  }


  handleAddModalOpen = () => {
    this.setState({
      isModalOpen: true,
      isNew: true,
      activeDataId: "",
      modalData: Object.assign({}, emptyModalData)
    });
  }

  handleModalClose = () => {
    this.setState({
      isModalOpen: false,
      isNew: true,
      activeDataId: "",
      modalData: Object.assign({}, emptyModalData)
    });
  }


  handleCopyCourseLink= event => {
    this.props.actions.addFlag({
      message: "Course Link Copied!",
      appearance: "normal"
    });
  }

  
  submitData = data => {
    var submit = true
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === this.state.activeDataId);
    console.log(data)
    // console.log(index)
    if (submit) {
      this.setState({ loaded: false });
      if (this.state.isNew) {
        api(url, {
          operation: "create",
          course_name: data.english,
          display_name: JSON.stringify({'english':data.english,'hindi':data.hindi,'tamil':data.tamil,'telugu':data.telugu}),
        }).then(response => {
          const { result, message, status } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (status ? "normal" :  "warning")
          });    
          if (status){
            this.setState({
              data: [result[0], ...this.state.data],
              loaded: true
            });
            this.handleModalClose();  
          }else{
            this.setState({
              loaded:true
            })
          }
        });
      }else{
        api(url, {
          operation: "update",
          course_name: data.english,
          display_name: JSON.stringify({'english':data.english,'hindi':data.hindi,'tamil':data.tamil,'telugu':data.telugu}),
          data_id:this.state.activeDataId
        }).then(response => {
          const { result, message, status } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (status ? "normal" :  "warning")
          });    
          if (status){
            this.setState({            
              data: [
                ...this.state.data.slice(0, index),
                   result[0],
                ...this.state.data.slice(index + 1)
              ],
              loaded: true,            
            });
            this.handleModalClose();
          }else{
            this.setState({
              loaded:true
            })
          }
        });
      }
    }
  }


  // On Load
  componentDidMount() {
    api(url, { operation: "read",  page_num: this.state.pageNum, page_size: this.state.pageSize.value }).then(response => {
      const { result, filter, message, status, num_pages } = response;
      // this.props.actions.addFlag({
      //   message: message,
      //   appearance: (status ? "normal" :  "warning")
      // });
      if (status) {
        this.setState(
          {
            data: result,
            loaded: true,
            numPages: num_pages,
            sortByOptions: JSON.parse(JSON.stringify(filter.sort_by)),
            orderByOptions: JSON.parse(JSON.stringify(filter.order_by)),
            languageOptions: JSON.parse(JSON.stringify(filter.languages)),
          }
        );
      }
    });
  }


  render() {
    // const caption = "User Lists";
    const SearchIconContainer = styled.div`
      position: absolute;
      top: 49px;
      left: 20px;
    `;


    const DataWrapper = styled.div`
      width: 100%;
      padding-top:15px;
  `  ;

    const SortIconContainer = styled.div`
      margin-top:46px;
      cursor:pointer
  `  ;

    const head = {
      cells: [
        {
          key: "category",
          content: "Name",
          width: 40,
          isSortable: true,
          shouldTruncate: false
        },
        {
          key: "testTotal",
          content: "Total Tests",
          width: 15,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "created",
          content: "Created/Modified",
          width: 25,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "operations",
          content: "Operations",
          width: 20,
          isSortable: false,
          shouldTruncate: false
        },
      ]
    }


    let rowRenderElement = null;
    // if (this.state.loaded) {
    rowRenderElement = this.state.data.map((row, index) => ({
      key: `row.id`,
      cells: [
        {
          key: row.id,
          content: <Link to={'/testengine/adminpanel/courses/' + row.course_name + '/'}>{row.course_name}</Link>
        },
        {
          key: row.id,
          content: row.total_tests
        },
        {
          key: row.id,
          content: <div><b>C:</b> {row.created_at}<br></br><b>M:</b> {row.modified_at}</div>
        },
        {
          key: row.id,
          content: <DropdownMenu
            trigger="Options"
            triggerType="button"
            shouldFlip={false}
            position="bottom"
          >
            <DropdownItemGroup key={row.id}>
              <Link to={'/testengine/adminpanel/courses/' + row.course_name + '/'}><DropdownItem data-id={row.id}>Open</DropdownItem></Link>
              <DropdownItem data-id={row.id} onClick={this.handleEditModalOpen.bind(this)}>Edit</DropdownItem>
              <CopyToClipboard onCopy={this.handleCopyCourseLink} text={'https://www.careeranna.com/testengine/courses/' + row.course_name + '/'}><DropdownItem data-id={row.id}>Copy Link</DropdownItem></CopyToClipboard>
              <DropdownItem data-id={row.id} onClick={this.handleCopyCourse.bind(this)}>Copy</DropdownItem>
              <DropdownItem data-id={row.id} onClick={this.handleConfModalOpen.bind(this)}>Delete</DropdownItem>
            </DropdownItemGroup>
          </DropdownMenu>

        },

      ]
    }
    ));

    let breadCrumbElement = null
    var Path = window.location.pathname.split("/")
    breadCrumbElement = Path.map((row, index) => {
      if (index > 2 && index < (Path.length - 1)){
        var textPath = changeCase.titleCase(Path[index])
        var link =  (Path.slice(0,index + 1).join("/")) + "/"
        // console.log(index,textPath, link)
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

    let orderByIcon = <SortIconContainer><ArrowUpCircleIcon></ArrowUpCircleIcon></SortIconContainer>
    if (this.state.orderBy === "asc") {
      orderByIcon = <SortIconContainer><ArrowUpCircleIcon onClick={this.toggleOrderBy} className="sortIcon"></ArrowUpCircleIcon></SortIconContainer>
    } else {
      orderByIcon = <SortIconContainer><ArrowDownCircleIcon onClick={this.toggleOrderBy} className="sortIcon"></ArrowDownCircleIcon></SortIconContainer>
    }

    return (
      <ContentWrapper>
      <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        <Grid spacing="compact">
          <GridColumn medium={10}></GridColumn>
          <GridColumn medium={2}>
          <Button onClick={this.handleAddModalOpen} appearance="primary">
            Add New Course
          </Button>
          </GridColumn>
        </Grid>
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
          <GridColumn medium={7}>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">Sort</span>
              <Select
                isClearable
                className="single-select"
                classNamePrefix="react-select"
                options={this.state.sortByOptions}
                placeholder="Sort By"
                value={this.state.sortValue}
                onChange={this.handleSortChange}
              />
            </div>
          </GridColumn>
          <GridColumn medium={1}>
            {orderByIcon}
          </GridColumn>
        </Grid>
        <Grid spacing="compact">
          <DataWrapper>
          <Grid>
                <GridColumn medium={10}>
                {(this.state.loaded && this.state.numPages > 1) && (
                <ReactPaginate
                  previousLabel={'<'}
                  nextLabel={'>'}
                  breakLabel={'...'}
                  breakClassName={'break-me'}
                  pageCount={this.state.numPages}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={this.handlePageClick}
                  containerClassName={'pagination'}
                  previousClassName={'pagination-next'}
                  nextClassName={'pagination-next'}
                  subContainerClassName={'pages-pagination'}
                  activeClassName={'active'}
                  forcePage={this.state.pageNum - 1}
                />
                )}
                </GridColumn>
                <GridColumn medium={2}>            
                <div className="field-div-pagination">
                <Select
                  name="numItems"
                  options={itemOptions}
                  // placeholder="4,5,6..."
                  onChange={this.handleNumItemsChange}
                  value={this.state.pageSize}
                />
                </div>
                </GridColumn>
              </Grid>
            <br></br>
            <DynamicTable
              isLoading={!this.state.loaded}
              head={head}
              rows={rowRenderElement}
              defaultPage={1}
              className="user-table"
            />
              <Grid>
                <GridColumn medium={10}>
                {(this.state.loaded && this.state.numPages > 1) && (
                <ReactPaginate
                  previousLabel={'<'}
                  nextLabel={'>'}
                  breakLabel={'...'}
                  breakClassName={'break-me'}
                  pageCount={this.state.numPages}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={5}
                  onPageChange={this.handlePageClick}
                  containerClassName={'pagination'}
                  previousClassName={'pagination-next'}
                  nextClassName={'pagination-next'}
                  subContainerClassName={'pages-pagination'}
                  activeClassName={'active'}
                  forcePage={this.state.pageNum - 1}
                />
                )}
                </GridColumn>
                <GridColumn medium={2}>            
                <div className="field-div-pagination">
                <Select
                  name="numItems"
                  options={itemOptions}
                  // placeholder="4,5,6..."
                  onChange={this.handleNumItemsChange}
                  value={this.state.pageSize}
                />
                </div>
                </GridColumn>
              </Grid>
          </DataWrapper>
        </Grid>
        <ModalTransition>
          {this.state.isModalOpen && (

            <Modal autoFocus={false}  actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleModalClose },
              ]
            } onClose={this.handleModalClose} height={475} heading={(this.state.isNew ? "Add" : "Edit") + "  Course"}>

              <Form onSubmit={this.submitData}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                      <GridColumn medium={12}>
                        <Field name="english" defaultValue={this.state.modalData.course_name}
                              label="Course Name (English)" 
                              isRequired
                              >
                          {({ fieldProps }) => <TextField placeholder="English" {...fieldProps} />}
                        </Field>
                      </GridColumn>
                      <GridColumn medium={12}>
                        <Field name="hindi" defaultValue={(this.state.modalData.display_name.hindi)}
                              label="Course Name (Hindi)" 
                              // isRequired
                              >
                          {({ fieldProps }) => <TextField placeholder="हिंदी" {...fieldProps} />}
                        </Field>
                      </GridColumn>
                      <GridColumn medium={12}>
                        <Field name="tamil" defaultValue={this.state.modalData.display_name.tamil}
                              label="Course Name (Tamil)" 
                              // isRequired
                              >
                          {({ fieldProps }) => <TextField placeholder="தமிழ்" {...fieldProps} />}
                        </Field>
                      </GridColumn>

                      <GridColumn medium={12}>
                        <Field name="telugu" defaultValue={this.state.modalData.display_name.telugu}
                              label="Course Name (Telugu)" 
                              // isRequired
                              >
                          {({ fieldProps }) => <TextField placeholder="తెలుగు" {...fieldProps} />}
                        </Field>
                      </GridColumn>

                    </Grid>
                    <Grid>
                      <GridColumn medium={12}>
                        <br></br>
                        <span className="invalid">{this.state.submitError}</span>
                        <br></br>
                        <Button type="submit" appearance="primary">
                          Submit
                      </Button>
                      </GridColumn>
                    </Grid>
                  </form>
                )}
              </Form>
            </Modal>

          )}
        </ModalTransition>
        <ModalTransition>
          {this.state.isConfModalOpen && (
            <Modal autoFocus={false}  actions={
              [
                { text: 'Confirmed', appearance: 'primary', onClick: this.handleDelete },
                { text: 'Close', appearance: 'normal', onClick: this.handleConfModalClose },
              ]
            } onClose={this.handleConfModalClose} heading={deleteConfHeader}>
                {deleteConfMessage}              
            </Modal>

          )}
        </ModalTransition>
      </ContentWrapper>

    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...flag }, dispatch)
  };
}

export default connect(
  null,
  mapDispatchToProps
)(TestCategory);
