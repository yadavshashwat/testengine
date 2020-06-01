// React
import React, { Component } from 'react';

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
import question from "../redux/actions/question";
import sectionquestion from "../redux/actions/sectionquestion";

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
//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import pathIcon from "../routing/BreadCrumbIcons"
import Arrow from '@atlaskit/icon/glyph/arrow-right';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
// Components
import ContentWrapper from '../components/ContentWrapper';
import QuestionCard from '../components/Question/QuestionCard/QuestionCard'
import QuestionCardLoader from '../components/Question/QuestionCard/QuestionCardLoader'
import AddEditQuestions from '../components/Question/AddEditQuestion'

// Other Packages
import ReactPaginate from 'react-paginate';
import styled from "styled-components";
import { Element, scroller } from 'react-scroll'
import { PassThrough } from 'stream';
var changeCase = require("change-case");

// api url path
var url = "/question/crud_questions/";
var url_qb = "/question/crud_folders/";
const loaderArray = [1, 2, 3]

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
const checkboxTheme = {
  backgroundColor: '#fff',
  borderColor: '#0847A6',
  uncheckedBorderColor: '#243859',
  tickColor: '#0847A6'
}
const deleteConfMessage = "Are you sure you want to delete the question bank. Please note that this will not delete any question just the question bank. Questions will be visible in 'All Questions' section of 'Question Bank' tab";
const deleteConfHeader = "Confirm Question Bank Deletion"

function arrayUnique(array) {
  var a = array.concat();
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1);
      }
  }

  return a;
}

class QuestionManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      // pagination variables
      loaded: false,
      pageNum: 1, //Current page
      pageSize: {'value':50,'label':'50 Items/Page'},
      totalQuestions: 0,
      numberFilteredRecords: 0,
      // filter variables
      isStaff: "1",
      sortByOptions: [],
      orderByOptions: [],
      topicOptions: [],
      folderOptionsSelect: [],
      folderOptionsMove: [],
      difficultyOptions: [],
      questionTypeOptions: [],
      isPassageOptions: [],
      testOptions: [],
      testExcludeOptions:[],
      isLiveOptions:[],
      searchIcon: true,
      testSearchInputOptions:[],
      testExcludeSearchInputOptions:[],
      bankSearchInputOptions:[],

      isLiveValue : "",
      topicValue: [],
      folderValue: [],
      difficultyValue: [],
      questionTypeValue: [],
      testValue: [],
      
      testExcludeValue: [],
      isPassageValue: "",
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      folderId: null,
      isMoveModalOpen: false,
      moveFolderValue: "",

      isModalOpen: false,
      isNew: false,
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
      is_live: this.state.isLiveValue ? this.state.isLiveValue.value : "",
      question_type: (this.state.questionTypeValue).map(x => x['value']).join(","),
      test_id: (this.state.testValue).map(x => x['value']).join(","),
      test_exlude_id:(this.state.testExcludeValue).map(x => x['value']).join(","),
      topic_id: (this.state.topicValue).map(x => x['value']).join(","),
      difficulty: (this.state.difficultyValue).map(x => x['value']).join(","),
      is_passage: this.state.isPassageValue ? this.state.isPassageValue.value : "",
      folder_id: (this.state.folderId ? this.state.folderId : (this.state.folderValue).map(x => x['value']).join(",")),
    };
    console.log(payloadData)
    let payload = Object.assign({}, payloadData, obj);
    console.log(payload, "Payload");
    api(url, payload)
      .then(response => {
        const { result, status, num_pages, total_records } = response;
        if (status) {
          this.props.actions.setQuestionList({
            questionlist: result,
            totalQuestions: total_records,
            setTotal: false
          });
          this.setState({
            // data: result,
            loaded: true,
            numPages: num_pages,
            numberFilteredRecords: total_records
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
    this.setState({ sortValue: value ? value : "", pageNum: 1 }, () => {
      this.applyFilter({ sort_by: value ? value.value : "", page_num: 1 });
    });
  };

  handleQuestionTypeChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ questionTypeValue: value, pageNum: 1 }, () => {
      this.applyFilter({ question_type: data, page_num: 1 });
    });
  };

  handleNumItemsChange = value => {
    this.setState({ pageSize: value ? value: "" , pageNum: 1 }, () => {
      this.applyFilter({ page_size: value ? value.value: "" , page_num: 1 });
    });
  }


  handleTopicChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ topicValue: value, pageNum: 1 }, () => {
      this.applyFilter({ topic_id: data, page_num: 1 });
    });
  };

  handleTestChange = value => {
    const data = (value).map(x => x['value']).join(",");
    // console.log(options)
    this.setState({ testValue: value, pageNum: 1 }, () => {
      this.applyFilter({ test_id: data, page_num: 1 });
    });
  };



  handleTestExcludeChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ testExcludeValue: value, pageNum: 1 }, () => {
      this.applyFilter({ test_exlude_id: data, page_num: 1 });
    });
  };


  handleDifficultyChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ difficultyValue: value, pageNum: 1 }, () => {
      this.applyFilter({ difficulty: data, page_num: 1 });
    });
  };

  handleFolderChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ folderValue: value, pageNum: 1 }, () => {
      this.applyFilter({ folder_id: data, page_num: 1 });
    });
  };

  handleIsPassageChange = value => {
    this.setState({ isPassageValue: value ? value : "", pageNum: 1 }, () => {
      this.applyFilter({ is_passage: value ? value.value : "", page_num: 1 });
    });
  };

  handleIsLive = value => {
    this.setState({ isLiveValue: value ? value : "", pageNum: 1 }, () => {
      this.applyFilter({ is_live: value ? value.value : "", page_num: 1 });
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
    api(url_qb, {
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
        browserHistory.push('/testengine/adminpanel/question-folder/')
        this.handleConfModalClose();  
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
    api(url_qb, {
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

  handleSelectAll = event => {
    const selected = this.props.allQuesSelected
    if (selected) {
      this.props.actions.deselectAllQuestion({});
    } else {

      this.props.actions.selectAllQuestion({});
    }
  }

  handleTestInputChange = event => {
    var newOptions = []
    this.state.testOptions.map((option) => {
      if (option.label.toLowerCase().indexOf(event.toLowerCase()) >= 0) {
        newOptions.push(option)
      }
    })
    if (event != ""){
      this.setState({
        testSearchInputOptions:newOptions
      })  
    }
  }


  handleBankInputChange = event => {
    var newOptions = []
    
    this.state.folderOptionsSelect.map((option) => {
      console.log(option.label.toLowerCase(),event.toLowerCase(),option.label.indexOf(event.toLowerCase()))
      if (option.label.toLowerCase().indexOf(event.toLowerCase()) >= 0) {
        newOptions.push(option)
      }
    })
    console.log(newOptions)
    if (event != ""){
      this.setState({
        bankSearchInputOptions:newOptions
      })  
    }
  }


  handleBankSelectAll = () => {
    var optionsToAdd = []
    optionsToAdd = arrayUnique(this.state.folderValue.concat(this.state.bankSearchInputOptions));
    this.setState({
      folderValue : optionsToAdd,
      bankSearchInputOptions: []
    })

    const data = (optionsToAdd).map(x => x['value']).join(",");
    console.log(data)
    this.setState({ 
      folderValue : optionsToAdd,
      bankSearchInputOptions: [], 
      pageNum: 1 }, () => {
      this.applyFilter({ folder_id: data, page_num: 1 });
    });
    
  }


  handleTestSelectAll = () => {
    var optionsToAdd = []
    optionsToAdd = arrayUnique(this.state.testValue.concat(this.state.testSearchInputOptions));
    this.setState({
      testValue : optionsToAdd,
      testSearchInputOptions: []
    })

    const data = (optionsToAdd).map(x => x['value']).join(",");

    this.setState({ testValue : optionsToAdd,
      testSearchInputOptions: [], 
      pageNum: 1 }, () => {
      this.applyFilter({ test_id: data, page_num: 1 });
    });
    
  }

  handleTestExcludeInputChange = event => {
    var newOptions = []
    this.state.testExcludeOptions.map((option) => {
      if (option.label.toLowerCase().indexOf(event.toLowerCase()) >= 0) {
        newOptions.push(option)
      }
    })
    if (event != ""){
      console.log(newOptions)
      this.setState({
        testExcludeSearchInputOptions:newOptions
      })  
    }
  }

  handleTestExcludeSelectAll = () => {
    var optionsToAdd = []
    optionsToAdd = arrayUnique(this.state.testExcludeValue.concat(this.state.testExcludeSearchInputOptions));
    const data = (optionsToAdd).map(x => x['value']).join(",");
    this.setState({
      testExcludeValue : optionsToAdd,
      testExcludeSearchInputOptions: []
    }, () => {
      this.applyFilter({ test_exlude_id: data, page_num: 1 });
    });

  }


  handleAddQuestionTop = () => {
    const position = "top";
    this.props.actions.viewAddQuestion({
      position: position
    });
    scroller.scrollTo('add-question-top', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -50
    });

  }

  handleAddQuestionEnd = () => {
    const position = "end";
    this.props.actions.viewAddQuestion({
      position: position
    });
    scroller.scrollTo('add-question-end', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart'
    });
  }

  handleEmptySelection = () => {
    this.props.actions.emptySelectedQuestion({});
  }
  handleMoveModalOpen = () => {
    this.setState({
      isMoveModalOpen: true
    });
  }

  handleMakeLive = () => {
    this.makeLiveOffline(true);
  }

  handleMakeOffline = () => {
    this.makeLiveOffline(false);
  }


  makeLiveOffline = (isLive) => {
    api(url, { operation: "live", question_ids: this.props.selectedQuestionId.join(","), is_live: isLive ? '1' : 0 }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status){
        this.props.actions.emptySelectedQuestion({});
        this.applyFilter({ page_num: this.state.pageNum });
  
      }
    })
  }
  handleMoveModalClose = () => {
    this.setState({
      isMoveModalOpen: false
    });
  }

  handleMoveFolderSelectChange = value => {
    this.setState({ moveFolderValue: value ? value : "" });
  };

  handleQuestionsMove = data => {
    api(url, { operation: "move", folder_id: data.folder_id.value, question_ids: this.props.selectedQuestionId.join(",") }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if(status){
        this.setState({
          moveFolderValue: '',
          isMoveModalOpen: false
        })
        this.props.actions.emptyMoveSelectedQuestion({});
        this.applyFilter({ page_num: this.state.pageNum });
  
      }

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
        api(url_qb, {
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
        api(url_qb, {
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
    this.props.actions.setDefaultQuestions({});
    this.props.actions.setDefaultSectionQuestions({});
    // this.props.actions.setEmptyEditQuestion({});
    var Path = window.location.pathname.split("/")
    var textPath = null;
    textPath = decodeURIComponent(Path[5])

    api(url, { operation: "read", page_num: this.state.pageNum, page_size: this.state.pageSize.value, folder_name: textPath }).then(response => {
      const { result, filter, message, status, num_pages, total_records } = response;
      // this.props.actions.addFlag({
      //   message: message,
      //   appearance: (status ? "normal" : "warning")
      // });
      if (status) {
        this.props.actions.setQuestionList({
          questionlist: result,
          totalQuestions: total_records,
          setTotal: true
        });
        const index = (filter.folders).findIndex(x => x.label === textPath);
        const indexnone = (filter.folders).findIndex(x => x.value === "none");
        // console.log(textPath,index,filter.folders)
        var folderId = null;
        var folderOptionsSelect = []
        var folderOptionsMove = []
        var folderValue = '';
        if (textPath === "allbanks") {
          folderId = ''
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
        this.setState(
          {
            loaded: true,
            numPages: num_pages,
            totalQuestions: total_records,
            numberFilteredRecords: total_records,
            sortByOptions: filter.sort_by,
            orderByOptions: filter.order_by,
            topicOptions: TOPIC_DICT,
            folderOptionsSelect: folderOptionsSelect,
            folderOptionsMove: folderOptionsMove,
            difficultyOptions: filter.difficulty,
            questionTypeOptions: filter.question_type,
            isLiveOptions: filter.is_live,
            isPassageOptions: filter.is_passage,
            testOptions: filter.tests,
            testExcludeOptions: filter.tests_exclude,
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
        if (['question-bank', 'test-bank','question-folder'].indexOf(Path[index - 1]) >= 0) {
          textPath = decodeURIComponent(Path[index])
        } else if (['question-bank', 'test-bank','question-folder'].indexOf(Path[index - 2]) >= 0) { 
          textPath = decodeURIComponent(Path[index])
        } else {
          textPath = changeCase.titleCase(Path[index])
        }
        var link = (Path.slice(0, index + 1).join("/")) + "/"
        try {
          if (['question-bank', 'test-bank','question-folder'].indexOf(Path[index - 2]) >= 0) {
            return (<BreadcrumbsItem key={index} iconBefore={pathIcon['folder']} href={link} text={textPath} />);
          } else if (['question-bank', 'test-bank','question-folder'].indexOf(Path[index - 1]) >= 0) {
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

    let renderBodyElement = null;
    if (this.state.loaded === true) {
      renderBodyElement = null;
      renderBodyElement = this.props.questionlist.map((row, key) => {
        return (
          <QuestionCard
            difficultyOptions={this.state.difficultyOptions}
            questionTypeOptions={this.state.questionTypeOptions}
            topicOptions={this.state.topicOptions}
            folderId={this.state.folderId}
            index={(this.state.pageNum - 1) * this.state.pageSize.value + key + 1}
            loaded={true}
            key={key}
            data={row}
            ></QuestionCard>
        );
      });
    } else {
      renderBodyElement = loaderArray.map((row, key) => {
        return <QuestionCardLoader key={key} ></QuestionCardLoader>;
      });
    }


    return (
      <ContentWrapper>
        <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        <Grid spacing="compact">
          <GridColumn medium={5}>
            {!this.state.folderId && (
              <div className="field-div">
                <span className="field-label">Question Bank</span>
                <CheckboxSelect
                  className="checkbox-select"
                  classNamePrefix="select"
                  options={this.state.folderOptionsSelect}
                  placeholder="QB1"
                  onChange={this.handleFolderChange}
                  value={this.state.folderValue}
                  onInputChange={this.handleBankInputChange}
                />
              </div>

            )}
          </GridColumn>
          {!this.state.folderId && (
          <GridColumn medium={1}>
            <SortIconContainer><CheckCircleIcon onClick={this.handleBankSelectAll} className="sortIcon"></CheckCircleIcon></SortIconContainer>
          </GridColumn>
          )}
          <GridColumn medium={2}></GridColumn>
          <GridColumn medium={2}>
            <div className="add-question-div">
              {(!this.props.addQuestionTop && this.state.folderId) && (
                <Button onClick={this.handleAddQuestionTop} appearance="primary">
                  Add Question
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
                  isDisabled = {this.props.selectedQuestionId.length === 0}
                    onClick={this.handleMakeLive}
                    elemAfter={
                      <DropdownStatusItem>
                        <Arrow label="" size="small" />
                        <Lozenge appearance="success">Live</Lozenge>
                      </DropdownStatusItem>
                    }>Make Live</DropdownItem>

                  <DropdownItem
                    isDisabled = {this.props.selectedQuestionId.length === 0}
                    onClick={this.handleMakeOffline}
                    elemAfter={
                      <DropdownStatusItem>
                        <Arrow label="" size="small" />
                        <Lozenge appearance="moved">Offline</Lozenge>
                      </DropdownStatusItem>
                    }>Take Offline</DropdownItem>
                    <DropdownItem 
                    isDisabled = {this.props.selectedQuestionId.length === 0}
                    onClick={this.handleMoveModalOpen}
                    >Move Questions</DropdownItem>
                    {this.state.folderId && ( 
                      <DropdownItem 
                      onClick={this.handleEditModalOpen}
                      >Edit Bank</DropdownItem>
                    )}
                    {this.state.folderId && ( 
                      <DropdownItem 
                      onClick={this.handleConfModalOpen}
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
          <GridColumn medium={5}>
            <div className="field-div">
              <span className="field-label">Type</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.questionTypeOptions}
                placeholder="MCQ Single, Word etc."
                onChange={this.handleQuestionTypeChange}
                value={this.state.questionTypeValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={5}>
            <div className="field-div">
              <span className="field-label">Topic</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.topicOptions}
                placeholder="Topic"
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
              <span className="field-label">Passage</span>
              <Select
                className="single-select"
                isClearable
                classNamePrefix="react-select"
                options={this.state.isPassageOptions}
                placeholder="Yes/No"
                value={this.state.isPassageValue}
                onChange={this.handleIsPassageChange}
              />
            </div>
          </GridColumn>

          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">Difficulty</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.difficultyOptions}
                placeholder="1,2,3 etc."
                onChange={this.handleDifficultyChange}
                value={this.state.difficultyValue}
              />
            </div>
          </GridColumn>

          <GridColumn medium={5}>
            <div className="field-div">
              <span className="field-label">Tests</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.testOptions}
                placeholder="CAT,XAT.."
                onChange={this.handleTestChange}
                value={this.state.testValue}
                onInputChange={this.handleTestInputChange}
              />
            </div>
          </GridColumn>
          <GridColumn medium={1}>
            <SortIconContainer><CheckCircleIcon onClick={this.handleTestSelectAll} className="sortIcon"></CheckCircleIcon></SortIconContainer>
          </GridColumn>

          <GridColumn medium={5}>
            <div className="field-div">
              <span className="field-label">Test to Exclude</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.testExcludeOptions}
                placeholder="CAT,XAT.."
                onChange={this.handleTestExcludeChange}
                value={this.state.testExcludeValue}
                onInputChange={this.handleTestExcludeInputChange}
              />
            </div>
          </GridColumn>
          <GridColumn medium={1}>
            <SortIconContainer><CheckCircleIcon onClick={this.handleTestExcludeSelectAll} className="sortIcon"></CheckCircleIcon></SortIconContainer>
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
                    checked={this.props.allQuesSelected}
                  />
                </div>
                <div className="check-box-text">Select All&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10564;</div>
              </div>
              <div className="question-bank-summary-text">
                {this.props.selectedQuestionId.length > 0 ? 'Selected : ' : ' Total Questions : '}
                <span className="number-selected">
                  {this.props.selectedQuestionId.length > 0 ? this.props.selectedQuestionId.length + ' of ' + this.props.totalQuestions : ((this.props.totalQuestions === this.props.filteredQuestionRecords) ? this.props.totalQuestions : this.props.filteredQuestionRecords + '/' + this.props.totalQuestions)}
                </span>
              </div>
              {this.props.selectedQuestionId.length > 0 && (
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
            <Element name="add-question-top">
              {(this.props.addQuestionTop) && (
                <AddEditQuestions
                  difficultyOptions={this.state.difficultyOptions}
                  questionTypeOptions={this.state.questionTypeOptions}
                  topicOptions={this.state.topicOptions}
                  folderValue={this.state.folderValue}
                  TopEnd="top"
                />
              )}
            </Element>
            {renderBodyElement}
            <Element name="add-question-end">
              {(this.props.addQuestionEnd) && (
                <AddEditQuestions
                  difficultyOptions={this.state.difficultyOptions}
                  questionTypeOptions={this.state.questionTypeOptions}
                  topicOptions={this.state.topicOptions}
                  folderValue={this.state.folderValue}
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
        <Grid spacing="compact">
          <GridColumn medium={10}></GridColumn>
          <GridColumn medium={2}>
            <div className="add-question-div">
              {(!this.props.addQuestionEnd && this.state.folderId) && (
                <Button onClick={this.handleAddQuestionEnd} appearance="primary">
                  Add Question
              </Button>
              )
              }
            </div>
          </GridColumn>

        </Grid>
        {this.state.isMoveModalOpen && (
          <ModalTransition>
            <Modal height={330} autoFocus={false} autoFocus={false} actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleMoveModalClose }
              ]
            } onClose={this.handleMoveModalClose} heading="Move Questions">

              <Form onSubmit={this.handleQuestionsMove}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                      <GridColumn medium={12}>
                        Move  {this.props.selectedQuestionId.length}  of  {this.props.totalQuestions}  questions to:
                      </GridColumn>

                      <GridColumn medium={12}>
                        <Field name="folder_id" label="Question Bank" isRequired>
                          {({ fieldProps }) => <Select
                            options={this.state.folderOptionsMove}
                            placeholder="QB1..."
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
        

        


      </ContentWrapper>

    );
  }
}

function mapStateToProps(store) {
  return {
    ...store.question,
    ...store.sectionquestion
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...question,...sectionquestion, ...flag }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuestionManagement);
