// React
import React, { Component } from 'react';

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
import Lozenge from "@atlaskit/lozenge";
import SearchIcon from "@atlaskit/icon/glyph/search";
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import { CheckboxSelect } from '@atlaskit/select';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';

//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
// import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import pathIcon from "../routing/BreadCrumbIcons"

// Components
import ContentWrapper from '../components/ContentWrapper';

// Other Packages
import ReactPaginate from 'react-paginate';
import styled from "styled-components";
var changeCase = require("change-case");
var validator = require("email-validator");
const itemOptions = [
  {'value':10,'label':'10 Items/Page'},
  {'value':20,'label':'20 Items/Page'},
  {'value':30,'label':'30 Items/Page'},
  {'value':50,'label':'50 Items/Page'},
  {'value':100,'label':'100 Items/Page'}
]

// api url path
var url = "/user/crud_users/";

const emptyModalData = {
  id: "",
  first_name: "",
  last_name: "",
  email: "",
  user_role: "staff",
  is_staff: true,
  is_active: true
};


class StaffPage extends Component {
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
      userTypeOptions: [],
      searchIcon: true,

      userTypeValue: [],
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      // Modal variables
      isModalOpen: false,
      submitError: "",
      isNew: true,
      modalData: emptyModalData,
      activeDataId: ""
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
      user_type: (this.state.userTypeValue).map(x => x['value']).join(",")
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

  handleSortChange = value => {
    this.setState({ sortValue: value ? value: "" , pageNum: 1 }, () => {
      this.applyFilter({ sort_by: value ? value.value: "" , page_num: 1 });
    });
  };

  handleUserChange = value => {
    const data = (value).map(x => x['value']).join(",");
    // console.log(data);
    this.setState({ userTypeValue: value, pageNum: 1 }, () => {
      this.applyFilter({ user_type: data, page_num: 1 });
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

  clearFilter = () => {
    this.setState({
      userTypeValue: [],
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      pageNum: 1,
      searchIcon: true
    }, () => {
      this.applyFilter();
    });
  }

  handleNumItemsChange = value => {
    this.setState({ pageSize: value ? value: "" , pageNum: 1 }, () => {
      this.applyFilter({ page_size: value ? value.value: "" , page_num: 1 });
    });
  }



  handleSearchChange = event => {
    // console.log(event.target.value)
    const data = event.target.value
    this.setState({ searchValue: data, pageNum: 1 }, () => {
      this.applyFilter({ search: data, page_num: 1 });
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

  handleActivateDeactivate = event => {
    const user_id = event.currentTarget.dataset.id
    const userList = this.state.data;
    const index = userList.findIndex(x => x.id === user_id);
    const isActive = userList[index].is_active
    // console.log(userList)
    // console.log(index)
    api(url, {
      operation: "activate",
      is_active: isActive ? "0" : "1",
      data_id:user_id,
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
      }else{
        this.setState({
          loaded:true
        })
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


  checkemail = data => {
    var submit = true;
    this.setState({ submitError: "" });
    if (
      data.email === "" ||
      !validator.validate(data.email)
    ) {
      submit = false;
      this.setState({submitError:"Invalid Email ID"});
    }
    return submit;
  }

  
  submitData = data => {
    var submit = this.checkemail(data);
    const userList = this.state.data;
    const index = userList.findIndex(x => x.id === this.state.activeDataId);
    // console.log(index)
    if (submit) {
      this.setState({ loaded: false });
      if (this.state.isNew) {
        api(url, {
          operation: "create",
          fname: data.first_name,
          lname: data.last_name,
          email: data.email,
          is_staff: 1,
          user_role: data.user_role.value,
          is_active: 1
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
          fname: data.first_name,
          lname: data.last_name,
          data_id:this.state.activeDataId,
          is_staff: 1,
          user_role: data.user_role.value,
          is_active: 1
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
    api(url, { operation: "read", is_staff: this.state.isStaff, page_num: this.state.pageNum, page_size: this.state.pageSize.value }).then(response => {
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
            userTypeOptions: JSON.parse(JSON.stringify(filter.user_type)),
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
          key: "first_name",
          content: "First Name",
          width: 15,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "last_name",
          content: "Last Name",
          width: 15,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "email",
          content: "User Email",
          width: 30,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "status",
          content: "Status",
          width: 10,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "user_role",
          content: "User Role",
          width: 10,
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
          content: changeCase.titleCase(row.first_name)
        },
        {
          key: row.id,
          content: changeCase.titleCase(row.last_name)
        },
        {
          key: row.id,
          content: row.email
        },
        {
          key: row.id,
          content: row.is_active === true ? (
            <Lozenge appearance="success">Active</Lozenge>
          ) : (
              <Lozenge appearance="removed">Deactive</Lozenge>
            )
        },
        {
          key: row.id,
          content: changeCase.titleCase(row.user_role)
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
              <DropdownItem data-id={row.id} onClick={this.handleEditModalOpen.bind(this)}>Edit</DropdownItem>
              <DropdownItem data-id={row.id} onClick={this.handleActivateDeactivate.bind(this)}> {row.is_active ? 'Deactivate':'Activate'}</DropdownItem>
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
            Add New User
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
          <GridColumn medium={3}>
            <div className="field-div">
              <span className="field-label">User Roles</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.userTypeOptions}
                placeholder="User Roles"
                onChange={this.handleUserChange}
                value={this.state.userTypeValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={4}>
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
            } onClose={this.handleModalClose} height={475} heading={(this.state.isNew ? "Add" : "Edit") + " User"}>

              <Form onSubmit={this.submitData}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                      <GridColumn medium={6}>
                        <Field name="first_name" defaultValue={this.state.modalData.first_name}
                              label="First name" 
                              isRequired>
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. John"
                           {...fieldProps} />}
                        </Field>
                      </GridColumn>
                      <GridColumn medium={6}>
                        <Field name="last_name"
                            defaultValue={this.state.modalData.last_name}
                            label="Last name"                            
                            isRequired>
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Doe" 
                          {...fieldProps} />}
                        </Field>
                      </GridColumn>
                      <GridColumn medium={12}>
                        <Field name="email" isDisabled={!this.state.isNew} defaultValue={this.state.modalData.email} label="Email" isRequired>
                          {({ fieldProps }) => <TextField 
                          //  placeholder="eg. alpha@alpha.com"
                            {...fieldProps} />}
                        </Field>
                      </GridColumn>
                      <GridColumn medium={12}>
                        <Field name="user_role" defaultValue={{ 'value': this.state.modalData.user_role, 'label': changeCase.titleCase(this.state.modalData.user_role) }} label="User Role" isRequired>
                          {({ fieldProps }) => <Select
                            options={this.state.userTypeOptions}
                            // placeholder="User Role"
                            {...fieldProps}
                          />}
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
)(StaffPage);
