// React
import React, { Component } from 'react';

// Styles
// import "../css/dashboard.css"
import "../../../css/dashboard.css"
// Other Packages
import ContentLoader from "react-content-loader";


const random = Math.random() * (1 - 0.7) + 0.9;

const MyTextLoader = () => (
  <ContentLoader
    speed={2}
    primaryColor="#f3f3f3"
    secondaryColor="#ecebeb"
    className="contentLoaderStyle2"
  >
    <rect x="0" y="3" rx="5" ry="5" width={400 * random} height="3" />
    <rect x="0" y="8" rx="5" ry="5" width="350" height="3" />
    <rect x="0" y="13" rx="5" ry="5" width={200 * random} height="3" />
  </ContentLoader>
);


class QuestionCardLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    return (
      <div>
        <div className="question-div">
          <div className="question-header section-question">
            <div className="question-number question-number-loader">
              
            </div>
            <div className="bank-name bank-name-loader">
              
            </div>
          </div>
          <div className="question-details-loader section-question">
            <MyTextLoader/>
          </div>
          <div className="question-text-div  section-question">
            <div className="question-text question-text-loader">
              <MyTextLoader/>
            </div>
          </div>
          <div className="question-options-div  section-question">
            <div className="question-options question-options-loader">
              <MyTextLoader/>
            </div>
          </div>
        </div>
      </div>
    );
  }

}


export default (QuestionCardLoader);
