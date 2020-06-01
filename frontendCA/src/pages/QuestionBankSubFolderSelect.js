// React
import React, { Component } from 'react';
import { Link } from 'react-router';
// Styles
import "../css/dashboard.css"

// Backend Connection
import { api } from "../helpers/api.js";

// Redux 
import { connect } from "react-redux";
import { browserHistory } from 'react-router';
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
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import Checkbox from 'react-simple-checkbox';
//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import pathIcon from "../routing/BreadCrumbIcons"

// Components
import ContentWrapper from '../components/ContentWrapper';

// Other Packages
import ReactPaginate from 'react-paginate';
import styled from "styled-components";
import ContentLoader from "react-content-loader";
import DynamicTable from '@atlaskit/dynamic-table';

var changeCase = require("change-case");

// api url path
var url = "/question/crud_folders/";
var url_qf = "/question/crud_supfolders/";


const checkboxTheme = {
  backgroundColor: '#fff',
  borderColor: '#0847A6',
  uncheckedBorderColor: '#243859',
  tickColor: '#0847A6'
}


const deleteConfMessage = "Are you sure you want to delete the question folder. Please note that this will not delete any question or question bank just the question folder. Questions will be visible in 'All Questions' section and Question Banks will be visible in 'All Question Banks' section  of 'Question Bank' tab ";
const deleteConfHeader = "Confirm Question Folder Deletion"

const deleteQBConfMessage = "Are you sure you want to delete the question bank. Please note that this will not delete any question just the question bank. Questions will be visible in 'All Questions' section of 'Question Bank' tab";
const deleteQBConfHeader = "Confirm Question Bank Deletion"


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

const emptyQFModalData = {
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
      pageSize: {'value':50,'label':'50 Items/Page'},
      totalRecords:0,
      filteredRecords:0,
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
      isQFNew:true,
      modalData: emptyModalData,
      qfModalData:emptyQFModalData,
      folderValue: [],
      folderOptionsMove: [],
      isQFModalOpen:false,
      isConfModalOpen:false,
      selectedIds:[],
      allSelected:false,
      isMoveModalOpen:false,
      // moveFolderValue: ""

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
      sup_folder_id:this.state.folderId ? this.state.folderId : ""
    };
    let payload = Object.assign({}, payloadData, obj);
    // console.log(payload, "Payload");
    api(url, payload)
      .then(response => {
        const { result, status, num_pages,total_records } = response;

        var selected = false;
        var count = 0;
        result.map(qs => {
            this.state.selectedIds.indexOf(qs.id) >= 0   ? count++ : null
        });
        if (count === result.length){
            selected = true
        }else{
            selected = false
        }





        if (status) {
          this.setState({
            data: result,
            loaded: true,
            numPages: num_pages,
            filteredRecords:total_records,
            allSelected:selected
          });

        }
      })
      .catch(error => {
        console.log("Handle Filter Failed");
      });
  };

  // Filters Handling

  handleConfModalOpen = event => {
    const dataId = this.state.folderId;
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
    const dataId = this.state.folderId;
    api(url_qf, {
      operation: "delete",
      data_id:dataId
    }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" :  "warning")
      });    
      if (status){
        browserHistory.push('/testengine/adminpanel/question-folder/')
        this.handleConfModalClose();  
      }else{
        this.setState({
          loaded:true
        })
      }
    });
  }


  handleEmptySelection = () => {
    this.setState({
      selectedIds:[],
      allSelected:false
    })
  }

  handleSelectAll = () => {
    var idList = []

    const selected = this.state.allSelected
    if (selected) {
      var idList = this.state.selectedIds
      this.state.data.map(qs => {
        ((this.state.selectedIds).indexOf(qs.id) >= 0)  ? idList.splice((this.state.selectedIds).indexOf(qs.id), 1 ) : null
      });

        this.setState({
          selectedIds: [...idList],
          allSelected:false
        })
  
  
    } else {

      this.state.data.map((row) => {
        return ((this.state.selectedIds).indexOf(row.id) >= 0)  ? null : idList.push(row.id)
      })
    
      this.setState({
        selectedIds:[...this.state.selectedIds, ...idList],
        allSelected:true
      })
    }




  }

  handleCheckBoxToggle = (data) => {
    // console.log(data)
    const selected = (this.state.selectedIds.indexOf(data) >= 0)
    console.log(data,selected)
    var allSelect = false;
    var count = 0;
    if (selected) {
      console.log('remove')
      this.state.data.map(qs => {
        ([...this.state.selectedIds.filter(idx => idx !== data)].indexOf(qs.id) >= 0)  ? count++ : null
      });
      if (count === this.state.data.length){
        allSelect = true
      }else{
        allSelect = false
      }
      this.setState({
        selectedIds:[...this.state.selectedIds.filter(idx => idx !== data)],
        allSelected:allSelect
      })

    } else {
      console.log('add')
      this.state.data.map(qs => {
        ([...this.state.selectedIds, data].indexOf(qs.id) >= 0)  ? count++ : null
    });
    if (count === this.state.data.length){
      allSelect = true
    }else{
      allSelect = false
    }
    this.setState({
      selectedIds:[...this.state.selectedIds, data],
      allSelected:allSelect
    })



    }
  }



  handleMoveModalOpen = () => {
    this.setState({
      isMoveModalOpen: true
    });
  }

  handleMoveModalClose = () => {
    this.setState({
      isMoveModalOpen: false
    });
  }




  handleEditModalOpen = event => {
    const dataId = this.state.folderId
    this.setState({ isQFNew: false, activeDataId: dataId });
    api(url_qf, {
      operation: "read",
      data_id: dataId,
    }).then(response => {
      const { result, status } = response;
      if (status) {
        this.setState(
          {
            qfModalData: result[0],
          }, () => {
            this.setState({ isQFModalOpen: true });
          });
      }
    });
  }

  handleQBEditModalOpen = event => {
    const dataId = event.currentTarget.dataset.id;
    this.setState({ isNew: false, activeDataId: dataId });
    api(url, {
      operation: "read",
      data_id: dataId,
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
    });
  }


  handleQBConfModalOpen = event => {
    const dataId = event.currentTarget.dataset.id;
    console.log(dataId)
    this.setState({
      isQBConfModalOpen: true,
      activeDataId:dataId
    })
  }

  handleQBConfModalClose = event => {
    this.setState({
      isQBConfModalOpen: false,
      activeDataId:''
    })
  }


  handleQBDelete = () => {
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
        this.handleQBConfModalClose();  
      }else{
        this.setState({
          loaded:true
        })
      }
    });
  }


  handleQFModalClose = () => {
    this.setState({
      isQFModalOpen: false,
      isQFNew: true,
      activeDataId: "",
      qfModalData: Object.assign({}, emptyQFModalData)
    });
  }


  // handleMoveFolderSelectChange = value => {
  //   this.setState({ moveFolderValue: value ? value : "" });
  // };


  handleMoveQuestionBank = data => {
    api(url, { operation: "move", folder_id: data.folder_id.value, bank_ids: this.state.selectedIds.join(",") }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });

      if(status){
        this.setState({
          moveFolderValue: '',
          isMoveModalOpen: false,
          selectedIds:[],
          allSelected:false,
        })
        // this.props.actions.emptyMoveSelectedQuestion({});
        this.applyFilter({ page_num: this.state.pageNum });
  
      }

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
    // console.log(event.target.value)
    const data = event.target.value
    this.setState({ searchValue: data, pageNum: 1 }, () => {
      this.applyFilter({ search: data, page_num: 1 });
    });
  }


  submitQFData = data => {
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === this.state.activeDataId);
    var submit = true;
    // console.log(index)
    if (submit) {
      this.setState({ loaded: false });
      if (this.state.isQFNew) {
        api(url_qf, {
          operation: "create",
          folder_name: data.folder_name,
          desc: data.description
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
        api(url_qf, {
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
            if (result.length > 0 ){

              if (this.state.folderValue.label != data.folder_name){
                var PathOld = decodeURIComponent(window.location.pathname)
                var PathNew = PathOld.replace(this.state.folderValue.label,result[0].folder_name)
                console.log(PathOld,PathNew)
                browserHistory.push(PathNew)
              }              
            }
            this.setState({
              loaded:true
            })
            this.handleQFModalClose();  
          }else{
            this.setState({
              loaded:true
            })
          }
        });
      }
    }
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
          folder_name: data.folder_name,
          desc: data.description,
          sup_folder_id:this.state.folderId ? this.state.folderId : ''
        }).then(response => {
          const { result, message, status } = response;
          this.props.actions.addFlag({
            message: message,
            appearance: (status ? "normal" :  "warning")
          });    
          if (status){

            var selected = false;
            var count = 0;
            [result[0], ...this.state.data].map(qs => {
                this.state.selectedIds.indexOf(qs.id) >= 0   ? count++ : null
            });
            if (count === result.length){
                selected = true
            }else{
                selected = false
            }

            this.setState({
              data: [result[0], ...this.state.data],
              loaded: true,
              filteredRecords: this.state.filteredRecords + 1,
              totalRecords: this.state.totalRecords + 1,
              allSelected:selected
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
          folder_name: data.folder_name,
          desc: data.description
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
    var Path = window.location.pathname.split("/")
    var textPath = null;
    textPath = decodeURIComponent(Path[4])
    console.log(textPath)
    api(url,
      {
        operation: "read",
        page_num: this.state.pageNum,
        page_size: this.state.pageSize.value,
        sup_folder:textPath
      }).then(response => {
        const { result, filter, message, status, num_pages,total_records } = response;
        if (status) {

          const index = (filter.sup_folders).findIndex(x => x.label === textPath);
          const indexnone = (filter.sup_folders).findIndex(x => x.value === "none");
          var folderId = null;
          var folderOptionsMove = []
          var folderOptionsSelect = []
          var folderValue = '';
          if (textPath === "allfolders") {
            folderId = ''
            folderOptionsSelect = filter.sup_folders
            folderOptionsMove = [...(filter.sup_folders).slice(0, indexnone),
            ...(filter.sup_folders).slice(indexnone + 1)]
            folderValue = []
          } else {
            folderId = (filter.sup_folders)[index]['value']
            folderValue = (filter.sup_folders)[index]
            folderOptionsSelect = [...(filter.sup_folders).slice(0, index),
            ...(filter.sup_folders).slice(index + 1)]
            folderOptionsMove = [...(folderOptionsSelect).slice(0, indexnone),
            ...(folderOptionsSelect).slice(indexnone + 1)]
  
          }
  
  



          this.setState(
            {
              data: result,
              loaded: true,
              numPages: num_pages,
              sortByOptions: JSON.parse(JSON.stringify(filter.sort_by)),
              orderByOptions: JSON.parse(JSON.stringify(filter.order_by)),
              folderValue:folderValue,
              folderOptionsMove:folderOptionsMove,
              folderId:folderId,
              totalRecords:total_records,
              filteredRecords:total_records
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
              <Link to={row.path}>
                  <div className="folder-div">
                    <div className="folder-div-internal">
                      <div className="folder-icon-container">
                        <FolderIcon  className="folder-icon" />
                      </div>
                      <div className="folder-name">
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
  var textPath = null;
  breadCrumbElement = Path.map((row, index) => {
    if (index > 2 && index < (Path.length - 1)){
      if (['question-folder'].indexOf(Path[index - 1]) >= 0) {
        textPath = decodeURIComponent(Path[index])
      } else {
        textPath = changeCase.titleCase(Path[index])
      }
      var link =  (Path.slice(0,index + 1).join("/")) + "/"
      // console.log(index,textPath, link)
      try {
        if (['question-folder'].indexOf(Path[index - 1]) >= 0) {
          return (<BreadcrumbsItem key={index} iconBefore={pathIcon['folder']} href={link} text={textPath} />);
        } else {
          return (<BreadcrumbsItem key={index} iconBefore={pathIcon[Path[index]]} href={link} text={textPath} />);
        }
      }
      catch (err) {
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


    const head = {
      cells: [
        {
          key: "select",
          content: "Select",
          width: 5,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "folder_name",
          content: "Question Bank",
          width: 40,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "created",
          content: "Created",
          width: 22.5,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "modified",
          content: "Modified",
          width: 22.5,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "operations",
          content: "Operations",
          width: 10,
          isSortable: false,
          shouldTruncate: false
        },
      ]
    }

    const headall = {
      cells: [
        {
          key: "select",
          content: "Select",
          width: 5,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "folder_name",
          content: "Question Bank",
          width: 27.5,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "folder_name",
          content: "Question Folder",
          width: 27.5,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "created",
          content: "Created",
          width: 15,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "modified",
          content: "Modified",
          width: 15,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "operations",
          content: "Operations",
          width: 10,
          isSortable: false,
          shouldTruncate: false
        },
      ]
    }




    let rowRenderElement = null;
    rowRenderElement = this.state.data.map((row, index) => ({
      key: `row.id`,
      cells: [

        {
          key: row.id,
          content: <div className="test-checkbox-container">
            <Checkbox
              color={checkboxTheme}
              size={3}
              tickSize={3}
              data-id={row.id}
              borderThickness={2}
              value={row.id}
              className="checkbox-style-dashboard"
              onChange={event => this.handleCheckBoxToggle(row.id)}
              checked={this.state.selectedIds.indexOf(row.id) >= 0 ? true : false}
            />
          </div>
        },
        {
          key: row.id,
          content: <Link to={row.path}>{row.folder_name}</Link>
        },
        {
          key: row.id,
          content: row.created_at
        },
        {
          key: row.id,
          content: row.modified_at
        },
        {
          key: row.id,
          content: 

          <DropdownMenu
            trigger="Options"
            triggerType="button"
            shouldFlip={true}
            role="bottom"
          >
            <DropdownItemGroup>
              <Link to={row.path}><DropdownItem>Open</DropdownItem></Link>
              <DropdownItem data-id={row.id} onClick={this.handleQBEditModalOpen.bind(this)}>Edit</DropdownItem>
              <DropdownItem data-id={row.id} onClick={this.handleQBConfModalOpen.bind(this)}>Delete</DropdownItem>
            </DropdownItemGroup>
          </DropdownMenu>

        },

      ]
    }
    ));

    let rowRenderElementAll = null;
    rowRenderElementAll = this.state.data.map((row, index) => ({
      key: `row.id`,
      cells: [

        {
          key: row.id,
          content: <div className="test-checkbox-container">
            <Checkbox
              color={checkboxTheme}
              size={3}
              tickSize={3}
              data-id={row.id}
              borderThickness={2}
              value={row.id}
              className="checkbox-style-dashboard"
              onChange={event => this.handleCheckBoxToggle(row.id)}
              checked={this.state.selectedIds.indexOf(row.id) >= 0 ? true : false}
            />
          </div>
        },
        {
          key: row.id,
          content: <Link to={row.path}>{row.folder_name}</Link>
        },
        {
          key: row.id,
          content: <a href={'/testengine/adminpanel/question-folder/' + row.super_folder.sup_folder_name + '/'}>{row.super_folder.sup_folder_name}</a>
        },
        {
          key: row.id,
          content: row.created_at
        },
        {
          key: row.id,
          content: row.modified_at
        },
        {
          key: row.id,
          content: 

          <DropdownMenu
            trigger="Options"
            triggerType="button"
            shouldFlip={true}
            role="bottom"
          >
            <DropdownItemGroup>
              <Link to={row.path}><DropdownItem>Open</DropdownItem></Link>
              <DropdownItem data-id={row.id} onClick={this.handleQBEditModalOpen.bind(this)}>Edit</DropdownItem>
              <DropdownItem data-id={row.id} onClick={this.handleQBConfModalOpen.bind(this)}>Delete</DropdownItem>
            </DropdownItemGroup>
          </DropdownMenu>

        },

      ]
    }
    ));





    return (
      <ContentWrapper>
      <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
      
      <Grid spacing="compact">
        <GridColumn medium={7}></GridColumn>
        {  this.state.folderId != "" && (
        <GridColumn medium={3}>
          <Button onClick={this.handleAddModalOpen} appearance="primary">
            Create Question Bank
          </Button>

        </GridColumn>
          )}
          { this.state.folderId == "" && (
            <GridColumn medium={3}></GridColumn>
          )}
          <GridColumn medium={2}>
            <div className="more-options-folder">
              <DropdownMenu
                isCompact
                shouldFlip={true}
                trigger="More Options"
                triggerType="button"
                role="bottom"
                appearance="tall"
              >
                <DropdownItemGroup>
                    <DropdownItem 
                    isDisabled = {this.state.selectedIds.length === 0}
                    onClick={this.handleMoveModalOpen}
                    >Move Bank</DropdownItem>
                    {  this.state.folderId != "" && (
                    <DropdownItem 
                      onClick={this.handleEditModalOpen}
                    >Edit Folder</DropdownItem>  
                    )}
                    {  this.state.folderId != "" && (
                    <DropdownItem 
                      onClick={this.handleConfModalOpen}
                    >Delete Folder</DropdownItem>
                    )}
                </DropdownItemGroup>
              </DropdownMenu>
            </div>
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

            <div className="question-bank-summary">
              <div className="selectall-checkbox">
                <div className="selectall-checkbox-container">
                  <Checkbox
                    color={checkboxTheme}
                    size={3}
                    tickSize={3}
                    borderThickness={2}
                    className="checkbox-style-dashboard"
                    onChange={this.handleSelectAll}
                    checked={this.state.allSelected}
                  />
                </div>
                <div className="check-box-text">Select All&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10564;</div>
              </div>
              <div className="question-bank-summary-text">
                {this.state.selectedIds.length > 0 ? 'Selected : ' : ' Total Questions : '}
                <span className="number-selected">
                  {this.state.selectedIds.length > 0 ? this.state.selectedIds.length + ' of ' + this.state.totalRecords : ((this.state.totalRecords === this.state.filteredRecords) ? this.state.totalRecords : this.state.filteredRecords + '/' + this.state.totalRecords)}
                </span>
              </div>
              {this.state.selectedIds.length > 0 && (
                <div className="remove-selection" >
                  <CrossCircleIcon onClick={this.handleEmptySelection}></CrossCircleIcon>
                </div>
              )}
            </div>

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
              <div className='folder-table'>
              <DynamicTable
                isLoading={!this.state.loaded}
                head={this.state.folderId ? head : headall }
                rows={this.state.folderId ? rowRenderElement : rowRenderElementAll}
                defaultPage={1}
                className="test-table"
              />
              </div>

                {/* {renderBodyElement} */}
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
            } onClose={this.handleModalClose} heading={(this.state.isNew ? "Create" : "Edit") + " Question Bank"}>

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
                      <GridColumn medium={12}>
                        <Field name="description" 
                            defaultValue={this.state.modalData.description} 
                            label="Description" 
                            // isRequired
                            >
                          {({ fieldProps }) => <TextField  
                          // placeholder="eg. Questions database for CAT" 
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
          {this.state.isQFModalOpen && (
            <Modal  autoFocus={false} actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleQFModalClose },
              ]
            } onClose={this.handleQFModalClose} heading={(this.state.isQFNew ? "Create" : "Edit") + " Question Folder"}>

              <Form onSubmit={this.submitQFData}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                      <GridColumn medium={12}>
                        <Field name="folder_name" defaultValue={this.state.qfModalData.folder_name}
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

        <ModalTransition>
            {this.state.isConfModalOpen && (
              <Modal  autoFocus={false}  actions={
                [
                  { text: 'Confirmed', appearance: 'primary', onClick: this.handleDelete },
                  { text: 'Close', appearance: 'normal', onClick: this.handleConfModalClose },
                ]
              } onClose={this.handleConfModalClose} heading={deleteConfHeader}>
                  {deleteConfMessage}              
              </Modal>
  
            )}
        </ModalTransition>

        <ModalTransition>
            {this.state.isQBConfModalOpen && (
              <Modal  autoFocus={false}  actions={
                [
                  { text: 'Confirmed', appearance: 'primary', onClick: this.handleQBDelete },
                  { text: 'Close', appearance: 'normal', onClick: this.handleQBConfModalClose },
                ]
              } onClose={this.handleQBConfModalClose} heading={deleteQBConfHeader}>
                  {deleteQBConfMessage}              
              </Modal>
  
            )}
        </ModalTransition>



        {this.state.isMoveModalOpen && (
          <ModalTransition>
            <Modal height={330} autoFocus={false} autoFocus={false} actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleMoveModalClose }
              ]
            } onClose={this.handleMoveModalClose} heading="Move Questions">

              <Form onSubmit={this.handleMoveQuestionBank}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                      <GridColumn medium={12}>
                        Move  {this.state.selectedIds.length}  of  {this.state.totalRecords}  banks to:
                      </GridColumn>

                      <GridColumn medium={12}>
                        <Field name="folder_id" label="Question Folder" isRequired>
                          {({ fieldProps }) => <Select
                            options={this.state.folderOptionsMove}
                            placeholder="Question Folder..."
                            {...fieldProps}
                          />}
                        </Field>
                      </GridColumn>
                    </Grid>
                    <Grid>
                      <GridColumn medium={12}>
                        <br></br>
                        <br></br>
                        <Button type="submit" appearance="primary">
                          Move
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

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...flag }, dispatch)
  };
}

export default connect(
  null,
  mapDispatchToProps
)(QuestionBank);
