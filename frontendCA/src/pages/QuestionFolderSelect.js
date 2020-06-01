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
import SearchIcon from "@atlaskit/icon/glyph/search";
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
// import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import pathIcon from "../routing/BreadCrumbIcons"

// Components
import ContentWrapper from '../components/ContentWrapper';

// Other Packages
import ReactPaginate from 'react-paginate';
import styled from "styled-components";
import ContentLoader from "react-content-loader";
var changeCase = require("change-case");

// api url path
var url = "/question/crud_supfolders/";

const itemOptions = [
  {'value':10,'label':'10 Items/Page'},
  {'value':20,'label':'20 Items/Page'},
  {'value':30,'label':'30 Items/Page'},
  {'value':50,'label':'50 Items/Page'},
  {'value':100,'label':'100 Items/Page'}
]

const emptyModalData = {
  "description": "",
  "id": "",
  "folder_name": ""
};

const loaderArray = [1,2,3]
const random = Math.random() * (1 - 0.7) + 0.9;

const MyTextLoader = () => (
  <ContentLoader
    speed={2}
    primaryColor="#f3f3f3"
    secondaryColor="#ecebeb"
    className="contentLoaderStyle"
  >
    <rect x="0" y="15" rx="5" ry="5" width={400 * random} height="15" />
    <rect x="0" y="75" rx="5" ry="5" width="350" height="15" />
    <rect x="0" y="45" rx="5" ry="5" width={200 * random} height="15" />
  </ContentLoader>
);


class QuestionBank extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      // pagination variables
      loaded: false,
      pageNum: 1, //Current page
      pageSize: {'value':100,'label':'100 Items/Page'},
      // filter variables
      isStaff: "1",
      sortByOptions: [],
      orderByOptions: [],
      searchIcon: true,
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      isModalOpen: false,
      isNew:true,
      modalData: emptyModalData
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
      // Basic Filters
      sort_by: this.state.sortValue ? this.state.sortValue.value : "",
      order_by: this.state.orderBy,
      search: this.state.searchValue,
      page_num: 1,
      page_size: this.state.pageSize.value,
    };
    let payload = Object.assign({}, payloadData, obj);
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



  handleSearchChange = event => {
    const data = event.target.value
    this.setState({ searchValue: data, pageNum: 1 }, () => {
      this.applyFilter({ search: data, page_num: 1 });
    });
  }

  submitData = data => {
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === this.state.activeDataId);
    var submit = true;
    // console.log(index)
    if (submit) {
      this.setState({ loaded: false });
      if (this.state.isNew) {
        api(url, {
          operation: "create",
          folder_name: data.folder_name
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
          data_id:this.state.activeDataId,
          folder_name: data.folder_name
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
    api(url,
      {
        operation: "read",
        page_num: this.state.pageNum,
        page_size: this.state.pageSize.value
      }).then(response => {
        const { result, filter, message, status, num_pages } = response;
        // this.props.actions.addFlag({
        //   message: message,
        //   appearance: (status ? "normal" : "warning")
        // });
        if (status) {
          this.setState(
            {
              data: result,
              loaded: true,
              numPages: num_pages,
              sortByOptions: JSON.parse(JSON.stringify(filter.sort_by)),
              orderByOptions: JSON.parse(JSON.stringify(filter.order_by)),
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



  let renderBodyElement = null;
  if (this.state.loaded === true) {
    renderBodyElement = null;
    renderBodyElement = this.state.data.map((row, key) => {
      return (
              <GridColumn key = {key} medium={6} className="folder-grid">
              <Link to={"/testengine/adminpanel/question-folder/" + row.folder_name + "/"}>
                  <div className="folder-div">
                    <div className="folder-div-internal">
                      <div className="folder-icon-container">
                        <FolderIcon  className="folder-icon" />
                      </div>
                      <div className="folder-name">
                        {/* {changeCase.titleCase(row.folder_name)} */}
                        <div className="folder-name">
                          {row.folder_name}
                        </div>
                      </div>
                    </div>

                    <div className="folder-datetime">
                        <b>Created:</b> {row.created_at}
                        <br></br>
                        <b>Modified:</b> {row.modified_at}
                    </div>

                </div>
                </Link>
              </GridColumn>
      );
    });
  } else {
    renderBodyElement = loaderArray.map((row, key) => {
      return (
              <GridColumn key={key} medium={6} className="folder-grid">
                  <div className="folder-div">
                    <div className="folder-icon-container">
                      <FolderIcon  className="folder-icon" />
                    </div>
                    <div className="folder-name">
                      <MyTextLoader/>
                    </div>
                  </div>
              </GridColumn>
      );
    });
  }

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
          <GridColumn medium={9}></GridColumn>
          <GridColumn medium={3}>
          <Button onClick={this.handleAddModalOpen} appearance="primary">
            Create New Folder
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
                className="single-select"
                isClearable
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
              <GridColumn medium={6} className="folder-grid">
                <Link to='/testengine/adminpanel/question-folder/allfolders/allbanks/'>
                <div className="folder-div">
                    <div className="folder-div-internal-2">
                      <div className="folder-icon-container-2">
                        <FolderIcon  className="folder-icon" />
                      </div>
                      <div className="folder-name">
                        <div className="folder-name">
                          All Questions
                        </div>
                      </div>
                    </div>
                </div>
                </Link>
              </GridColumn>
              <GridColumn medium={6} className="folder-grid">
                <Link to='/testengine/adminpanel/question-folder/allfolders/'>
                <div className="folder-div">
                    <div className="folder-div-internal-2">
                      <div className="folder-icon-container-2">
                        <FolderIcon  className="folder-icon" />
                      </div>
                      <div className="folder-name">
                        <div className="folder-name">
                          All Question Banks
                        </div>
                      </div>
                    </div>
                </div>
                </Link>
              </GridColumn>

            </Grid>
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
            <Grid>
                {renderBodyElement}
            </Grid>
            
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
            <Modal  autoFocus={false} actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleModalClose },
              ]
            } onClose={this.handleModalClose} heading={(this.state.isNew ? "Create" : "Edit") + " Question Folder"}>

              <Form onSubmit={this.submitData}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                      <GridColumn medium={12}>
                        <Field name="folder_name" defaultValue={this.state.modalData.folder_name}
                              label="Name" 
                              isRequired>
                          {({ fieldProps }) => <TextField 
                          // placeholder="eg. CAT Questions 18" 
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
)(QuestionBank);
