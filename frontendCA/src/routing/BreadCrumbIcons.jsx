import React  from 'react';
// icons import
import GearIcon from '@atlaskit/icon/glyph/settings';
import TrayIcon from '@atlaskit/icon/glyph/tray';
import QueuesIcon from '@atlaskit/icon/glyph/queues';
import PeopleIcon from '@atlaskit/icon/glyph/people';
import MediaServicesBlurIcon from '@atlaskit/icon/glyph/media-services/blur';
import FolderIcon from '@atlaskit/icon/glyph/folder';
import PortfolioIcon from '@atlaskit/icon/glyph/portfolio';
import MediaServicesSpreadsheetIcon from '@atlaskit/icon/glyph/media-services/spreadsheet';
import SuitcaseIcon from '@atlaskit/icon/glyph/suitcase';
import TableIcon from '@atlaskit/icon/glyph/table';
import VidConnectionCircleIcon from '@atlaskit/icon/glyph/vid-connection-circle';

const pathIcon = {
  "question-bank-management":<TrayIcon/>,
  "settings":<GearIcon/>,
  "test-bank-management":<QueuesIcon/>,
  "test-bank":<QueuesIcon/>,
  "question-bank":<TrayIcon/>,
  "question-folder":<TrayIcon/>,
  "staff-management":<PeopleIcon/>,
  "test-usage":<VidConnectionCircleIcon/>,
  "question-topic-management":<MediaServicesBlurIcon/>,
  "folder":<FolderIcon/>,
  "test-topic-management":<PortfolioIcon/>,
  "sections":<MediaServicesSpreadsheetIcon/>,
  "courses":<SuitcaseIcon/>,
  "percentile-management":<TableIcon/>
}


export default pathIcon;
