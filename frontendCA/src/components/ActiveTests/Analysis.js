// React
import React, { Component } from 'react';
import PropTypes from "prop-types";
// Styles
// import "../css/dashboard.css"
import "../../css/dashboard.css"
// Backend Connection
import { api } from "../../helpers/api";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../../redux/actions/flag";
import coursetest from "../../redux/actions/coursetest";
// Atlaskit Packages

import Tabs from '@atlaskit/tabs';
import Button from '@atlaskit/button';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { Grid, GridColumn } from '@atlaskit/page';
import DropdownMenu, { DropdownItemGroup, DropdownItem } from '@atlaskit/dropdown-menu';
import Lozenge from "@atlaskit/lozenge";
import Tag from '@atlaskit/tag';
import EditorDoneIcon from '@atlaskit/icon/glyph/editor/done';
import CrossIcon from '@atlaskit/icon/glyph/cross';
import StarIcon from '@atlaskit/icon/glyph/star';
import StarFilledIcon from '@atlaskit/icon/glyph/star-filled';

import EmojiFlagsIcon from '@atlaskit/icon/glyph/emoji/flags';

//Icons


// Components
import Cookies from 'universal-cookie';
// Other Packages
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemButton
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/fancy-example.css';
import styled from "styled-components";
import Checkbox from 'react-simple-checkbox';
import Parser from "html-react-parser";
import Chart from "react-google-charts";
import Timer from "react-compound-timer";
import TextArea from '@atlaskit/textarea';

var changeCase = require("change-case");
// var CanvasJSReact = require('../canvasjs.react');
// var CanvasJS = CanvasJSReact.CanvasJS;
// var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const url_test = "/usertest/validate/";

// api url path

function toLetters(num) {
  var mod = num % 26,
      pow = num / 26 | 0,
      out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z');
  return pow ? toLetters(pow) + out : out;
}


var permArr = [],
  usedChars = [];
function permute(input) {
  var i, ch;
  for (i = 0; i < input.length; i++) {
    ch = input.splice(i, 1)[0];
    usedChars.push(ch);
    if (input.length == 0) {
      permArr.push(usedChars.slice());
    }
    permute(input);
    input.splice(i, 0, ch);
    usedChars.pop();
  }
  return permArr
};



class Instructions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      report:[],
      max_accuracy : 0,
      max_efficiency : 0,
      feedbackModalOpen:false,
      feedback: '',
      selected: 0

    };
  }

 
  handleBookmarkAdd = (dataid,isMarked) => {
    console.log(isMarked,dataid)
    api('/usertest/bookmark_question/', { question_id : dataid,
                        is_marked: isMarked ? '0' : '1'
            }).then(response => {
      const { result, status } = response;
      if (status) {
        this.props.actions.updateCourseTestQuestion({
          dataID:dataid
        })      
      }});
    
  };

  handleFeedbackChange = event => {
    this.setState({ feedback: event.currentTarget.value });
  };




  handleOpenFeedbackModal = (dataid) => {
    this.setState({
      feedbackModalOpen : true,
      activeQuestionId:dataid,
      feedback: ''
    })
  };

  handleCloseFeedbackModal = (dataid) => {
    this.setState({
      feedbackModalOpen : false,
      activeQuestionId:'',
      feedback: ''
    })
  };

  handleSubmitFeedback = () =>{
    api('/usertest/share_question_feedback/', {
        question_id : this.state.activeQuestionId,
        feedback    : this.state.feedback
      }).then(response => {
        const { message, status } = response;
        this.props.actions.addFlag({
          message: message,
          appearance: (status ? "normal" : "warning")
        });
        if(status){
          this.handleCloseFeedbackModal()
        }
    })};

  


  componentDidMount() {
    api('/usertest/report_activetest/', { 
                  test_id: this.props.individualCourseTest.id
            }).then(response => {
      const { result, status } = response;
      if (status) {
        this.setState({
          report:result.topicreport,
          max_accuracy: result.max_accuracy * 1.2,
          max_efficiency: result.max_efficiency * 1.2
        })

      }
    });
  }

  handleUpdate = (selected) => {
    console.log(selected)
    var index = 0 ;
    if (selected.label == 'Overall Report'){
      index = 0
    }else if(selected.label == 'Sectional Report'){
      index = 1
    }else if(selected.label == 'Topic Report'){
      index = 2
    }else if(selected.label == 'Solution'){
      index = 3
    }else if(selected.label == 'Bookmarks'){
      index = 4
    }else{
      index = 0
    }
    // const index = tabs.find
    this.setState({ selected:index })
  };

  render() {

    const test = this.props.individualCourseTest;
    const sections = this.props.individualCourseSection;

    const dataPieOverallQuestion = [
      ["Question Type", "Number"],
      ["Correct", test.total_correct],
      ["Incorrect", test.total_incorrect],
      ["Unattempted", test.total_unattempted]
    ];
    const optionsOverallQuestions = {
      title: "Question Attempt Summary",
      pieHole: 0.5,
      is3D: false
    };

    var dataLineChartOverall = null;
    if (test.percentile_table){
      dataLineChartOverall = test.percentile_table.map((row,key) => {
        if (key == 0){
          return ['Percentile','Marks']
        }else{
          return [parseFloat(row['percentile']), parseFloat(row['marks'])]
        }
      });
    }
    
    
    // [
    //   ["Percentile", "Marks"],
    //   ["0%", 10],
    //   ["10%", 20],
    //   ["20%", 30],
    //   ["100%", 100]
    // ];
    const optionsLineChartOverall = {
      title: "Overall Percentile Table",
      curveType: "function",
      legend: { position: "bottom" }
    };



    var renderOverall = <div className="analysis-tab-divs">
                            <div>
                              <div className="analysis-name">
                                Overall Report
                              </div>
                              <div className="analysis-table-div">
                                <table className="analysis-table">
                                  <tbody>
                                  <tr>
                                    <td className="table-description-name">
                                      Marks
                                    </td>
                                    <td className="table-description-detail">
                                      {test.score}/{test.max_score}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="table-description-name">
                                      Percentile 
                                    </td>
                                    <td className="table-description-detail">
                                      {test.percentile}
                                    </td>
                                  </tr>
                                  <tr>
                                      <td>
                                        Total Questions
                                      </td>
                                      <td>
                                        {test.total_questions}
                                      </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      Attempted Questions
                                    </td>
                                    <td>
                                    {test.total_correct + test.total_incorrect}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      Correct Questions
                                    </td>
                                    <td>
                                    {test.total_correct}
                                    </td>
                                  </tr>                                
                                  <tr>
                                    <td className="table-description-name">
                                      Total Time Taken
                                    </td>
                                    <td className="table-description-detail">
                                    <Timer 
                                      initialTime={test.time_elapsed * 1000}
                                      startImmediately={false}
                                      >
                                        <React.Fragment>
                                            <div>
                                                <Timer.Hours /> Hrs <Timer.Minutes /> Mins <Timer.Seconds /> Secs
                                            </div>
                                        </React.Fragment>
                                    </Timer>  
                                    </td>
                                  </tr>
                                  {test.cut_off_exam && (
                                  <tr>
                                  <td className="table-description-name">
                                    Overall Cut Off
                                  </td>
                                  <td className="table-description-detail">
                                    {test.cut_off_cleared ? 'Cleared' : 'Not Clear'} ({test.cut_off_exam}Marks)
                                  </td>
                                </tr>                                  
                                  )}
                                  </tbody>
                                </table>
                              </div>
                            </div> 
                            <Grid>
                              <GridColumn medium={6}>
                                <div className="pie-chart-div">
                                  <div className="pie-chart">
                                  <Chart
                                  chartType="PieChart"
                                  width="100%"
                                  height="400px"
                                  data={dataPieOverallQuestion}
                                  options={optionsOverallQuestions}
                                  />
                                  </div>   
                                </div>
                              </GridColumn>
                              {test.percentile_table && (
                                <GridColumn medium={6}>
                                <div className="pie-chart-div">
                                  <div className="pie-chart">
                                  <Chart
                                  chartType="LineChart"
                                  width="100%"
                                  height="400px"
                                  data={dataLineChartOverall}
                                  options={optionsLineChartOverall}
                                  />
                                  </div>   
                                </div>
                                </GridColumn>
                              )}
                              {!test.percentile_table && ( 
                                <GridColumn medium={6}></GridColumn>
                              )}
                            </Grid> 
                        </div>


    

    var sectionTable = sections.map((row) => {
                return <tr>
                        <td className='section-table-section-name'>
                          {row.name}
                        </td>
                        <td>
                          {row.total_correct + row.total_incorrect}/{row.total_questions}
                        </td>
                        <td>
                          {row.total_correct} ( {Math.ceil(row.total_correct/row.total_questions * 100)}% )
                        </td>
                        <td>
                          {row.total_incorrect} ( {Math.ceil(row.total_incorrect/row.total_questions * 100)}% )
                        </td>
                        <td>
                          {row.score}/{row.max_score}
                        </td>
                        <td>
                          {row.percentile}
                        </td>
                        <td>
                          <Timer 
                              initialTime={row.time_elapsed * 1000}
                              startImmediately={false}
                          >
                              <React.Fragment>
                                  <div>
                                      <Timer.Hours /> Hrs <Timer.Minutes /> Mins <Timer.Seconds /> Secs
                                  </div>
                              </React.Fragment>
                          </Timer>  
                        </td>
                        <td>
                          {row.cut_off_exam && (
                            row.cut_off_cleared ? 'Cleared (Marks:' + row.cut_off_exam + ')' : 'Not Clear (Marks:' + row.cut_off_exam + ')'
                          )}
                        </td>
                      </tr>
                    });
    var sectionDiffTable = sections.map((row) => {
      return          <tr>
                        <td className='section-table-section-name'>
                          {row.name}
                        </td>
                        <td>
                          {(row.easy_correct + row.easy_incorrect) > 0 ? Math.ceil(row.easy_correct/(row.easy_correct + row.easy_incorrect) * 100) + '%' : "NA"}
                        </td>
                        <td>
                            {row.easy_time_spent > 0 ? Math.ceil((row.easy_correct_time_spent/row.easy_time_spent) * 100) + '%' : 'NA'}                
                        </td>
                        <td>
                          {(row.medium_correct + row.medium_incorrect) > 0 ? Math.ceil(row.medium_correct/(row.medium_correct + row.medium_incorrect)  * 100) + '%' : "NA"}
                        </td>
                        <td>
                          {row.medium_time_spent > 0 ? Math.ceil((row.medium_correct_time_spent/row.medium_time_spent) * 100) + '%' : 'NA'}                          
                        </td>
                        <td>
                          {(row.hard_correct + row.hard_incorrect) > 0 ? Math.ceil(row.hard_correct/(row.hard_correct + row.hard_incorrect)  * 100) + '%' : "NA"}
                        </td>
                        <td>
                            {row.hard_time_spent > 0 ? Math.ceil((row.hard_correct_time_spent/row.hard_time_spent) * 100) + '%' : 'NA'}                                                  
                        </td>
                      </tr>

    });

    const dataBarcharts = sections.map((row) =>{
      return [
        ["Type", "Marks", { role: "style" }],
        ["Test", row.score, "#b87333"], // RGB value
        ["Average", row.average_marks, "silver"], // English color name
        ["Max", row.highest_marks, "gold"],
      ];
    }); 

    const dataLineChartSection = sections.map((row,key) => {
      if (row.percentile_table){
        return row.percentile_table.map((row2,key2) => {
          if (key2 == 0){
            return ['Percentile','Marks']
          }else{
            return [parseFloat(row2['percentile']), parseFloat(row2['marks'])]
          }
        });
      }else{
        []
      }
    });

    var sectionGraphs = sections.map((row,key) => {
      var optionsLineChartSection = {
        title: row.name + " Percentile Table",
        curveType: "function",
        legend: { position: "bottom" }
      };
  
      return <Grid>
          <GridColumn medium = {12}>
            <div className="section-graph-name">
              {row.name}
            </div>
          </GridColumn>
          <GridColumn medium = {6}>
            <div className="section-bar-graph">
                <Chart
                chartType="ColumnChart"
                width="100%"
                height="400px"
                data={dataBarcharts[key]}
              />
            </div>
          </GridColumn>
          
          {row.percentile_table && (
          <GridColumn medium = {6}>
          <div className="section-line-graph">
          <Chart
            chartType="LineChart"
            width="100%"
            height="400px"
            data={dataLineChartSection[key]}
            options={optionsLineChartSection}
            />
          </div>
        </GridColumn>
        )}
        {!row.percentile_table && (
          <GridColumn medium = {6}></GridColumn>
        )}
        </Grid>
    });

    let sectionQuestionReport = null;

    sectionQuestionReport = sections.map((sec,alfa) => {
        return <tr className="section-row">
                <td className="section-name">
                  {sec.sub_section_name}
                </td>
                <td className="section-questions">
                {
                  sec.questions.map((row,key) => { 
                    return <div className={row.status == "answered" ? row.is_correct ? "question-number-correct" : "question-number-incorrect" : "question-number-unattempted"}>
                    {key + 1}
                  </div>
                  })
                }
                </td>
              </tr>
    });



    var renderSectional = <div className="analysis-tab-divs">
                            <div>
                              <div className="analysis-name">
                                Sectional Report
                              </div>
                              <div className="section-analysis-table-div">
                                <table className="section-analysis-table">
                                    <tbody>
                                    <tr className="section-table-header">
                                      <td>
                                        Section Name
                                      </td>
                                      <td>
                                        Attempt
                                      </td>
                                      <td>
                                        Correct
                                      </td>
                                      <td>
                                        Incorrect
                                      </td>
                                      <td>
                                        Score
                                      </td>
                                      <td>
                                        Percentile
                                      </td>
                                      <td>
                                        Total Time
                                      </td>
                                      <td>
                                        Cut Off
                                      </td>
                                    </tr>      
                                      {sectionTable}
                                    </tbody>  
                                </table>
                              </div>
                              <br></br>
                              <br></br>
                              <div className="question-diff-analysis">
                                <table className="section-analysis-table">
                                  <tbody>
                                    <tr className="section-table-header">
                                      <td rowSpan={2}>
                                        Section Name
                                      </td>
                                      <td colSpan={2}>
                                        Easy Difficulty Question
                                      </td>
                                      <td colSpan={2}>
                                        Moderate Difficulty Question
                                      </td>
                                      <td colSpan={2}>
                                        Tough Question
                                      </td>
                                    </tr>   
                                    <tr className="section-table-header">
                                      <td colSpan={1}>
                                        Accuracy
                                      </td>
                                      <td colSpan={1}>
                                        Efficiency
                                      </td>
                                      <td colSpan={1}>
                                        Accuracy
                                      </td>
                                      <td colSpan={1}>
                                        Efficiency
                                      </td>
                                      <td colSpan={1}>
                                        Accuracy
                                      </td>
                                      <td colSpan={1}>
                                        Efficiency
                                      </td>
                                    </tr>   
                                    {sectionDiffTable}   
                                  </tbody>                                
                                </table>
                                Efficiency is total time taken on correct answer to total time taken
                              </div>
                              <br></br>
                              <br></br>

                              <table className="section-question-report">
                                {sectionQuestionReport}
                              </table>
                              <table className="section-question-report">
                                <tr>
                                  <td className="question-number-correct">Correct</td>
                                  <td className="question-number-incorrect">Incorrect</td>
                                  <td className="question-number-unattempted">Unattempted</td> 
                                </tr>
                              </table>
                              <br></br>
                              <br></br>
                              <div className="section-graphs">
                                {sectionGraphs}
                              </div>
                            </div>
                          </div>


    // let renderTopic = null;
    var topicReportData = this.state.report.map((row,key) => {
         return ([row.question_sub_category,Math.ceil(parseFloat(row.accuracy) * 100),parseFloat(row.avg_time),row.question_category,100])
     })





     var topicReportDiv = this.state.report.map((row,key) => {
      return <tr>
              <td>
                {row.question_category}
              </td>
              <td>
                {row.question_sub_category}
              </td>
              <td>
                {row.accuracy * 100 + "%"}
              </td>
              <td>
              <Timer 
                initialTime={row.avg_time * 1000}
                startImmediately={false}
                >
                  <React.Fragment>
                      <div>
                          <Timer.Minutes /> Mins <Timer.Seconds /> Secs
                      </div>
                  </React.Fragment>
              </Timer>  
                
              </td>
            </tr>
  })

    //  console.log([...[['Sub Category','Accuracy','Avg. Time/Ques','Category','S']],...topicReportData])
    // var topicGraph = 
    var renderTopic = <div>
                          <div className="analysis-name">
                            Topic Report
                          </div>
                          <div className="analysis-table-div">
                          <Chart
                        width={'1000px'}
                        height={'500px'}
                        chartType="BubbleChart"
                        loader={<div>Loading Chart</div>}
                        data={[...[['Sub Category','Accuracy','Avg. Time/Ques','Category','S']],...topicReportData]}
                        options={{
                          title:'Accuracy vs. Avg time in topics',
                          hAxis: { title: 'Accuracy (%Correct)',minValue:0, maxValue:(this.state.max_accuracy *100 )},
                          vAxis: { title: 'Avg Time (Secs)',minValue:0, maxValue: (this.state.max_efficiency )},
                          bubble: { textStyle: { fontSize: 11 } }
                        }}
                        rootProps={{ 'data-testid': '1' }}
                        />
                        </div>
                        <div  className="analysis-table-div">
                          <table className="analysis-table-topic">
                            <tr>
                              
                                <th>Category</th>
                                <th>Topic</th>
                                <th>Accuracy</th>
                                <th>Average Time/Question</th>
                            </tr>
                            {topicReportDiv}
                          </table>
                        </div>
                    </div>
    // var renderSolution = <div>Solution</div>
    let renderBookmarks = null;
    renderBookmarks = sections.map((sec,alfa) => {
      return <div>
                { alfa == 0 && (
                <div className="analysis-name">
                Bookmarked Questions 
              </div>

                )}
                
                { sec.questions.filter(idx => idx.is_marked == true).length > 0 && (
                  <div className="paper-section-name">Section Name : {sec.sub_section_name}</div>
                )}
                {
                  sec.questions.map((row,key) => {
                    if(row.is_marked){
                      if (['mcq_single','mcq_multiple','chooseorder'].indexOf(row.question_type.value) >=0){
                        var response = row.response;
                        var correct_answer = row.correct_answer;
                        var output_response = ""
                        var output_correct = []
                        if (row.question_type.value == "mcq_single"){
                          if(response){
                            output_response = toLetters(response.answer)
                          }
                          if(correct_answer){
                            output_correct = toLetters(correct_answer.answer)
                          }
  
                        }else{
                          if(response){
                            output_response = response.answer.map((row) => {
                              return toLetters(row)
                            })
                          }
  
                          if(correct_answer){
                            output_correct = correct_answer.answer.map((row) => {
                              return toLetters(row)
                            })
                          }
  
                        }
  
                        return <div key={key} className="question-div-paper">
                                  
                                  { row.is_passage && (
                                    <div className="passage-details">
                                      <div className="passage-header"><b> Passage :</b></div>
                                      <div className="passage-header">
                                      {Parser(row.passage.passage)}
                                      </div>
                                    </div>
                                  )}
                                <div className="question-details"><b>Type:&nbsp;</b> {row.question_type.label} &nbsp;&nbsp; | &nbsp; &nbsp; <b>Marks:&nbsp;</b>  +{row.positive_marks}/-{row.negative_marks} &nbsp;&nbsp;| &nbsp; &nbsp; <b>Topic:&nbsp;</b> {row.topic.category ? changeCase.titleCase(row.topic.category) + ' > ' + changeCase.titleCase(row.topic.sub_category) : ''}  &nbsp; &nbsp;| &nbsp; &nbsp; <b>Time Spent:&nbsp;</b>                                     
                                        <Timer 
                                        initialTime={row.time_spent * 1000}
                                        startImmediately={false}
                                        >
                                          <React.Fragment>
                                              <div>
                                                  <Timer.Minutes /> Mins <Timer.Seconds /> Secs
                                              </div>
                                          </React.Fragment>
                                      </Timer>  
                                  </div>
                                  <div className="question-paper-text"><div className="question-paper-number">{key + 1}.&nbsp; </div> <div className="question-paper-question-text">{Parser(row.question_text)}</div></div>
                                  <div className="question-paper-options">
                                  {
                                    row.answer_options.options.map((qs,key2) => {
                                      return <div className="question-paper-option">{toLetters(key2 + 1)}.&nbsp;{Parser(qs.value)}</div>
                                    })
                                  }
                                  </div>
                                  { row.status == "answered" && (
                                <div className="question-paper-text">
                                    <div className="question-status-solution-solution">Status : &nbsp;<div className={row.is_correct ? "correct-answer" : "incorrect-answer"}>{row.is_correct ? "Correct" : "Incorrect"}</div> {row.is_correct ? <EditorDoneIcon size="large" primaryColor="#50c878"/> : <CrossIcon  size="large" primaryColor="#ff0012"/>} </div>
                                </div>
                                )}
                                { row.status != "answered" && (
                                <div className="question-paper-text">
                                    <div className="question-status-solution-solution">Status : &nbsp;<div className="unanswered-answer">Unanswered</div></div>
                                </div>
                                )}
                                
                                  {row.status == "answered" && (
                                    <div className="question-paper-text">
                                      <b>
                                      {row.is_correct ? "Answer : " : "Given Answer : "}  {row.response ? (row.question_type.value == "mcq_single" ? output_response : output_response.join(', ')) : ""}
                                      </b>
                                    </div>
                                  )}

                                  {!row.is_correct && (
                                  <div className="question-paper-text">
                                      <b>Answer :  {row.correct_answer ? (row.question_type.value == "mcq_single" ? output_correct : output_correct.join(', ')) : ""}</b>
                                  </div>
  
                                  )}
  
                                  <div className="solution">
                                  <Accordion
                                  allowZeroExpanded
                                  >
                                    <AccordionItem>
                                        <AccordionItemHeading>
                                            <AccordionItemButton>
                                                View Solution
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel>
                                            {Parser(row.solution)}
                                        </AccordionItemPanel>
                                    </AccordionItem>
                                </Accordion>
                                  
                                  </div>
                                  <hr></hr>
                              </div>
                      }else{
                        return <div key={key}  className="question-div-paper">
                                  
                                  { row.is_passage && (
                                    <div className="passage-details">
                                      <div className="passage-header"><b> Passage :</b></div>
                                      <div className="passage-header">
                                      {Parser(row.passage.passage)}
                                      </div>
                                    </div>
                                  )}
                                  <div className="question-details"><b>Type:&nbsp;</b> {row.question_type.label} &nbsp;&nbsp; | &nbsp; &nbsp; <b>Marks:&nbsp;</b>  +{row.positive_marks}/-{row.negative_marks} &nbsp;&nbsp;| &nbsp; &nbsp; <b>Topic:&nbsp;</b> {row.topic.category ? changeCase.titleCase(row.topic.category) + ' > ' + changeCase.titleCase(row.topic.sub_category) : ''}  &nbsp; &nbsp;| &nbsp; &nbsp; <b>Time Spent:&nbsp;</b>                                     
                                        <Timer 
                                        initialTime={row.time_spent * 1000}
                                        startImmediately={false}
                                        >
                                          <React.Fragment>
                                              <div>
                                                  <Timer.Minutes /> Mins <Timer.Seconds /> Secs
                                              </div>
                                          </React.Fragment>
                                      </Timer>  
                                  </div>
                                  <div className="question-paper-text"><div className="question-paper-number">{key + 1}. </div> <div className="question-paper-question-text">{Parser(row.question_text)}</div></div>
                                  
                                  { row.status == "answered" && (
                                <div className="question-paper-text">
                                    <div className="question-status-solution">Status : &nbsp;<div className={row.is_correct ? "correct-answer" : "incorrect-answer"}>{row.is_correct ? "Correct" : "Incorrect"}</div> {row.is_correct ? <EditorDoneIcon size="large" primaryColor="#50c878"/> : <CrossIcon  size="large" primaryColor="#ff0012"/>} </div>
                                </div>
                                )}
                                { row.status != "answered" && (
                                <div className="question-paper-text">
                                    <div className="question-status-solution">Status : &nbsp;<div className="unanswered-answer">Unanswered</div></div>
                                </div>
                                )}
                                


                                  {row.status == "answered" && (
                                  <div className="question-paper-text">
                                      <b>{row.is_correct ? "Answer : " : "Given Answer : "}  {row.response ? row.response.answer : ""}</b>
                                  </div>
                                  )};
                                  {!row.is_correct && (
                                  <div className="question-paper-text">
                                      <b>Answer :  {row.correct_answer ? row.correct_answer.answer : "" }</b>
                                  </div>
  
                                  )}
                                  <div className="solution">
                                  <Accordion
                                  allowZeroExpanded
                                  >
                                    <AccordionItem>
                                        <AccordionItemHeading>
                                            <AccordionItemButton>
                                                View Solution
                                            </AccordionItemButton>
                                        </AccordionItemHeading>
                                        <AccordionItemPanel>
                                            {Parser(row.solution)}
                                        </AccordionItemPanel>
                                    </AccordionItem>
                                </Accordion>
                                  
                                  </div>
                                  <hr></hr>
                              </div>
                      }
  
                    }
                  })
                }
            </div>
    });

    var renderFeedback = <div>Feedback</div>


    let sectionListSol= sections.map((sec,alfa) => {
      return <a href={'#' + sec.sub_section_name.replace(" ", "_")}><div className="section-name-solution-header">
                    {sec.sub_section_name}
                </div></a> 
    });

    let renderSolution = null;
    // console.log(questionList)
    renderSolution = sections.map((sec,alfa) => {
      return <div>
                { alfa == 0 && (
                <div className="analysis-name">
                  Solutions
                </div>
                )}
                { alfa == 0 && (
                <div className="section-list-sol">
                  {sectionListSol}
                </div>
                )}
                <div id={sec.sub_section_name.replace(" ", "_")} className="paper-section-name">Section Name : {sec.sub_section_name}</div>
                {
                  sec.questions.map((row,key) => {
                    if (['mcq_single','mcq_multiple','chooseorder'].indexOf(row.question_type.value) >=0){
                      var response = row.response;
                      var correct_answer = row.correct_answer;
                      var output_response = ""
                      var output_correct = []
                      if (row.question_type.value == "mcq_single"){
                        if(response){
                          output_response = toLetters(response.answer)
                        }
                        if(correct_answer){
                          output_correct = toLetters(correct_answer.answer)
                        }

                      }else{
                        if(response){
                          output_response = response.answer.map((row) => {
                            return toLetters(row)
                          })
                        }

                        if(correct_answer){
                          output_correct = correct_answer.answer.map((row) => {
                            return toLetters(row)
                          })
                        }

                      }
                      // console.log(output_response)
                      // console.log(output_correct)

                      return <div key={key} className="question-div-paper">
                                
                                { row.is_passage && (
                                  <div className="passage-details">
                                    <div className="passage-header"><b> Passage :</b></div>
                                    <div className="passage-header">
                                    {Parser(row.passage.passage)}
                                    </div>
                                  </div>
                                )}
                              <div className="question-details"><b>Type:&nbsp;</b> {row.question_type.label} &nbsp;&nbsp; | &nbsp; &nbsp; <b>Marks:&nbsp;</b>  +{row.positive_marks}/-{row.negative_marks} &nbsp;&nbsp;| &nbsp; &nbsp; <b>Topic:&nbsp;</b> {row.topic.category ? changeCase.titleCase(row.topic.category) + ' > ' + changeCase.titleCase(row.topic.sub_category) : ''}  &nbsp; &nbsp;| &nbsp; &nbsp; <b>Time Spent:&nbsp;</b>                                     
                                      <Timer 
                                      initialTime={row.time_spent * 1000}
                                      startImmediately={false}
                                      >
                                        <React.Fragment>
                                            <div>
                                                <Timer.Minutes /> Mins <Timer.Seconds /> Secs
                                            </div>
                                        </React.Fragment>
                                    </Timer>  
                                </div>
                                <div className="question-paper-text"><div className="question-paper-number">{key + 1}.&nbsp; </div> <div className="question-paper-question-text">{Parser(row.question_text)}</div></div>
                                <div className="question-paper-options">
                                {
                                  row.answer_options.options.map((qs,key2) => {
                                    return <div className="question-paper-option">{toLetters(key2 + 1)}.&nbsp;{Parser(qs.value)}</div>
                                  })
                                }
                                </div>
                                { row.status == "answered" && (
                                <div className="question-paper-text">
                                    <div className="question-status-solution">Status : &nbsp;<div className={row.is_correct ? "correct-answer" : "incorrect-answer"}>{row.is_correct ? "Correct" : "Incorrect"}</div> {row.is_correct ? <EditorDoneIcon size="large" primaryColor="#50c878"/> : <CrossIcon  size="large" primaryColor="#ff0012"/>} </div>
                                </div>
                                )}
                                { row.status != "answered" && (
                                <div className="question-paper-text">
                                    <div className="question-status-solution">Status : &nbsp;<div className="unanswered-answer">Unanswered</div></div>
                                </div>
                                )}
                                

                                { row.status == "answered" && (
                                <div className="question-paper-text">
                                  <b>{row.is_correct ? "Answer : " : "Given Answer : "}  {row.response ? (row.question_type.value == "mcq_single" ? output_response : output_response.join(', ')) : ""} </b>
                                </div>
                                )}
                                {(!row.is_correct || row.status != "answered") && (
                                <div className="question-paper-text">
                                    <b>Answer :  {row.correct_answer ? (row.question_type.value == "mcq_single" ? output_correct : output_correct.join(', ')) : ""}</b>
                                </div>

                                )}

                                <div className="solution">
                                <Accordion
                                allowZeroExpanded
                                >
                                  <AccordionItem>
                                      <AccordionItemHeading>
                                          <AccordionItemButton>
                                              View Solution
                                          </AccordionItemButton>
                                      </AccordionItemHeading>
                                      <AccordionItemPanel>
                                          {Parser(row.solution)}
                                      </AccordionItemPanel>
                                  </AccordionItem>
                              </Accordion>
                                
                                </div>
                                <div className="bookmark-question">
                                <Button className="bookmark-button" onClick={event => this.handleBookmarkAdd(row.id,row.is_marked)} appearance={row.is_marked ? "normal" : "primary" }>
                                  {row.is_marked ? <StarFilledIcon size="small"/> : <StarIcon size="small"/>}
                                  {row.is_marked ? 'Remove Bookmark' : 'Bookmark'}
                                </Button>                               
                                <Button   onClick={event => this.handleOpenFeedbackModal(row.id)} className="bookmark-button" appearance="primary">
                                   <EmojiFlagsIcon size="small"/> Share question feedback
                                </Button>                               
                                 </div>
                                <hr></hr>
                            </div>
                    }else{
                      return <div key={key}  className="question-div-paper">
                                
                                { row.is_passage && (
                                  <div className="passage-details">
                                    <div className="passage-header"><b> Passage :</b></div>
                                    <div className="passage-header">
                                    {Parser(row.passage.passage)}
                                    </div>
                                  </div>
                                )}
                                <div className="question-details"><b>Type:&nbsp;</b> {row.question_type.label} &nbsp;&nbsp; | &nbsp; &nbsp; <b>Marks:&nbsp;</b>  +{row.positive_marks}/-{row.negative_marks} &nbsp;&nbsp;| &nbsp; &nbsp; <b>Topic:&nbsp;</b> {row.topic.category ? changeCase.titleCase(row.topic.category) + ' > ' + changeCase.titleCase(row.topic.sub_category) : ''}  &nbsp; &nbsp;| &nbsp; &nbsp; <b>Time Spent:&nbsp;</b>                                     
                                      <Timer 
                                      initialTime={row.time_spent * 1000}
                                      startImmediately={false}
                                      >
                                        <React.Fragment>
                                            <div>
                                                <Timer.Minutes /> Mins <Timer.Seconds /> Secs
                                            </div>
                                        </React.Fragment>
                                    </Timer>  
                                </div>
                                <div className="question-paper-text"><div className="question-paper-number">{key + 1}. </div> <div className="question-paper-question-text">{Parser(row.question_text)}</div></div>
                                
                                { row.status == "answered" && (
                                <div className="question-paper-text">
                                    <div className="question-status-solution">Status : &nbsp;<div className={row.is_correct ? "correct-answer" : "incorrect-answer"}>{row.is_correct ? "Correct" : "Incorrect"}</div> {row.is_correct ? <EditorDoneIcon size="large" primaryColor="#50c878"/> : <CrossIcon  size="large" primaryColor="#ff0012"/>} </div>
                                </div>
                                )}
                                { row.status != "answered" && (
                                <div className="question-paper-text">
                                    <div className="question-status-solution">Status : &nbsp;<div className="unanswered-answer">Unanswered</div></div>
                                </div>
                                )}
                                
                                { row.status == "answered" && (
                                <div className="question-paper-text">
                                    <b>{row.is_correct ? "Answer : " : "Given Answer : "}  {row.response ? Parser(row.response.answer) : ""}</b>
                                </div>
                                )}
                                {(!row.is_correct || row.status != "answered") && (
                                <div className="question-paper-text">
                                    <b>Answer :  {row.correct_answer ? row.correct_answer.answer : "" }</b>
                                </div>

                                )}
                                <div className="solution">
                                <Accordion
                                allowZeroExpanded
                                >
                                  <AccordionItem>
                                      <AccordionItemHeading>
                                          <AccordionItemButton>
                                              View Solution
                                          </AccordionItemButton>
                                      </AccordionItemHeading>
                                      <AccordionItemPanel>
                                          {Parser(row.solution)}
                                      </AccordionItemPanel>
                                  </AccordionItem>
                              </Accordion>
                                
                                </div>
                                <hr></hr>
                            </div>
                    }
                  })
                }
            </div>
    });



    const tabs = [
      { label: 'Overall Report', content: renderOverall },
      { label: 'Sectional Report', content: renderSectional },
      { label: 'Topic Report', content: renderTopic },
      { label: 'Solution', content: <div className="solutions-page">{renderSolution}</div> },
      { label: 'Bookmarks', content: <div className="bookmarks-page">{renderBookmarks}</div>},
      // { label: 'Feedback', content: renderFeedback },
    ];
    
      return (
            <div>
                <div className="analysis-test-name">
                    {this.props.individualCourseTest ? this.props.individualCourseTest.test_name : ""}
                </div>
                
                <div className="analysis-test-tabs">
                  <Tabs
                    // onSelect={(tab, index) => console.log('Selected Tab', index + 1)}
                    onSelect={this.handleUpdate}
                    selected={this.state.selected}
                    tabs={tabs}
                  />
                </div>
                <ModalTransition>
                  {this.state.feedbackModalOpen && (
                  <Modal autoFocus={false} actions={
                    [
                      { text: 'Confirm', appearance: 'primary', onClick: this.handleSubmitFeedback },
                      { text: 'Close', appearance: 'normal', onClick: this.handleCloseFeedbackModal }
                    ]
                  } onClose={this.handleCloseFeedbackModal} heading={"Share question feedback"}>
                    

                      <TextArea
                        value={this.state.feedback}
                        onChange={this.handleFeedbackChange}
                        margin="normal"
                      />



                  </Modal>
                )}
              </ModalTransition>

      
          </div>
      )
    }
}


function mapStateToProps(store) {
  return {
    ...store.coursetest
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...coursetest, ...flag }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Instructions);
