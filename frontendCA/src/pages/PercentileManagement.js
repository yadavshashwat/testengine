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

const itemOptions = [
  {'value':10,'label':'10 Items/Page'},
  {'value':20,'label':'20 Items/Page'},
  {'value':30,'label':'30 Items/Page'},
  {'value':50,'label':'50 Items/Page'},
  {'value':100,'label':'100 Items/Page'}
]

const marksGap = [{'value':'1','label':'1'},
                {'value':'2','label':'2'},
            {'value':'4','label':'4'},
            {'value':'5','label':'5'},
            {'value':'10','label':'10'},
            {'value':'25','label':'25'}
]
const tableList1 = [-1]

// api url path
var url = "/test/crud_table/";

const emptyModalData = {
  "table_name": '',
  "table": {},
  "marks_gap": "",
};

const deleteConfMessage = "Are you sure you want to delete the table? "
const deleteConfHeader = "Confirm Table Deletion"

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
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      // Modal variables
      isModalOpen: false,
      submitError: "",
      isNew: true,
      // modalData: emptyModalData,
      activeDataId: "",
      isConfModalOpen:false,

      marksGap: '',
      tableName:'',
      numOptions:2,
      tableData:[
        { 'marks': '-1', 'percentile': '0' },
        { 'marks': '0', 'percentile': '20' },
    ]
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
  handleNumItemsChange = value => {
    this.setState({ pageSize: value ? value: "" , pageNum: 1 }, () => {
      this.applyFilter({ page_size: value ? value.value: "" , page_num: 1 });
    });
  }

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

  handleTableChange = event => {
    const value = event.currentTarget.value;
    const type = event.currentTarget.dataset.type;
    const index = parseInt(event.currentTarget.dataset.id);
    var tableData = this.state.tableData;
    if (value >= 0  && value <= 100){
      tableData[index][type] = value
      this.setState({
        tableData:tableData
      })  
    }      
    
    // for (var i = (index + 1); i <= tableData.length; i++){
    //   console.log(i)
        // if(tableData[i][type] < value){
        //   tableData[i][type] = value
        //   this.setState({
        //     tableData : tableData
        //   });
        // }
    // }
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

  
  handleMarksGapChange = value => {
    this.setState({ marksGap: value ? value : "" }, () => {
      var list = [-1]
      for (var i = 0 ; i <=100 ; i + (value ? value.value : 101)){
        list.push(i)
      }
      this.setState({
        tableList:list
      })
    });
  };

  handleTableNameChange = event => {
    const data = event.target.value
    this.setState({ tableName: data });
  };


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
            tableName: result[0].table_name,
            marksGap: result[0].marks_gap,
            tableData: result[0].table,
            numOptions:result[0].table.length
          }, () => {
            this.setState({ isModalOpen: true });
          });
      }
      // console.log(result[0])
    });
  }

  handleCopy = event => {
    const data_id = event.currentTarget.dataset.id
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === data_id);
    // this.setState({ isNew: false, activeDataId: user_id });
    
    api(url, {
          operation: "create",
          table_name: dataList[index].table_name + ' copy',
          table_dict: JSON.stringify(dataList[index].table)
        }).then(response => {
      var { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" :  "warning")
      });    
      console.log(result)
      if (status){
        this.setState({
          data: [...this.state.data,result[0]],
          loaded: true
        });
      }
    
    });
}


  handleAddOption = () => {
    var Options = this.state.tableData;
    this.setState({
     tableData: [...Options,
            { 'marks': '', 'percentile': '' }
            ],
        
      numOptions: (this.state.numOptions + 1),
    })
  }

  handleRemoveOption = () => {
    var Options = this.state.tableData;
    if (this.state.numOptions > 2){
      Options.pop();
      this.setState({
         tableData: Options,
          numOptions: (this.state.numOptions - 1),
      })
    }
  }



handleLinearTable = () => {
  var tableData = this.state.tableData;
  var numOptions = this.state.numOptions;
  const min_value = 0;
  const max_value = 100;
  
  const diff = ((max_value - min_value)/(numOptions - 1));
  const diff_2 = ((100 - 0)/(numOptions - 2));
  for(var i = 0; i < tableData.length; i ++){
    tableData[i]['percentile'] = (min_value + (i * diff )).toFixed(4);
    if (i >= 2){
      tableData[i]['marks'] = (min_value + ((i-1) * diff_2 )).toFixed(2);
    }
  }
  this.setState({tableData:tableData});
}

handleExponentialTable = () => {
  var tableData = this.state.tableData;
  var numOptions = this.state.numOptions;
  const exp = 2.718281828;
  const min_value = 0;
  const exp_max = (exp ** (1-numOptions)) - 1;
  const diff_2 = ((100 - 0)/(numOptions - 2));
  for(var i = 0; i < tableData.length; i ++){
    tableData[i]['percentile'] = ((((exp ** (-i)) - 1)/exp_max) * 100).toFixed(4);;
    if (i >= 2){
      tableData[i]['marks'] = (min_value + ((i-1) * diff_2 )).toFixed(2);
    }

  }
  this.setState({tableData:tableData});
}


handleAddModalOpen = () => {
    this.setState({
      isModalOpen: true,
      isNew: true,
      activeDataId: "",
      tableName:'',
      tableData: [
        { 'marks': '-1', 'percentile': '0' },
        { 'marks': '0', 'percentile': '20' },
    ],
    numOptions:2
      // modalData: Object.assign({}, emptyModalData)
    });
  }

  handleModalClose = () => {
    this.setState({
      isModalOpen: false,
      isNew: true,
      activeDataId: "",
      tableName:'',
      tableData: [
        { 'marks': '-1', 'percentile': '0' },
        { 'marks': '0', 'percentile': '20' },
        
    ],
    numOptions:2
    });
  }
  

  checkOptions = () => {
    const tableData = this.state.tableData;
    var error = false
    for (var i = 0; i < (tableData.length - 1); i ++ ){
      // console.log(tableData[i]['percentile'] > tableData[i + 1]['percentile'],tableData[i]['percentile'],tableData[i+1]['percentile'])
      console.log(parseFloat(tableData[i]['marks']) > parseFloat(tableData[i + 1]['marks']),tableData[i]['marks'],tableData[i+1]['marks'])
      if (parseFloat(tableData[i]['percentile']) > parseFloat(tableData[i + 1]['percentile'])){
        error = true
      }
      if (parseFloat(tableData[i]['marks']) > parseFloat(tableData[i + 1]['marks'])){
        error = true
      }
    }
    console.log(error)
    return error
  }
  submitData = () => {
    var submit = !this.checkOptions()
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === this.state.activeDataId);
    // console.log(data)
    // console.log(index)
    if (submit) {
      this.setState({ loaded: false });
      if (this.state.isNew) {
        api(url, {
          operation: "create",
          table_name: this.state.tableName,
          table_dict: JSON.stringify(this.state.tableData),
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
          table_name: this.state.tableName,
          table_dict: JSON.stringify(this.state.tableData),
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
            orderByOptions: JSON.parse(JSON.stringify(filter.order_by))
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
          width: 80,
          isSortable: true,
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
          content: changeCase.titleCase(row.table_name)
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
              <DropdownItem data-id={row.id} onClick={this.handleEditModalOpen.bind(this)}>View/Edit</DropdownItem>
              <DropdownItem data-id={row.id} onClick={this.handleCopy.bind(this)}>Copy</DropdownItem>
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

    
    

    let renderOptions = null;
    renderOptions = [...Array(this.state.numOptions-2)].map((row, key) => {
        return (
          <Grid key={key}>
          <GridColumn medium={6}>
          <TextField
            // placeholder="10"
            name="tableMarks"
            data-type={"marks"}
            data-id={key+2}
            type="number"
            onChange={this.handleTableChange}
            value={this.state.tableData[key + 2]['marks']}
            />                      
          </GridColumn>
          <GridColumn medium={6}>
            <TextField
            // placeholder="10"
            name="tableMarks"
            type="number"
            data-type={"percentile"}
            data-id={key+2}
            onChange={this.handleTableChange}
            value={this.state.tableData[key + 2]['percentile']}
            />                      
          </GridColumn>
          </Grid>
      
        )
    });

    return (
      <ContentWrapper>
      <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        <Grid spacing="compact">
          <GridColumn medium={10}></GridColumn>
          <GridColumn medium={2}>
          <Button onClick={this.handleAddModalOpen} appearance="primary">
            Add New Table
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
            } onClose={this.handleModalClose} width={'60%'} heading={(this.state.isNew ? "Add" : "Edit") + " Percentile Tables"}>

                    <Grid>
                        <GridColumn medium={12}>
                        <div className="field-div">
                          <span className="field-label">Table Name</span>
                          <TextField
                          // placeholder="CAT Easy.."
                          name="tableName"
                          onChange={this.handleTableNameChange}
                          value={this.state.tableName}
                          />
                        </div>
                        </GridColumn>
                        <GridColumn medium={6}>
                        <div className="button-div">
                          <Button  onClick={this.handleLinearTable} appearance="normal">
                            Linear
                          </Button>
                          </div>
                        </GridColumn>
                        <GridColumn medium={6}>
                        <div className="button-div">
                          <Button  onClick={this.handleExponentialTable} appearance="normal">
                            Exponential
                          </Button>
                          </div>
                        </GridColumn>

                      <GridColumn medium={12}>
                      <Grid>
                        <GridColumn medium={6}>
                          <div className="header-table">
                          % Marks
                          </div>
                        </GridColumn>
                        <GridColumn medium={6}>
                        <div className="header-table">
                        Percentile
                          </div>
                          
                        </GridColumn>
                        </Grid>
                        <hr></hr>
                        <Grid>
                      <GridColumn medium={6}>
                        <div className="value-table">
                        Less than 0%
                        </div>
                      </GridColumn>
                      <GridColumn medium={6}>
                        <TextField
                        // placeholder="10"
                        name="tableMarks"
                        data-type={"percentile"}
                        type="number"
                        data-id={0}
                        value={this.state.tableData[0]['percentile']}
                        onChange={this.handleTableChange}
                        />                      
                      </GridColumn>
                      </Grid>
                      <Grid>
                      <GridColumn medium={6}>
                      <div className="value-table">
                        0%
                        </div>
                      </GridColumn>
                      <GridColumn medium={6}>
                        <TextField
                        placeholder="10"
                        name="tableMarks"
                        data-type={"percentile"}
                        type="number"
                        data-id={1}
                        value={this.state.tableData[1]['percentile']}
                        onChange={this.handleTableChange}
                        />                      
                      </GridColumn>
                      </Grid>
                      {renderOptions}
                      <Grid>
                      <GridColumn medium={12}>
                         <div className="option-table-add-remove">
                            <div className="add-table-button">
                            <Button onClick={this.handleAddOption} isSelected>
                                Add Option
                            </Button>
                            </div>
                            <div className="add-table-button">
                            <Button onClick={this.handleRemoveOption} apperance="normal">
                                Remove Option
                            </Button>
                            </div>
                        </div>
                      </GridColumn>
                      </Grid>
                      </GridColumn>
                    </Grid>

                    <Grid>
                      <GridColumn medium={12}>
                        <br></br>
                        <span className="invalid">{this.state.submitError}</span>
                        <br></br>
                        <Button type="submit" onClick={this.submitData} appearance="primary">
                          Submit
                      </Button>
                      </GridColumn>
                    </Grid>
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
