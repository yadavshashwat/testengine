// React
import React, { Component } from 'react';
import { Link } from 'react-router';
// Styles
import "../css/dashboard.css"

// Backend Connection
import { api } from "../helpers/api.js";
import { browserHistory } from 'react-router';
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../redux/actions/flag";
import test from "../redux/actions/test";

// Atlaskit Packages
import Select from "@atlaskit/select";
import Button from '@atlaskit/button';
import SearchIcon from "@atlaskit/icon/glyph/search";
import { CheckboxSelect } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import Checkbox from 'react-simple-checkbox';
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import Lozenge from "@atlaskit/lozenge";
import { DatePicker} from '@atlaskit/datetime-picker';
import DynamicTable from '@atlaskit/dynamic-table';
import Tag from '@atlaskit/tag';
//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import pathIcon from "../routing/BreadCrumbIcons"
import Arrow from '@atlaskit/icon/glyph/arrow-right';
// Components
import ContentWrapper from '../components/ContentWrapper';
import AddEditTest from '../components/Test/AddEditTest'

// Other Packages
import ReactPaginate from 'react-paginate';
import styled from "styled-components";
import { Element, scroller } from 'react-scroll'
var changeCase = require("change-case");

// api url path
var url = "/test/crud_test/";
var url_tb = "/test/crud_testfolders/";

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

const deleteConfMessage = "Are you sure you want to delete the test?"
const deleteConfHeader = "Confirm Test Deletion"

const deleteTBConfMessage = "Are you sure you want to delete the test bank. Please note that this will not delete any tests just the test bank. Tests will be visible in 'All Tests' section of 'Test Bank' tab";
const deleteTBConfHeader = "Confirm Test Bank Deletion"


function getDate(date) {
  var tomorrowDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  var todayDate = new Date(new Date().getTime());
  var weekDate = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
  var dayStart = "";
  var monthStart = "";
  var yearStart = "";
  var dayEnd = "";
  var monthEnd = "";
  var yearEnd = "";
  var dateStart = "";
  var dateEnd = "";
  if (date === "today") {
    dayStart = todayDate.getDate();
    monthStart = todayDate.getMonth() + 1;
    yearStart = todayDate.getFullYear();
    if (dayStart < 10) {
      dayStart = '0' + dayStart;
    }
    if (monthStart < 10) {
      monthStart = '0' + monthStart;
    }
    dayEnd = dayStart;
    monthEnd = monthStart;
    yearEnd = yearStart;
    dateStart = yearStart + "-" + monthStart + "-" + dayStart
    dateEnd = yearEnd + "-" + monthEnd + "-" + dayEnd

  } else if (date === "tomorrow") {
    dayStart = tomorrowDate.getDate();
    monthStart = tomorrowDate.getMonth() + 1;
    yearStart = tomorrowDate.getFullYear();
    if (dayStart < 10) {
      dayStart = '0' + dayStart;
    }
    if (monthStart < 10) {
      monthStart = '0' + monthStart;
    }

    dayEnd = dayStart;
    monthEnd = monthStart;
    yearEnd = yearStart;
    dateStart = yearStart + "-" + monthStart + "-" + dayStart
    dateEnd = yearEnd + "-" + monthEnd + "-" + dayEnd

  } else if (date === "week") {
    dayStart = todayDate.getDate();
    monthStart = todayDate.getMonth() + 1;
    yearStart = todayDate.getFullYear();
    if (dayStart < 10) {
      dayStart = '0' + dayStart;
    }
    if (monthStart < 10) {
      monthStart = '0' + monthStart;
    }

    dayEnd = weekDate.getDate();
    monthEnd = weekDate.getMonth() + 1;
    yearEnd = weekDate.getFullYear();
    if (dayEnd < 10) {
      dayEnd = '0' + dayEnd;
    }
    if (monthEnd < 10) {
      monthEnd = '0' + monthEnd;
    }

    dateStart = yearStart + "-" + monthStart + "-" + dayStart
    dateEnd = yearEnd + "-" + monthEnd + "-" + dayEnd
  } else {
    dateStart = ""
    dateEnd = ""
  }
  return { start: dateStart, end: dateEnd }
};

const checkboxTheme = {
  backgroundColor: '#fff',
  borderColor: '#0847A6',
  uncheckedBorderColor: '#243859',
  tickColor: '#0847A6'
}

const scheduledOptions = [
  { value: '', label: 'None' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This Week' },
  { value: 'for', label: 'For' },
  { value: 'between', label: 'Between' },
]

class TestManagement extends Component {
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

      sortValue: "",
      orderBy: "asc",

      blankNegativeTypeOptions: [],
      isPausableOptions: [],
      isBlankNegativeOptions: [],
      isQuestionJumpOptions: [],
      timeCalculationOptions: [],
      isSectionalSequenceChooseOptions: [],
      interfaceTypeOptions: [],
      timerTypeTypeOptions: [],
      isSectionalJumpOptions: [],
      numMcqOptions: [],
      searchIcon: true,

      folderOptionsSelect: [],
      courseOptions: [],
      categoryOptions: [],
      topicOptions: [],
      isLiveOptions: [],
      scheduledOptions: scheduledOptions,

      folderValue: [],
      courseValue: [],
      categoryValue: [],
      topicValue: [],
      isLiveValue: "",
      scheduledValue: { value: '', label: 'None' },
      scheduledStartValue: '',
      scheduledEndValue: '',


      searchValue: "",
      folderId: null,
      isMoveModalOpen: false,

      folderOptionsMove: [],
      moveFolderValue: "",
      activeDataId:'',
      isConfModalOpen:false,

      isModalOpen: false,
      isNew: false,
      modalData: emptyModalData,
      isTBConfModalOpen:false,
      isLiveModalOpen:false,
      warnings: [],
      critical_errors:[]





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

      is_live: this.state.isLiveValue ? this.state.isLiveValue.value : "",
      sub_category: (this.state.topicValue).map(x => x['value']).join(","),
      course_id: (this.state.courseValue).map(x => x['value']).join(","),
      folder_id: (this.state.folderId ? this.state.folderId : (this.state.folderValue).map(x => x['value']).join(",")),
      scheduled_for_start: (this.state.scheduledStartValue),
      scheduled_for_end: (this.state.scheduledEndValue)
    };
    let payload = Object.assign({}, payloadData, obj);
    // console.log(payload, "Payload");
    api(url, payload)
      .then(response => {
        const { result, status, num_pages, total_records } = response;
        if (status) {
          this.props.actions.setTestList({
            testlist: result,
            totalTests: total_records,
            setTotal: false,
          });
          this.setState({
            // data: result,
            loaded: true,
            numPages: num_pages
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
    this.setState({ sortValue: value ? value : "", pageNum: 1 }, () => {
      this.applyFilter({ sort_by: value ? value.value : "", page_num: 1 });
    });
  };

  handleTopicChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ topicValue: value, pageNum: 1 }, () => {
      this.applyFilter({ topic_id: data, page_num: 1 });
    });
  };

  handleCourseChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ courseValue: value, pageNum: 1 }, () => {
      this.applyFilter({ course_id: data, page_num: 1 });
    });
  };


  handleFolderChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ folderValue: value, pageNum: 1 }, () => {
      this.applyFilter({ folder_id: data, page_num: 1 });
    });
  };


  
  handleIsLive = value => {
    this.setState({ isLiveValue: value ? value : "", pageNum: 1 }, () => {
      this.applyFilter({ is_live: value ? value.value : "", page_num: 1 });
    });
  };

  handleScheduledForChange = value => {
    this.setState({ scheduledValue: value ? value : {'value':'',label:'None'} }, () => {
      var scheduledStartValue = "";
      var scheduledEndValue = "";
      var dateObj = null;
      var dateObj2 = null;

      console.log(value.value)
      if (value.value) {
        console.log(value.value)
        if (["today", "tomorrow", "week"].indexOf(value.value) >= 0) {
          dateObj = getDate(value.value)
          console.log(dateObj)
          scheduledStartValue = dateObj.start;
          scheduledEndValue = dateObj.end;
          this.setState({
            scheduledStartValue: scheduledStartValue,
            scheduledEndValue: scheduledEndValue
          }, () => {
            this.applyFilter({ scheduled_for_start: scheduledStartValue, scheduled_for_end: scheduledEndValue, page_num: 1 });
          })

        } else if (value.value === "for") {
        dateObj = getDate('today')
        scheduledStartValue = dateObj.start;
        scheduledEndValue = dateObj.end;
        console.log(dateObj)
        this.setState({
          scheduledStartValue: scheduledStartValue,
          scheduledEndValue: scheduledEndValue
        }, () => {
          this.applyFilter({ scheduled_for_start: scheduledStartValue, scheduled_for_end: scheduledEndValue, page_num: 1 });
        })


      } else if (value.value === "between") {
        dateObj = getDate('today')
        dateObj2 = getDate('tomorrow')
        console.log(dateObj,dateObj2)
        scheduledStartValue = dateObj.start;
        scheduledEndValue = dateObj2.end;
        this.setState({
          scheduledStartValue: scheduledStartValue,
          scheduledEndValue: scheduledEndValue
        }, () => {
          this.applyFilter({ scheduled_for_start: scheduledStartValue, scheduled_for_end: scheduledEndValue, page_num: 1 });
        })
      } else {
        
        this.setState({
          scheduledStartValue: '',
          scheduledEndValue: ''
        }, () => {
          console.log(this.state.scheduledStartValue,this.state.scheduledEndValue)
          this.applyFilter({ scheduled_for_start: '', scheduled_for_end: '', page_num: 1 });
        })
      }
    }else{
      this.setState({
        scheduledStartValue: '',
        scheduledEndValue: ''
      }, () => {
      
        console.log(this.state.scheduledStartValue,this.state.scheduledEndValue)
        this.applyFilter({ scheduled_for_start: '', scheduled_for_end: '', page_num: 1 });
      })
    }

    });
  };


  handleDateChangeStart = value => {
  if (this.state.scheduledValue.value === "for"){
    // console.log(value,this.state.scheduledEndValue)
    this.setState({
      scheduledStartValue: value,
      scheduledEndValue: value
    }, () => {
      this.applyFilter({ scheduled_for_start: value ? value : "", scheduled_for_end: value ? value : '', page_num: 1 });  
    });

  }else if(this.state.scheduledValue.value === "between"){
    this.setState({
      scheduledStartValue: value
    }, () => {
      this.applyFilter({ scheduled_for_start: value ? value : "", page_num: 1 });  
  });
  }

  }
    
    
  handleDateChangeEnd = value => {
    if (this.state.scheduledValue.value === "for"){
      this.setState({
        scheduledStartValue: value,
        scheduledEndValue: value
      }, () => {
        this.applyFilter({ scheduled_for_start: value ? value : "", scheduled_for_end: value ? value : '', page_num: 1 });  
      });
  
    }else if(this.state.scheduledValue.value === "between"){
      this.setState({
        scheduledEndValue: value
      }, () => {
        this.applyFilter({ scheduled_for_end: value ? value : "", page_num: 1 });  
    });
    }
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

  handleSearchChange = event => {
    // console.log(event.target.value)
    const data = event.target.value
    this.setState({ searchValue: data, pageNum: 1 }, () => {
      this.applyFilter({ search: data, page_num: 1 });
    });
  }


  handleSelectAll = event => {
    const selected = this.props.allTestSelected
    if (selected) {
      this.props.actions.deselectAllTest({});
    } else {

      this.props.actions.selectAllTest({});
    }

  }

  handleAddTestTop = () => {
    const position = "top";
    this.props.actions.viewAddTest({
      position: position
    });
    scroller.scrollTo('add-test-top', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -50
    });

  }

  handleAddTestEnd = () => {
    const position = "end";
    this.props.actions.viewAddTest({
      position: position
    });
    scroller.scrollTo('add-test-end', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart'
    });
  }

  handleEmptySelection = () => {
    this.props.actions.emptySelectedTest({});
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

  handleMoveFolderSelectChange = value => {
    this.setState({ moveFolderValue: value ? value : "" });
  };

  handleTestsMove = data => {
    api(url, { operation: "move", folder_id: data.folder_id.value, test_ids: this.props.selectedTestId.join(",") }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.setState({
          moveFolderValue: '',
          isMoveModalOpen: false
        })
        this.props.actions.emptySelectedTest({});
        this.applyFilter({ page_num: this.state.pageNum });

      }

    });
  }

  handleConfModalOpen = event => {
    const dataId = event.currentTarget.dataset.id;
    console.log(dataId)
    this.setState({
      isConfModalOpen: true,
      activeDataId:dataId
    })
  }

  handleConfModalClose = () => {
    this.setState({
      isConfModalOpen: false,
      activeDataId:''
    })
  }

  handleTBConfModalOpen = event => {
    const dataId = this.state.folderId;
    this.setState({
      isTBConfModalOpen:true,
      activeDataId:dataId
    })
  }

  handleTBConfModalClose = () => {
    this.setState({
      isTBConfModalOpen:false,
      activeDataId:""
    })
  }


  handleTBDelete = () => {
    const dataId = this.state.folderId;
    // const dataList = this.state.data;
    // const index = dataList.findIndex(x => x.id === dataId);
    api(url_tb, {
      operation: "delete",
      data_id:dataId
    }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" :  "warning")
      });    
      if (status){
        // this.setState({            
        //   data: [
        //     ...this.state.data.slice(0, index),
        //     ...this.state.data.slice(index + 1)
        //   ],
        //   loaded: true,    
        // });
        browserHistory.push('/testengine/adminpanel/test-bank/')
        this.handleTBConfModalClose();  
      }else{
        this.setState({
          loaded:true
        })
      }
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


  handleEditModalOpen = event => {
    const dataId = this.state.folderId
    this.setState({ isNew: false, activeDataId: dataId });
    api(url_tb, {
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




  handleCheckBoxToggle = (data) => {
    // const dataId = this.state.data.id;

    const selected = (this.props.selectedTestId.indexOf(data) >= 0)
    if (selected) {
      this.props.actions.removeSelectedTest({ id: data });
    } else {
      this.props.actions.addSelectedTest({ id: data });
    }
  }



  handleDelete = () => {
    
    const dataId = this.state.activeDataId
    this.handleConfModalClose();
    api(url, {
      operation: "delete",
      data_id: dataId
    }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.removeTest({
          dataID: dataId
        });
        // To Handle Delete
      } else {
        this.setState({
          loaded: true
        })
      }
    });
  }


  makeLiveOfflineAll = () => {
    api(url, { operation: "live", test_ids: this.props.selectedTestId.join(","), is_live: '0', validate:'0' }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status){
        this.props.actions.emptySelectedTest({});
        this.applyFilter({ page_num: this.state.pageNum });
  
      }
    })
  }


  validateTest = event => {
    const dataId = event.currentTarget.dataset.id;
    api(url, { operation: "live", test_ids: dataId, is_live: '1', validate: '1'}).then(response => {
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

    api(url, { operation: "live", test_ids: dataId, is_live: '1',validate: '0' }).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editTest({ result: result[0] })
        this.handleLiveModalClose()
      }   
    })
  }



  makeOffline = event => {
    const dataId = event.currentTarget.dataset.id;
    api(url, { operation: "live", test_ids: dataId, is_live: '0',validate: '0' }).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editTest({ result: result[0] })
      }
      this.handleLiveModalClose()
    })
  }


  submitData = data => {
    const dataList = this.state.data;
    const index = dataList.findIndex(x => x.id === this.state.activeDataId);
    var submit = true;
    // console.log(index)
    if (submit) {
      this.setState({ loaded: false });
      if (this.state.isNew) {
        api(url_tb, {
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
        api(url_tb, {
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

            if (result.length > 0 ){
              // console.log(this.state.folderValue.label, result[0].test_name)
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
    this.props.actions.setDefaultTest({});
    var Path = window.location.pathname.split("/")
    var textPath = null;
    textPath = decodeURIComponent(Path[4])

    api(url, { operation: "read", page_num: this.state.pageNum, page_size: this.state.pageSize.value, folder_name: textPath }).then(response => {
      const { result, filter, message, status, num_pages, total_records } = response;
      if (status) {
        this.props.actions.setTestList({
          testlist: result,
          totalTests: total_records,
          setTotal: true
        });
        const index = (filter.folders).findIndex(x => x.label === textPath);
        const indexnone = (filter.folders).findIndex(x => x.value === "none");
        // console.log(textPath,index,filter.folders)
        var folderId = null;
        var folderOptionsSelect = []
        var folderOptionsMove = []
        var folderValue = []
        if (textPath === "allbanks") {
          folderId = null
          folderOptionsSelect = filter.folders
          folderOptionsMove = [...(filter.folders).slice(0, indexnone),
          ...(filter.folders).slice(indexnone + 1)]
          folderValue = []

        } else {
          folderId = (filter.folders)[index]['value']
          folderValue = (filter.folders)[index]
          folderOptionsSelect = [...(filter.folders).slice(0, index),
          ...(filter.folders).slice(index + 1)]

          folderOptionsMove = [...(folderOptionsSelect).slice(0, indexnone),
          ...(folderOptionsSelect).slice(indexnone + 1)]

        }


        var TOPIC_DICT = [];
        (filter.category).map((row) => (
          TOPIC_DICT.push({'label':row.label,'options':[]})
        )
        );

        
        (filter.sub_category).map((row) => (
            TOPIC_DICT.map((cat) => {
              if(cat.label === row.category){
                cat.options.push({
                    'value':row.id,
                    'label':row.sub_category
                });
              }
            })
        ));

        console.log(TOPIC_DICT)


        this.setState(
          {
            loaded: true,
            numPages: num_pages,
            sortByOptions: filter.sort_by,
            orderByOptions: filter.order_by,
            topicOptions: TOPIC_DICT,
            categoryOptions: filter.category,
            folderOptionsSelect: folderOptionsSelect,
            percentileOptions: filter.percentile,
            folderOptionsMove: folderOptionsMove,
            isBlankNegativeOptions: filter.is_blank_negative,
            blankNegativeTypeOptions: filter.blank_negative_type,
            isQuestionJumpOptions: filter.is_question_jump,
            timeCalculationOptions: filter.time_calculation,
            isSectionalSequenceChooseOptions: filter.is_section_sequence_choose,
            isPausableOptions: filter.is_pausable,
            isLiveOptions: filter.is_live,
            interfaceTypeOptions: filter.interface_type,
            timerTypeTypeOptions: filter.timer_type,
            isSectionalJumpOptions: filter.is_sectional_jump,
            numMcqOptions: filter.num_options_mcq,
            courseOptions: filter.courses,
            folderId: folderId,
            folderValue:folderValue
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

    const DropdownStatusItem = styled.div`
    align-items: center;
    display: flex;
    width: 60px;
`;


    const DataWrapper = styled.div`
      width: 100%;
      padding-top:15px;
  `  ;

    const SortIconContainer = styled.div`
      margin-top:46px;
      cursor:pointer
  `  ;


    let breadCrumbElement = null
    var Path = window.location.pathname.split("/")
    var textPath = null;
    breadCrumbElement = Path.map((row, index) => {
      if (index > 2 && index < (Path.length - 1)) {
        if (['question-bank', 'test-bank'].indexOf(Path[index - 1]) >= 0) {
          textPath = decodeURIComponent(Path[index])
        } else {
          textPath = changeCase.titleCase(Path[index])
        }
        var link = (Path.slice(0, index + 1).join("/")) + "/"
        try {
          if (['question-bank', 'test-bank'].indexOf(Path[index - 1]) >= 0) {
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
          key: "test_name",
          content: "Test",
          width: 20,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "num_questions",
          content: "#Questions",
          width: 5,
          isSortable: false,
          shouldTruncate: false
        },

        {
          key: "category",
          content: "Type",
          width: 10,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "scheduled_for",
          content: "Scheduled",
          width: 10,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "courses",
          content: "Courses",
          width: 15,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "status",
          content: "Status",
          width: 5,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "created",
          content: "Created/Modified",
          width: 20,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "operations",
          content: "Operations",
          width: 7.5,
          isSortable: false,
          shouldTruncate: false
        },
      ]
    }

    let rowRenderElement = null;
    rowRenderElement = this.props.testlist.map((row, index) => ({
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
              checked={this.props.selectedTestId.indexOf(row.id) >= 0 ? true : false}
            />
          </div>
        },
        {
          key: row.id,
          content: <Link to={window.location.pathname + row.test_name+'/'}>{row.test_name}</Link>
        },
        {
          key: row.id,
          content: row.num_questions
        },
        {
          key: row.id,
          content: changeCase.titleCase(row.category.category)
        },
        {
          key: row.id,
          content: row.scheduled_for
        },
        {
          key: row.id,
          content: row.used_in_courses.map((course, key) => {
            return <div className="course-name" key={key}><Link href="" target="_blank"><Tag text={course.course_name} color="purpleLight" /></Link></div>
          })
        },
        {
          key: row.id,
          content: row.is_live === true ? (
            <Lozenge appearance="success">Live</Lozenge>
          ) : (
              <Lozenge appearance="moved">Offline</Lozenge>
            )
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
            shouldFlip={true}
            role="bottom"
          >
            <DropdownItemGroup>
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
              <Link to={window.location.pathname + row.test_name+'/'}><DropdownItem>Open</DropdownItem></Link>
              { !row.is_live && (
                <DropdownItem data-id={row.id} onClick={this.handleConfModalOpen.bind(this)}>Delete</DropdownItem>
              )}


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
            <Element name="add-test-top">
              {(this.props.addTestTop) && (
                <AddEditTest
                  blankNegativeTypeOptions={this.state.blankNegativeTypeOptions}
                  isPausableOptions={this.state.isPausableOptions}
                  percentileOptions = {this.state.percentileOptions}
                  isBlankNegativeOptions={this.state.isBlankNegativeOptions}
                  isQuestionJumpOptions={this.state.isQuestionJumpOptions}
                  timeCalculationOptions={this.state.timeCalculationOptions}
                  isSectionalSequenceChooseOptions={this.state.isSectionalSequenceChooseOptions}
                  interfaceTypeOptions={this.state.interfaceTypeOptions}
                  timerTypeTypeOptions={this.state.timerTypeTypeOptions}
                  isSectionalJumpOptions={this.state.isSectionalJumpOptions}
                  courseOptions={this.state.courseOptions}
                  numMcqOptions={this.state.numMcqOptions}
                  topicOptions={this.state.topicOptions}
                  folderId={this.state.folderId}
                  TopEnd="top"
                />
              )}
            </Element>

        </Grid>

        <Grid spacing="compact">
          <GridColumn medium={5}>
            {!this.state.folderId && (
              <div className="field-div">
                <span className="field-label">Test Bank</span>
                <CheckboxSelect
                  className="checkbox-select"
                  classNamePrefix="select"
                  options={this.state.folderOptionsSelect}
                  placeholder="TB1..."
                  onChange={this.handleFolderChange}
                  value={this.state.folderValue}
                />
              </div>

            )}
          </GridColumn>
          <GridColumn medium={3}></GridColumn>
          <GridColumn medium={2}>
            <div className="add-question-div">
              {(!this.props.addTestTop && this.state.folderId) && (
                <Button onClick={this.handleAddTestTop} appearance="primary">
                  Create Test
              </Button>
              )
              }
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="add-question-div">
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
                    onClick={this.makeLiveOfflineAll}
                    elemAfter={
                      <DropdownStatusItem>
                        <Arrow label="" size="small" />
                        <Lozenge appearance="moved">Offline</Lozenge>
                      </DropdownStatusItem>
                    }>Take Offline</DropdownItem>
                  <DropdownItem
                    onClick={this.handleMoveModalOpen}
                  >Move Tests</DropdownItem>
                                {this.state.folderId && ( 
                <DropdownItem 
                onClick={this.handleEditModalOpen}
                >Edit Bank</DropdownItem>
              )}
              {this.state.folderId && ( 
                <DropdownItem 
                onClick={this.handleTBConfModalOpen}
                >Delete Bank</DropdownItem>
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
          <GridColumn medium={3}>
            <div className="field-div">
              <span className="field-label">Courses</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.courseOptions}
                placeholder="CAT,XAT etc."
                onChange={this.handleCourseChange}
                value={this.state.courseValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={5}>
            <div className="field-div">
              <span className="field-label">Category</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.topicOptions}
                placeholder="Algebra, RC"
                onChange={this.handleTopicChange}
                value={this.state.topicValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">Live</span>
              <Select
                className="single-select"
                isClearable
                classNamePrefix="react-select"
                options={this.state.isLiveOptions}
                placeholder="Yes/No"
                value={this.state.isLiveValue}
                onChange={this.handleIsLive}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">Scheduled</span>
              <Select
                className="single-select"
                classNamePrefix="react-select"
                options={this.state.scheduledOptions}
                value={this.state.scheduledValue}
                onChange={this.handleScheduledForChange}
              />
            </div>
          </GridColumn>

          <GridColumn medium={2}>
            {(['today', 'tomorrow', 'week',''].indexOf(this.state.scheduledValue.value) < 0 && this.state.scheduledValue ) && (
              <div className="field-div">
                <span className="field-label">Start</span>
                <DatePicker id="datepicker-1" value={this.state.scheduledStartValue} onChange={this.handleDateChangeStart} />
              </div>
            )
            }
          </GridColumn>
          <GridColumn medium={2}>
            {(['today', 'tomorrow', 'week', 'for',''].indexOf(this.state.scheduledValue.value) < 0  && this.state.scheduledValue) && (
              <div className="field-div">
                <span className="field-label">End</span>
                <DatePicker id="datepicker-1" value={this.state.scheduledEndValue} onChange={this.handleDateChangeEnd} />
              </div>

            )}
          </GridColumn>
          <GridColumn medium={3}>
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
                    checked={this.props.allTestSelected}
                  />
                </div>
                <div className="check-box-text">Select All&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10564;</div>
              </div>
              <div className="question-bank-summary-text">
                  {this.props.selectedTestId.length > 0 ? 'Selected : ' : ' Total Tests : '}
                <span className="number-selected">
                  {this.props.selectedTestId.length > 0 ? this.props.selectedTestId.length + ' of ' + this.props.totalTests : ((this.props.totalTests === this.props.filteredTestRecords) ? this.props.totalTests : this.props.filteredTestRecords + '/' + this.props.totalTests)}
                </span>
              </div>
              {this.props.selectedTestId.length > 0 && (
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

            <DynamicTable
              isLoading={!this.state.loaded}
              head={head}
              rows={rowRenderElement}
              defaultPage={1}
              className="test-table"
            />
            <Element name="add-test-end">
              {(this.props.addTestEnd) && (
                <AddEditTest
                  blankNegativeTypeOptions={this.state.blankNegativeTypeOptions}
                  timeCalculationOptions={this.state.timeCalculationOptions}
                  interfaceTypeOptions={this.state.interfaceTypeOptions}
                  timerTypeTypeOptions={this.state.timerTypeTypeOptions}
                  percentileOptions = {this.state.percentileOptions}
                  numMcqOptions={this.state.numMcqOptions}
                  courseOptions={this.state.courseOptions}
                  topicOptions={this.state.topicOptions}
                  folderId={this.state.folderId}
                  TopEnd="end"
                />
              )}
            </Element>

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
        {this.state.isMoveModalOpen && (
          <ModalTransition>
            <Modal height={330} autoFocus={false} autoFocus={false} actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleMoveModalClose },
              ]
            } onClose={this.handleMoveModalClose} heading="Move Tests">

              <Form onSubmit={this.handleTestsMove}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                      <GridColumn medium={12}>
                        Move  {this.props.selectedTestId.length}  of  {this.props.totalTests}  tests to:
                      </GridColumn>

                      <GridColumn medium={12}>
                        <Field name="folder_id" label="Test Bank" isRequired>
                          {({ fieldProps }) => <Select
                            options={this.state.folderOptionsMove}
                            placeholder="TB1..."
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
        <ModalTransition>
            {this.state.isConfModalOpen && (
              <Modal autoFocus={false}  actions={
                [
                  { text: 'Confirm', appearance: 'primary', onClick: this.handleDelete },
                  { text: 'Close', appearance: 'normal', onClick: this.handleConfModalClose }

                ]
              } onClose={this.handleConfModalClose} heading={deleteConfHeader}>
                {deleteConfMessage}
              </Modal>

            )}
          </ModalTransition>
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
                  {this.state.isTBConfModalOpen && (
                    <Modal  autoFocus={false}  actions={
                      [
                        { text: 'Confirmed', appearance: 'primary', onClick: this.handleTBDelete },
                        { text: 'Close', appearance: 'normal', onClick: this.handleTBConfModalClose },
                      ]
                    } onClose={this.handleTBConfModalClose} heading={deleteTBConfHeader}>
                        {deleteTBConfMessage}              
                    </Modal>
        
                  )}
                </ModalTransition>
        
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


      </ContentWrapper>

    );
  }
}

function mapStateToProps(store) {
  return {
    ...store.test
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...test, ...flag }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TestManagement);
