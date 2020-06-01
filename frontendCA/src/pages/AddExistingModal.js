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
import sectionquestion from "../redux/actions/sectionquestion";

// Atlaskit Packages
import Select from "@atlaskit/select";

import SearchIcon from "@atlaskit/icon/glyph/search";
import { CheckboxSelect } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';

import Checkbox from 'react-simple-checkbox';
//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';
import CrossCircleIcon from '@atlaskit/icon/glyph/cross-circle';
import CheckCircleIcon from '@atlaskit/icon/glyph/check-circle';
// Components
import QuestionCard from '../components/Question/QuestionCard/QuestionCard'
import QuestionCardLoader from '../components/Question/QuestionCard/QuestionCardLoader'

// Other Packages
import ReactPaginate from 'react-paginate';
import styled from "styled-components";

// api url path
var url = "/question/crud_questions/";

const loaderArray = [1, 2, 3]

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

const checkboxTheme = {
  backgroundColor: '#fff',
  borderColor: '#0847A6',
  uncheckedBorderColor: '#243859',
  tickColor: '#0847A6'
}

const itemOptions = [
  {'value':10,'label':'10 Items/Page'},
  {'value':20,'label':'20 Items/Page'},
  {'value':30,'label':'30 Items/Page'},
  {'value':50,'label':'50 Items/Page'},
  {'value':100,'label':'100 Items/Page'}
]


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
      topic_id: (this.state.topicValue).map(x => x['value']).join(","),
      difficulty: (this.state.difficultyValue).map(x => x['value']).join(","),
      is_passage: this.state.isPassageValue ? this.state.isPassageValue.value : "",
      test_exlude_id:(this.state.testExcludeValue).map(x => x['value']).join(","),
      folder_id: (this.state.folderId ? this.state.folderId : (this.state.folderValue).map(x => x['value']).join(",")),
    };
    let payload = Object.assign({}, payloadData, obj);
    // console.log(payload, "Payload");
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

  handleQuestionTypeChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ questionTypeValue: value, pageNum: 1 }, () => {
      this.applyFilter({ question_type: data, page_num: 1 });
    });
  };

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



  handleBankInputChange = event => {
    var newOptions = []
    this.state.folderOptionsSelect.map((option) => {
      if (option.label.toLowerCase().indexOf(event.toLowerCase()) >= 0) {
        newOptions.push(option)
      }
    })
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

    this.setState({ 
      folderValue : optionsToAdd,
      bankSearchInputOptions: [], 
      pageNum: 1 }, () => {
      this.applyFilter({ folder_id: data, page_num: 1 });
    });
    
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
    const selected = this.props.allQuesSelected
    if (selected) {
      this.props.actions.deselectAllQuestion({});
    } else {

      this.props.actions.selectAllQuestion({});
    }

  }

  handleTestExcludeChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ testExcludeValue: value, pageNum: 1 }, () => {
      this.applyFilter({ test_exlude_id: data, page_num: 1 });
    });
  };






  handleEmptySelection = () => {
    this.props.actions.emptySelectedQuestion({});
  }


  // On Load
  componentDidMount() {
    api(url, { operation: "read", page_num: this.state.pageNum, page_size: this.state.pageSize.value, folder_name: "allbanks" }).then(response => {
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
        var folderOptionsSelect = []
        folderOptionsSelect = filter.folders


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
            difficultyOptions: filter.difficulty,
            testExcludeOptions: filter.tests_exclude,
            questionTypeOptions: filter.question_type,
            isLiveOptions: filter.is_live,
            isPassageOptions: filter.is_passage,
            testOptions: filter.tests,
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
            addExisting={true}
            ></QuestionCard>
        );
      });
    } else {
      renderBodyElement = loaderArray.map((row, key) => {
        return <QuestionCardLoader key={key} ></QuestionCardLoader>;
      });
    }


    return (
        <div>
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

          <GridColumn medium={4}>
            
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
          </GridColumn>
          <GridColumn medium={1}>
            <SortIconContainer><CheckCircleIcon onClick={this.handleBankSelectAll} className="sortIcon"></CheckCircleIcon></SortIconContainer>
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
          </Grid>
          <Grid spacing="compact">
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
            {renderBodyElement}
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
      </div>

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
