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
import question from "../redux/actions/question";
import section from "../redux/actions/section";
import sectionquestion from "../redux/actions/sectionquestion";

// Atlaskit Packages
import Select from "@atlaskit/select";
import Button from '@atlaskit/button';

import { CheckboxSelect } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import Form, { Field } from '@atlaskit/form';
import Checkbox from 'react-simple-checkbox';
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';

//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import pathIcon from "../routing/BreadCrumbIcons"

// Components
import ContentWrapper from '../components/ContentWrapper';
import QuestionCard from '../components/Question/QuestionCard/QuestionCard'
import QuestionCardLoader from '../components/Question/QuestionCard/QuestionCardLoader'
import AddEditQuestions from '../components/Question/AddEditQuestion'
import AddExistingQuestions from "./AddExistingModal"


import EditorInstructions from "../components/Editors/EditorInstructions"
import SectionCard from "../components/Test/SectionCard"



// Other Packages
import Parser from "html-react-parser";
import ReactPaginate from 'react-paginate';
import styled from "styled-components";
import { Element, scroller } from 'react-scroll'
var changeCase = require("change-case");

// api url path
var url_section   = "/test/crud_section/";
var url_questions = "/question/crud_sectionquestions/";
var url = "/question/crud_questions/";
const itemOptions = [
  {'value':10,'label':'10 Items/Page'},
  {'value':20,'label':'20 Items/Page'},
  {'value':30,'label':'30 Items/Page'},
  {'value':50,'label':'50 Items/Page'},
  {'value':100,'label':'100 Items/Page'}
]


const loaderArray = [1, 2, 3]


const checkboxTheme = {
  backgroundColor: '#fff',
  borderColor: '#0847A6',
  uncheckedBorderColor: '#243859',
  tickColor: '#0847A6'
}

class SectionQuestionManagement extends Component {
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
      folderOptions: [],
      difficultyOptions: [],
      questionTypeOptions: [],
      isPassageOptions: [],
      
      isLiveOptions:[],
      searchIcon: true,

      isLiveValue : "",
      topicValue: [],
      folderValue: [],
      difficultyValue: [],
      questionTypeValue: [],
      
      isPassageValue: "",
      searchValue: "",
      sortValue: "",
      orderBy: "asc",
      folderId: null,
      isMoveModalOpen: false,
      moveFolderValue: "",
      sectionId:null,
      instructionsModalOpen: false,
      instructionValue: '',
      isNewInstruction: true,
      activeInstructionKey: '',

      addExistingModalOpen:false,
      isMarksUpdateModalOpen:false



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
      section_id:this.state.sectionId,
      // Basic Filters
      sort_by: this.state.sortValue ? this.state.sortValue.value : "",
      order_by: this.state.orderBy,
      search: this.state.searchValue,
      page_num: 1,
      page_size: this.state.pageSize.value,
      question_type: (this.state.questionTypeValue).map(x => x['value']).join(","),
      topic_id: (this.state.topicValue).map(x => x['value']).join(","),
      difficulty: (this.state.difficultyValue).map(x => x['value']).join(","),
      is_passage: this.state.isPassageValue ? this.state.isPassageValue.value : "",
    };
    let payload = Object.assign({}, payloadData, obj);
    // console.log(payload, "Payload");
    api(url_questions, payload)
      .then(response => {
        const { result, status, num_pages, total_records } = response;
        if (status) {
          this.props.actions.setSectionQuestionList({
            sectionQuestionList: result,
            totalSectionQuestions: total_records,
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
    this.setState({ testValue: value, pageNum: 1 }, () => {
      this.applyFilter({ test_id: data, page_num: 1 });
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


  handleSelectAll = event => {
    const selected = this.props.allSectionQuestionSelected
    if (selected) {
      this.props.actions.deselectAllSectionQuestion({});
    } else {

      this.props.actions.selectAllSectionQuestion({});
    }

  }


  

  handleAddQuestionTop = () => {
    const position = "top";
    this.props.actions.viewAddSectionQuestion({
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
    this.props.actions.viewAddSectionQuestion({
      position: position
    });
    scroller.scrollTo('add-question-end', {
      duration: 800,
      delay: 0,
      smooth: 'easeInOutQuart'
    });
  }

  handleEmptySelection = () => {
    this.props.actions.emptySelectedSectionQuestion({});
  }
  handleMoveModalOpen = () => {
    this.setState({
      isMoveModalOpen: true
    });
  }


  handleInstructionModalOpen = () => {
    this.setState({
      instructionsModalOpen: true,
      instructionValue: '',
      isNewInstruction: true,
      activeInstructionKey: ''
    })
  }

  handleInstructionModalClose = () => {
    this.setState({
      instructionsModalOpen: false,
      instructionValue: '',
      isNewInstruction: true,
      activeInstructionKey: ''

    })
  }

  handleAddExistingModalClose = () =>{
  this.setState({
    addExistingModalOpen:false
  });
  this.props.actions.emptySelectedQuestion({});
  }

  handleAddExistingModalOpen = () =>{
    this.setState({
      addExistingModalOpen:true
    });
    this.props.actions.emptySelectedQuestion({});
    }
  
  handleInstructionChange = html => {
    this.setState({
      instructionValue: html
    });
  }


  handleInstructionEditModalOpen = event => {
    const activeInstructionKey = event.currentTarget.dataset.id
    const activeInstructionHtml = event.currentTarget.dataset.html

    this.setState({
      instructionsModalOpen: true,
      instructionValue: activeInstructionHtml,
      activeInstructionKey: activeInstructionKey,
      isNewInstruction: false
    })


  }


  handleEditInstruction = event => {
    var newInstructions = [...this.props.sectionlist[0].instructions.slice(0, this.state.activeInstructionKey),
    this.state.instructionValue,
    ...this.props.sectionlist[0].instructions.slice(this.state.activeInstructionKey + 1)]
    this.handleInstructionModalClose();

    api(url_section, { operation: "instructions", data_id: this.state.sectionId, instructions: JSON.stringify(newInstructions) }).then(response => {
      const { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editSection({ result: result[0]})
      }

    });
  }

  handleInstructionDelete = event => {
    const index = event.currentTarget.dataset.id
    var newInstructions = [...this.props.sectionlist[0].instructions.slice(0, index), ...this.props.sectionlist[0].instructions.slice(index + 1)]
    api(url_section, { operation: "instructions", data_id: this.state.sectionId, instructions: JSON.stringify(newInstructions) }).then(response => {
      const { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editSection({ result: result[0]  })
      }
    });

  }


  addQuestionstoSection = () =>{
    api(url_questions, { operation: "copy", section_id: this.state.sectionId, question_ids : this.props.selectedQuestionId.join(',')  }).then(response => {
      const { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.addToSectionQuestionsList({ result: result });
        this.props.actions.emptySelectedQuestion({});
        this.setState({
          addExistingModalOpen:false
        })
      }
    });
  }

  handleAddInstructions = () => {
    var newInstructions = [...this.props.sectionlist[0].instructions, this.state.instructionValue]
    console.log(newInstructions)
    this.handleInstructionModalClose();
    api(url_section, { operation: "instructions", data_id: this.state.sectionId, instructions: JSON.stringify(newInstructions) }).then(response => {
      const { result, message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        this.props.actions.editSection({ result: result[0]  })
      }

    });
  }


  

  




  handleMakeLive = () => {
    this.makeLiveOffline(true);
  }

  handleMakeOffline = () => {
    this.makeLiveOffline(false);
  }


  makeLiveOffline = (isLive) => {
    api(url, { operation: "live", question_ids: this.props.selectedSectionQuestionId.join(","), is_live: isLive ? '1' : 0 }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status){
        this.props.actions.emptySelectedSectionQuestion({});
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
    api(url, { operation: "move", folder_id: data.folder_id.value, question_ids: this.props.selectedSectionQuestionId.join(",") }).then(response => {
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
        this.props.actions.emptyMoveSelectedSectionQuestion({});
        this.applyFilter({ page_num: this.state.pageNum });
  
      }

    });
  }

  handleMarksUpdateModalOpen = () =>{
    this.setState({
      isMarksUpdateModalOpen:true
    })
  }

  handleMarksUpdateModalClose = () =>{
    this.setState({
      isMarksUpdateModalOpen:false
    })
  }

  handleMarksUpdate = data => {
    console.log(data)
    api(url_questions, { operation: "marks_update", section_id: this.state.sectionId, question_ids: this.props.selectedSectionQuestionId.join(","), positive_marks: data.positiveMarks, negative_marks:data.negativeMarks }).then(response => {
      const { message, status } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status){
        this.props.actions.emptySelectedSectionQuestion({});
        this.applyFilter({ page_num: this.state.pageNum });
        this.setState({
          isMarksUpdateModalOpen:false
        })
  
      }
    })

  }

  // On Load
  componentDidMount() {
    this.props.actions.setDefaultQuestions({});
    this.props.actions.setDefaultSectionQuestions({});
    this.props.actions.setDefaultSection({});
    // this.props.actions.setEmptyEditSection({});
    // this.props.actions.setEmptyEditSectionQuestion({});
    // this.props.actions.setEmptyEditQuestion({});
    var Path = window.location.pathname.split("/")
    var sectionId = null;
    sectionId = decodeURIComponent(Path[6])

    api(url_section, { operation: "read",  data_id: sectionId }).then(response => {
      const { result, filter, status, total_records } = response;
      if (status) {
        this.props.actions.setSectionList({
          sectionlist: result,
          totalSections: total_records,
          setTotal: true
        });
        if (result.length > 0){
          this.setState(
            {
              isEvalManualOptions :filter.is_eval_manual,
              assignedToOptions   :filter.assigned_to,
              percentileOptions   :filter.percentile,
              isCalculatorOptions :filter.is_calculator,
              sectionId           :sectionId,
              sectionPositive     :result[0].default_positive_marks,
              sectionNegative     :result[0].default_negative_marks,
              sectionName         : result[0].sub_section_name
              
            }
          );  
        }
        

        api(url_questions, { operation: "read", page_num: this.state.pageNum, page_size: this.state.pageSize.value, section_id: sectionId }).then(response => {
          const { result, filter, message, status, num_pages, total_records } = response;
          // this.props.actions.addFlag({
          //   message: message,
          //   appearance: (status ? "normal" : "warning")
          // });
          if (status) {
            this.props.actions.setSectionQuestionList({
              sectionQuestionList: result,
              totalSectionQuestions: total_records,
              setTotal: true,
            });
            
            const indexnone = (filter.folders).findIndex(x => x.value === "none");
            const folderOptions = [...(filter.folders).slice(0, indexnone),
              ...(filter.folders).slice(indexnone + 1)]

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
                sortByOptions: filter.sort_by,
                orderByOptions: filter.order_by,
                topicOptions: TOPIC_DICT,
                difficultyOptions: filter.difficulty,
                questionTypeOptions: filter.question_type,
                isPassageOptions: filter.is_passage,
                folderOptions:folderOptions
              }
            );
          }
        });

      }
    });
  }


  render() {
    // const caption = "User Lists";

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
        } else if (['question-bank', 'test-bank'].indexOf(Path[index - 2]) >= 0){
          textPath = decodeURIComponent(Path[index])
        }else if(Path[index] === this.state.sectionId){
          textPath = this.state.sectionName
        }else{
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

    let renderBodyElement = null;
    if (this.state.loaded === true) {
      renderBodyElement = null;
      renderBodyElement = this.props.sectionQuestionList.map((row, key) => {
        return (
          <QuestionCard
            
            difficultyOptions={this.state.difficultyOptions}
            questionTypeOptions={this.state.questionTypeOptions}
            topicOptions={this.state.topicOptions}
            folderOptions={this.state.folderOptions}
            // folderId={this.state.folderId}
            index={(this.state.pageNum - 1) * this.state.pageSize.value + key + 1}
            loaded={true}
            key={key}
            sectionId={this.state.sectionId}
            pageNum = {this.state.pageNum}
            pageSize = {this.state.pageSize}
            data={row}></QuestionCard>
        );
      });
    } else {
      renderBodyElement = loaderArray.map((row, key) => {
        return <QuestionCardLoader key={key} ></QuestionCardLoader>;
      });
    }

    let renderInstructions = null;
    if (this.props.sectionlist.length > 0) {
      renderInstructions = this.props.sectionlist[0].instructions.map((row, key) => {
        return (
          <div key={key} className="add-edit-instruction-div-section">
            <div className="question-header">
              <div className="question-add-header">Instruction {key + 1}</div>
            </div>
            <div className="question-header">
              <div className="edit-button-row">
                <DropdownMenu
                  trigger="Options"
                  triggerType="button"
                  shouldFlip={true}
                  role="bottom">
                  <DropdownItemGroup>
                    <DropdownItem data-html={row} data-id={key} onClick={this.handleInstructionEditModalOpen}>Edit</DropdownItem>
                    <DropdownItem data-id={key} onClick={this.handleInstructionDelete}>Delete</DropdownItem>
                  </DropdownItemGroup>
                </DropdownMenu>
              </div>
            </div>
            <Grid className="instruction-content">
              <GridColumn medium={12}>
                {Parser(row)}
              </GridColumn>
            </Grid>
          </div>

        )

      })
    }
  


    return (
      <ContentWrapper>
        <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        <SectionCard
          data={this.props.sectionlist[0]}
          assignedToOptions={this.state.assignedToOptions}
          percentileOptions={this.state.percentileOptions}
          individualCard={true}
          numQuestions={this.props.totalSectionQuestions}
        ></SectionCard>
        
        {renderInstructions}
        
        <Grid spacing="compact">
          <div className="add-instructions">
            <div className="add-section">
              <Button onClick={this.handleInstructionModalOpen} appearance="primary">
                Add Instructions
            </Button>
            </div>
          </div>
        </Grid>


        <Grid spacing="compact">
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
                    checked={this.props.allSectionQuestionSelected}
                  />
                </div>
                <div className="check-box-text">Select All&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#10564;</div>
              </div>
              <div className="question-bank-summary-text">
                {this.props.selectedSectionQuestionId.length > 0 ? 'Selected : ' : ' Total Questions : '}
                <span className="number-selected">
                  {this.props.selectedSectionQuestionId.length > 0 ? this.props.selectedSectionQuestionId.length + ' of ' + this.props.totalSectionQuestions : ((this.props.totalSectionQuestions === this.props.filteredSectionQuestionRecords) ? this.props.totalSectionQuestions : this.props.filteredSectionQuestionRecords + '/' + this.props.totalSectionQuestions)}
                </span>
              </div>
              {this.props.selectedSectionQuestionId.length > 0 && (
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
            {renderBodyElement}
            <Element name="add-question-end">
              {(this.props.addSectionQuestionEnd) && (
                <AddEditQuestions
                  sectionId={this.state.sectionId}
                  sectionPositiveMarks={this.state.sectionPositive}
                  sectionNegativeMarks={this.state.sectionNegative}
                  folderOptions = {this.state.folderOptions}
                  difficultyOptions={this.state.difficultyOptions}
                  questionTypeOptions={this.state.questionTypeOptions}
                  topicOptions={this.state.topicOptions}
                  // folderId={this.state.folderId}
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
          <div className="add-exisiting-question-row">
            <div className="add-question-div-button">
              {(!this.props.addSectionQuestionEnd) && (
                <Button onClick={this.handleAddQuestionEnd} appearance="primary">
                  Add Question
              </Button>
              )
              }
            </div>
            <div className="add-question-div-button">
                <Button onClick={this.handleAddExistingModalOpen} appearance="primary">
                  Add Existing Questions
              </Button>
            </div>
            <div className="add-question-div-button">
                <Button onClick={this.handleMarksUpdateModalOpen} appearance="primary">
                  Marks Bulk Update
              </Button>
            </div>

          </div>
        </Grid>
        {this.state.instructionsModalOpen && (
          <ModalTransition>
            <Modal autoFocus={false} width={'60%'} actions={
              [
                { text: this.state.isNewInstruction ? 'Add Instruction' : 'Edit Instruction', appearance: 'primary', onClick: this.state.isNewInstruction ? this.handleAddInstructions : this.handleEditInstruction },
                { text: 'Close', appearance: 'normal', onClick: this.handleInstructionModalClose },
              ]
            } onClose={this.handleInstructionModalClose} heading={this.state.isNewInstruction ? 'New Instruction' : 'Edit Instruction'}>
              <Grid>
                <GridColumn medium={12}>
                  <div className="passage-editor">
                    <EditorInstructions
                      onChange={this.handleInstructionChange}
                      html={this.state.instructionValue}
                    />
                  </div>
                </GridColumn>
              </Grid>
            </Modal>
          </ModalTransition>
        )}

      {this.state.addExistingModalOpen && (
          <ModalTransition>
                    <Modal autoFocus={false} width={'60%'} actions={
        [
          { text: 'Add', appearance: 'primary', onClick: this.addQuestionstoSection},
          { text: 'Close', appearance: 'normal', onClick: this.handleAddExistingModalClose },
        ]
      } onClose={this.handleAddExistingModalClose} heading={"Add Existing Questions"}>

              <AddExistingQuestions>

              </AddExistingQuestions>
              </Modal>
          </ModalTransition>
        )}


        {this.state.isMarksUpdateModalOpen && (
          <ModalTransition>
            <Modal height={330} autoFocus={false} autoFocus={false} actions={
              [
                { text: 'Close', appearance: 'normal', onClick: this.handleMarksUpdateModalClose },
              ]
            } onClose={this.handleMoveModalClose} heading="Move Tests">

              <Form onSubmit={this.handleMarksUpdate}>
                {({ formProps }) => (
                  <form {...formProps}>
                    <Grid>
                    <GridColumn medium={12}>
                        Update  {this.props.selectedSectionQuestionId.length} selected questions:
                      </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="positiveMarks"
                              
                              label="Positive Marks" 
                              isRequired>
                          {({ fieldProps }) => <TextField 
                          type="number"
                          min={0}
                          // placeholder="eg. John"
                           {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    <GridColumn medium={6}>
                        <Field name="negativeMarks"
                              label="Negative Marks" 
                              isRequired>
                          {({ fieldProps }) => <TextField 
                              type="number"
                              min={0}

                            // placeholder="eg. John"
                           {...fieldProps} />}
                        </Field>
                    </GridColumn>
                    </Grid>
                    <Grid>
                      <GridColumn medium={12}>
                        <br></br>
                        <br></br>
                        <Button type="submit" appearance="primary">
                          Update
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
    ...store.question,
    ...store.sectionquestion,
    ...store.section
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...question,...section,...sectionquestion, ...flag }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionQuestionManagement);
