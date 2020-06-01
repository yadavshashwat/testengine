// React
import React, { Component } from 'react';
import { Link } from 'react-router';
// Components
import ContentWrapper from '../components/ContentWrapper';


// Atlaskit Packages
import { Grid, GridColumn } from '@atlaskit/page';
import { BreadcrumbsStateless, BreadcrumbsItem } from '@atlaskit/breadcrumbs';
import PortfolioIcon from '@atlaskit/icon/glyph/portfolio';
// Styles
import "../css/dashboard.css"

// Icons
import PeopleIcon from '@atlaskit/icon/glyph/people';
import TrayIcon from '@atlaskit/icon/glyph/tray';
import QueuesIcon from '@atlaskit/icon/glyph/queues';
import MediaServicesBlurIcon from '@atlaskit/icon/glyph/media-services/blur';
import pathIcon from "../routing/BreadCrumbIcons"
import TableIcon from '@atlaskit/icon/glyph/table';
// Other
var changeCase = require("change-case");

export default class StaffPage extends Component {
  render() {
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

    
    return (
      <ContentWrapper>
      <BreadcrumbsStateless>{breadCrumbElement}</BreadcrumbsStateless>
        <Grid layout="fluid">
          <GridColumn medium={12} className="folder-grid">
            <Link to="/testengine/adminpanel/settings/question-topic-management/">
              <div className="settings-div">
                <div className="folder-icon-container-settings">
                  <MediaServicesBlurIcon className="folder-icon" />
                </div>
                <div className="folder-name">
                  Question Topic Management
                </div>
              </div>
            </Link>
          </GridColumn>




          <GridColumn medium={12} className="folder-grid">
            <Link to="/testengine/adminpanel/settings/test-topic-management/">
              <div className="settings-div">
                <div className="folder-icon-container-settings">
                  <PortfolioIcon className="folder-icon" />
                </div>
                <div className="folder-name">
                  Test Topic Management
                    </div>
              </div>
            </Link>
          </GridColumn>

          <GridColumn medium={12} className="folder-grid">
            <Link to="/testengine/adminpanel/settings/percentile-management/">
              <div className="settings-div">
                <div className="folder-icon-container-settings">
                  <TableIcon className="folder-icon" />
                </div>
                <div className="folder-name">
                  Percentile Management
                </div>
              </div>
            </Link>
          </GridColumn>


          <GridColumn medium={12} className="folder-grid">
            <Link to="/testengine/adminpanel/settings/staff-management/">
              <div className="settings-div">
                <div className="folder-icon-container-settings">
                  <PeopleIcon className="folder-icon" />
                </div>
                <div className="folder-name">
                  Staff Management
                    </div>
              </div>
            </Link>
          </GridColumn>

        </Grid>
      </ContentWrapper>
    );
  }
}
