// React
import React, { Component } from 'react';
import { Link } from 'react-router';
// Styles
import "../../css/dashboard.css"

// Backend Connection
import { api } from "../../helpers/api";
// Redux 
import { connect } from "react-redux";

// Redux dispatch
import { bindActionCreators } from "redux";
import flag from "../../redux/actions/flag";
import section from "../../redux/actions/section";

// Components
import ContentWrapper from '../ContentWrapper';
import SectionCard from "../Test/SectionCard"
// Other Packages

import styled from "styled-components";


// api url path
var url_section = "/test/crud_section/";


class SectionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assignedToOptions : []

    };
  }
  // On Load
  componentDidMount() {

    var Path = window.location.pathname.split("/")
    var testNamePath = null;
    testNamePath = decodeURIComponent(Path[5])
    api(url_section, {
      operation: "read",
      test_name:testNamePath
    })
    .then(response => {
      const { result, message, filter, status,total_records } = response;
      // this.props.actions.addFlag({
      //   message: message,
      //   appearance: (status ? "normal" :  "warning")
      // });    
      if (status){
            this.props.actions.setSectionList({
              sectionlist:result,
              totalSections:total_records,
              setTotal:true
            });

            this.setState({
              assignedToOptions:filter.assigned_to,
              percentileOptions:filter.percentileOptions
            })
      }
    })
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

  

    let renderSectionElement = null;
    renderSectionElement = this.props.sectionlist.map((row,key) => {
        return <SectionCard key={key} data={row}
               testData={this.props.testData}
               assignedToOptions={this.state.assignedToOptions}
               percentileOptions={this.state.percentileOptions}
                ></SectionCard>
    })

    return (
      <ContentWrapper>
            {renderSectionElement}
      </ContentWrapper>

    );
  }
}

function mapStateToProps(store) {
  return {
    ...store.section
  };
}


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({...section, ...flag }, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionList);
