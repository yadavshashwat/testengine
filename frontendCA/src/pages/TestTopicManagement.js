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
import SearchIcon from "@atlaskit/icon/glyph/search";

import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import { CheckboxSelect } from '@atlaskit/select';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import TextArea from '@atlaskit/textarea';


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
var url = "/test/crud_testcategory/";

const itemOptions = [
  {'value':10,'label':'10 Items/Page'},
  {'value':20,'label':'20 Items/Page'},
  {'value':30,'label':'30 Items/Page'},
  {'value':50,'label':'50 Items/Page'},
  {'value':100,'label':'100 Items/Page'}
]

const emptyModalData = {
  "category": "overall",
  "description": "",
  "id": "",
  "sub_category": ""
};

const deleteConfMessage = "Are you sure you want to delete the test category? Please note that this will not delete any tests but will remove category from all assigned tests."
const deleteConfHeader = "Confirm Test Category Deletion"

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
      categoryOptions: [],
      searchIcon: true,

      categoryValue: [],
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
      category: (this.state.categoryValue).map(x => x['value']).join(",")
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

  handleCategoryChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ categoryValue: value, pageNum: 1 }, () => {
      this.applyFilter({ category: data, page_num: 1 });
    });
  };

  handleNumItemsChange = value => {
    this.setState({ pageSize: value ? value: "" , pageNum: 1 }, () => {
      this.applyFilter({ page_size: value ? value.value: "" , page_num: 1 });
    });
  }

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
      categoryValue: [],
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      pageNum: 1,
      searchIcon: true
    }, () => {
      this.applyFilter();
    });
  }


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



  
  submitData = data => {
    var submit = true
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === this.state.activeDataId);

    const categoryList = this.state.categoryOptions;
    const indexCat = categoryList.findIndex(x => x.value === data.category.value);
    console.log(indexCat)
    // console.log(index)
    if (submit) {
      this.setState({ loaded: false });
      if (this.state.isNew) {
        api(url, {
          operation: "create",
          category: data.category.value,
          sub_category: data.sub_category,
          description: data.description
        }).then(response => {
          const { result, message, status } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (status ? "normal" :  "warning")
          });    
          if (status){
            if (indexCat === -1){
              this.setState({
                categoryOptions:[{'value':result[0].category,'label':changeCase.titleCase(result[0].category)},...this.state.categoryOptions]
              })
            }            
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
          category: data.category.value,
          sub_category: data.sub_category,
          description: data.description,
          data_id:this.state.activeDataId
        }).then(response => {
          const { result, message, status } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (status ? "normal" :  "warning")
          });    
          if (status){
            if (indexCat === -1){
              this.setState({
                categoryOptions:[{'value':result[0].category,'label':changeCase.titleCase(result[0].category)},...this.state.categoryOptions]
              })
            }
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
            categoryOptions: JSON.parse(JSON.stringify(filter.category)),
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
          content: "Category",
          width: 20,
          isSortable: true,
          shouldTruncate: false
        },
        {
          key: "sub_category",
          content: "Topic",
          width: 20,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "description",
          content: "Topic Description",
          width: 30,
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
          content: changeCase.titleCase(row.category)
        },
        {
          key: row.id,
          content: changeCase.titleCase(row.sub_category)
        },
        {
          key: row.id,
          content: row.description
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
            Add New Topic
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
              <span className="field-label">Category</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.categoryOptions}
                placeholder="Categories"
                onChange={this.handleCategoryChange}
                value={this.state.categoryValue}
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
            } onClose={this.handleModalClose} height={475} heading={(this.state.isNew ? "Add" : "Edit") + " Test Topic"}>

              <Form onSubmit={this.submitData}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                    <GridColumn medium={12}>
                        <Field name="category" defaultValue={{ 'value': this.state.modalData.category, 'label': changeCase.titleCase(this.state.modalData.category) }}
                              label="Test Category" 
                              // placeholder="Sectional..." 
                              isRequired>
                          {({ fieldProps }) => <Select options={this.state.categoryOptions} {...fieldProps} />}
                        </Field>
                      </GridColumn>
                      <GridColumn medium={12}>
                        <Field name="sub_category" defaultValue={this.state.modalData.sub_category}
                              label="Topic" 
                              isRequired>
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. Inference" 
                          {...fieldProps} />}
                        </Field>
                      </GridColumn>
                      <GridColumn medium={12}>
                        <Field name="description"
                            defaultValue={this.state.modalData.description}
                            label="Topic Description"                            
                            // isRequired
                            >
                          {({ fieldProps }) => <TextArea
                          minimumRows = {3} 
                          // placeholder="eg. Inference are topics which require xyz" 
                          {...fieldProps} />}
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
