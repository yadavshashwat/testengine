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
import section from "../redux/actions/section";
import authorization from "../redux/actions/authorization";

// Atlaskit Packages
import Select from "@atlaskit/select";

import SearchIcon from "@atlaskit/icon/glyph/search";
import { CheckboxSelect } from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';

import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import Lozenge from "@atlaskit/lozenge";
import { DatePicker } from '@atlaskit/datetime-picker';
import DynamicTable from '@atlaskit/dynamic-table';

//Icons
import ArrowDownCircleIcon from '@atlaskit/icon/glyph/arrow-down-circle';
import ArrowUpCircleIcon from '@atlaskit/icon/glyph/arrow-up-circle';

import pathIcon from "../routing/BreadCrumbIcons"
import Arrow from '@atlaskit/icon/glyph/arrow-right';
// Components
import ContentWrapper from '../components/ContentWrapper';


// Other Packages
import ReactPaginate from 'react-paginate';
import styled from "styled-components";
import Cookies from 'universal-cookie';
var changeCase = require("change-case");

// api url path
var url = "/test/crud_section/";



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

const scheduledOptions = [
  { value: '', label: 'None' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This Week' },
  { value: 'for', label: 'For' },
  { value: 'between', label: 'Between' },
]

const itemOptions = [
  {'value':10,'label':'10 Items/Page'},
  {'value':20,'label':'20 Items/Page'},
  {'value':30,'label':'30 Items/Page'},
  {'value':50,'label':'50 Items/Page'},
  {'value':100,'label':'100 Items/Page'}
]

class AllSections extends Component {
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

      searchIcon: true,

      folderOptions: [],
      testOptions: [],
      isEvalManualOptions: [],
      isCalculatorOptions: [],
      assignedToOptions: [],
      isCompleteOptions: [],
      scheduledOptions: scheduledOptions,

      folderValue: [],
      testValue: [],
      assignedToValue: [],
      isCompleteValue: "",
      scheduledValue: { value: '', label: 'None' },
      scheduledStartValue: '',
      scheduledEndValue: '',
      searchValue: "",
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
      is_complete: this.state.isCompleteValue ? this.state.isCompleteValue.value : "",
      test_id: (this.state.testValue).map(x => x['value']).join(","),
      folder_id: (this.state.folderValue).map(x => x['value']).join(","),
      assigned_ids: (this.state.assignedToValue).map(x => x['value']).join(","),
      to_complete_date_start: (this.state.scheduledStartValue),
      to_complete_date_end: (this.state.scheduledEndValue)
    };
    let payload = Object.assign({}, payloadData, obj);
    // console.log(payload, "Payload");
    api(url, payload)
      .then(response => {
        const { result, status, num_pages, total_records } = response;
        if (status) {
          this.setState({
            data: result,
            loaded: true,
            filteredSections:total_records,
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

  handleSortChange = value => {
    this.setState({ sortValue: value ? value : "", pageNum: 1 }, () => {
      this.applyFilter({ sort_by: value ? value.value : "", page_num: 1 });
    });
  };


  handleTestChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ testValue: value, pageNum: 1 }, () => {
      this.applyFilter({ test_id: data, page_num: 1 });
    });
  };

  handleFolderChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ folderValue: value, pageNum: 1 }, () => {
      this.applyFilter({ folder_id: data, page_num: 1 });
    });
  };

  handleAssignedChange = value => {
    const data = (value).map(x => x['value']).join(",");
    this.setState({ assignedToValue: value, pageNum: 1 }, () => {
      this.applyFilter({ assigned_ids: data, page_num: 1 });
    });
  };

  handleNumItemsChange = value => {
    this.setState({ pageSize: value ? value: "" , pageNum: 1 }, () => {
      this.applyFilter({ page_size: value ? value.value: "" , page_num: 1 });
    });
  }




  handleIsComplete = value => {
    this.setState({ isCompleteValue: value ? value : "", pageNum: 1 }, () => {
      this.applyFilter({ is_complete: value ? value.value : "", page_num: 1 });
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
            this.applyFilter({ to_compelte_date_start: scheduledStartValue, to_complete_date_end: scheduledEndValue, page_num: 1 });
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
          this.applyFilter({ to_complete_date_start: scheduledStartValue, to_complete_date_end: scheduledEndValue, page_num: 1 });
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
          this.applyFilter({ to_complete_date_start: scheduledStartValue, to_complete_date_end: scheduledEndValue, page_num: 1 });
        })
      } else {
        
        this.setState({
          scheduledStartValue: '',
          scheduledEndValue: ''
        }, () => {
          console.log(this.state.scheduledStartValue,this.state.scheduledEndValue)
          this.applyFilter({ to_complete_date_start: '', to_complete_date_end: '', page_num: 1 });
        })
      }
    }else{
      this.setState({
        scheduledStartValue: '',
        scheduledEndValue: ''
      }, () => {
      
        console.log(this.state.scheduledStartValue,this.state.scheduledEndValue)
        this.applyFilter({ to_complete_date_start: '', to_complete_date_end: '', page_num: 1 });
      })
    }

    });
  };


  handleDateChangeStart = value => {
  if (this.state.scheduledValue.value === "for"){
    console.log(value)
    // console.log(value,this.state.scheduledEndValue)
    this.setState({
      scheduledStartValue: value,
      scheduledEndValue: value
    }, () => {
      this.applyFilter({ to_complete_date_start: value ? value : "", to_complete_date_end: value ? value : '', page_num: 1 });  
    });

  }else if(this.state.scheduledValue.value === "between"){
    this.setState({
      scheduledStartValue: value
    }, () => {
      this.applyFilter({ to_complete_date_start: value ? value : "", page_num: 1 });  
  });
  }

  }
    
    
  handleDateChangeEnd = value => {
    if (this.state.scheduledValue.value === "for"){
      this.setState({
        scheduledStartValue: value,
        scheduledEndValue: value
      }, () => {
        this.applyFilter({ scheduled_for_start: value ? value.value : "", scheduled_for_end: value ? value.value : '', page_num: 1 });  
      });
  
    }else if(this.state.scheduledValue.value === "between"){
      this.setState({
        scheduledEndValue: value
      }, () => {
        this.applyFilter({ scheduled_for_end: value ? value.value : "", page_num: 1 });  
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
    const data = event.target.value
    this.setState({ searchValue: data, pageNum: 1 }, () => {
      this.applyFilter({ search: data, page_num: 1 });
    });
  }


  makeLiveOffline = event => {
    const dataId = event.currentTarget.dataset.id;
    const isComplete = event.currentTarget.dataset.complete;
    // console.log(event.currentTarget.dataset)
    api(url, { operation: "complete", section_ids: dataId, is_complete: isComplete==="true" ? '0' : '1' }).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });
      if (status) {
        const sectionList = this.state.data;
        const dataId = result[0].id;
        const index = sectionList.findIndex(x => x.id === dataId);
        console.log(index)
        this.setState({data:
          [...this.state.data.slice(0, index),
            result[0],
          ...this.state.data.slice(index + 1)]
        });

      }

    })
  }



  handleSectionAdd = event => {
    const dataId = event.currentTarget.dataset.id;
    console.log(dataId);
    api(url, { operation: "copy", section_ids: dataId, test_id: this.props.testId}).then(response => {
      const { message, status, result } = response;
      this.props.actions.addFlag({
        message: message,
        appearance: (status ? "normal" : "warning")
      });

      if (status) {
        this.props.actions.addSection({result:result[0],continueSection:false});
      }

    })



  }


  // On Load
  componentDidMount() {
    // var assigned_to = ''
    // if(this.props.loggedIn){
      // assigned_to = this.props.userId
    // }
    

    const cookies = new Cookies();
    const user_id = cookies.get('user_id');

    api(url, { operation: "read", page_num: this.state.pageNum, page_size: this.state.pageSize.value,assigned_ids: user_id }).then(response => {
      const { result, filter, message, status, num_pages, total_records } = response;
      // this.props.actions.addFlag({
      //   message: message,
      //   appearance: (status ? "normal" : "warning")
      // });
      if (status) {
        var user_selected = []
        if(this.props.loggedIn){
          user_selected = [{
            'value':this.props.userId,
            'label':changeCase.titleCase(this.props.userFirstName) + ' ' + changeCase.titleCase(this.props.userLastName)
          }]
        }

        this.setState(
          {
            totalSections: total_records,
            data : result,
            filteredSections : total_records,
            loaded: true,
            numPages: num_pages,
            sortByOptions: filter.sort_by,
            orderByOptions: filter.order_by,
            folderOptions: filter.folders,
            testOptions:filter.tests,
            isEvalManualOptions: filter.is_eval_manual,
            isCalculatorOptions: filter.is_calculator,
            assignedToOptions:filter.assigned_to,
            isCompleteOptions: filter.is_complete,
            assignedToValue:user_selected
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
    width: 80px;
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
          key: "section_name",
          content: "Section",
          width: 20,
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
          key: "to_complete_date",
          content: "Due Date",
          width: 12.5,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "questions",
          content: "#Questions",
          width: 5,
          isSortable: false,
          shouldTruncate: false
        },
        {
          key: "status",
          content: "Status",
          width: 7.5,
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
          content: <Link to={row.path}>{row.name == row.sub_section_name ? row.name : row.name + ' - ' + row.sub_section_name}</Link>
        },
        {
          key: row.id,
          content: <Link to={row.test.path}>{row.test.test_name}</Link>
        },
        {
          key: row.id,
          content: row.to_complete_date
        },
        {
          key: row.id,
          content: row.number_questions
        },
        {
          key: row.id,
          content: row.is_complete === true ? (
            <Lozenge appearance="success">Complete</Lozenge>
          ) : (
              <Lozenge appearance="moved">Pending</Lozenge>
            )
        },
        {
          key: row.id,
          content: <div><b>C:</b> {row.created_at}<br></br><b>M:</b> {row.modified_at}</div>
        },
        {
          key: row.id,
          content:  <DropdownMenu
          trigger="Options"
          triggerType="button"
          shouldFlip={true}
          role="bottom"
        >
          <DropdownItemGroup>
            
            {this.props.testId && (<DropdownItem data-id={row.id} onClick={this.handleSectionAdd.bind(this)}>Add</DropdownItem>)}
            {!this.props.testId && (<Link to={row.path}><DropdownItem>Open</DropdownItem></Link>)}
            {(!this.props.testId && row.test && !row.test.is_live) &&  (
            <DropdownItem
              data-id={row.id} 
              data-complete={row.is_complete}
              onClick={this.makeLiveOffline.bind(this)}
              elemAfter={
                <DropdownStatusItem>
                  <Arrow label="" size="small" />
                  <Lozenge appearance={row.is_complete ? "moved" : "success"}>{row.is_complete ? "Pending" : "Complete"}</Lozenge>
                </DropdownStatusItem>
              }
            >{row.is_complete ? "Mark Pending" : "Mark Complete"}</DropdownItem>
            )}

          </DropdownItemGroup>
        </DropdownMenu>
          
          
        },

      ]
    }
    ));





    return (
      <ContentWrapper>
        { !this.props.testId && (
          <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        )}
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
              <span className="field-label">Tests</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.testOptions}
                placeholder="CAT Mock etc."
                onChange={this.handleTestChange}
                value={this.state.testValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={4}>
            <div className="field-div">
              <span className="field-label">Test Bank</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.folderOptions}
                placeholder="Test Bank 1"
                onChange={this.handleFolderChange}
                value={this.state.folderValue}
              />
            </div>
          </GridColumn>
          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">Complete</span>
              <Select
                className="single-select"
                isClearable
                classNamePrefix="react-select"
                options={this.state.isCompleteOptions}
                placeholder="Yes/No"
                value={this.state.isCompleteValue}
                onChange={this.handleIsComplete}
              />
            </div>
          </GridColumn>
          <GridColumn medium={3}>
            <div className="field-div">
              <span className="field-label">Assigned To</span>
              <CheckboxSelect
                className="checkbox-select"
                classNamePrefix="select"
                options={this.state.assignedToOptions}
                placeholder="John Doe..."
                onChange={this.handleAssignedChange}
                value={this.state.assignedToValue}
              />
            </div>
          </GridColumn>

          <GridColumn medium={2}>
            <div className="field-div">
              <span className="field-label">Completion Date</span>
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
              <div className="question-bank-summary-text">
                  Total Sections : 
                <span className="number-selected">
                  {((this.state.totalSections === this.state.filteredSections) ? this.state.totalSections : this.state.filteredSections + '/' + this.state.totalSections)}
                </span>
              </div>
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
      </ContentWrapper>

    );
  }
}

function mapStateToProps(store) {
  return {
    ...store.section,
    ...store.authorization
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...section,...authorization, ...flag }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AllSections);
