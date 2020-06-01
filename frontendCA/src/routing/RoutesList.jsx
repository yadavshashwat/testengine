

// Pages import
import Home from "../pages/HomePage";
import Settings from "../pages/SettingsPage";
import QuestionFolderSelect from "../pages/QuestionFolderSelect";
import QuestionBankSelect from "../pages/QuestionBankSelect";
import QuestionBankSubFolderSelect from "../pages/QuestionBankSubFolderSelect";
import QuestionManagement from "../pages/QuestionManagement";
import TestBankSelect from "../pages/TestBankSelect";
import StaffManagement from "../pages/StaffManagement";
import QuestionBankManagement from "../pages/QuestionBankManagement";
import QuestionTopicManagement from "../pages/QuestionTopicManagement";


import TestBankManagement from "../pages/TestBankManagement";
import TestTopicManagement from "../pages/TestTopicManagement";
import TestManagement from "../pages/TestManagement";
import AllSections from "../pages/AllSections";
import IndividualTest from "../pages/TestIndividual";
import SectionManagement from "../pages/SectionManagement";
import TestContentManagement from "../pages/TestContentManagement";
import LoginPage from "../pages/LoginPage";
import Logout from "../pages/Logout";
import HomePage from "../pages/HomePage";
import CourseManagement from "../pages/CourseManagement";
import PercentileMananagement from "../pages/PercentileManagement";
import CoursePage from "../pages/CoursePage";
import TestPage from "../pages/ActiveTest";

import TestAnalysis from "../pages/TestAnalysis";
import ForgetPassword from "../pages/ForgetPassword";

// icons import
import VidConnectionCircleIcon from '@atlaskit/icon/glyph/vid-connection-circle';
import DashboardIcon from '@atlaskit/icon/glyph/dashboard';
import GearIcon from '@atlaskit/icon/glyph/settings';
import TrayIcon from '@atlaskit/icon/glyph/tray';
import QueuesIcon from '@atlaskit/icon/glyph/queues';
import MediaServicesSpreadsheetIcon from '@atlaskit/icon/glyph/media-services/spreadsheet';
import BitbucketPipelinesIcon from '@atlaskit/icon/glyph/bitbucket/pipelines';
import SuitcaseIcon from '@atlaskit/icon/glyph/suitcase';
import SignOutIcon from '@atlaskit/icon/glyph/sign-out';
import TableIcon from '@atlaskit/icon/glyph/table';
import ActiveTest from "../pages/ActiveTest";

const basePath = "/testengine"
const Routes = [
  {
    path:  basePath +  "/",
    navbarDisplayName: "Home",
    pageType:"login",
    component: LoginPage,
    viewLevel:1,
    redirect:false,
    navbarIcon:DashboardIcon
  },
  {
    path:  basePath +  "/courses/:coursename/",
    navbarDisplayName: "Home",
    pageType:"course",
    component: CoursePage,
    viewLevel:1,
    redirect:false,
    navbarIcon:DashboardIcon
  },
  {
    path:  basePath +  "/tests/:testname/",
    navbarDisplayName: "Home",
    pageType:"course",
    component: ActiveTest,
    viewLevel:1,
    redirect:false,
    navbarIcon:DashboardIcon
  },

  {
    path:  basePath +  "/tests/:testname/:testpage/",
    navbarDisplayName: "Home",
    pageType:"course",
    component: ActiveTest,
    viewLevel:1,
    redirect:false,
    navbarIcon:DashboardIcon
  },
  {
    path:  basePath +  "/adminpanel/tests/:testname/",
    navbarDisplayName: "Home",
    pageType:"course",
    component: ActiveTest,
    viewLevel:1,
    redirect:false,
    navbarIcon:DashboardIcon
  },

  {
    path:  basePath +  "/adminpanel/",
    navbarDisplayName: "None",
    pageType:"login",
    component: LoginPage,
    viewLevel:1,
    redirect:false,
    navbarIcon:DashboardIcon
  },
  // {
  //   path:  basePath +  "/adminpanel/overview/",
  //   component: HomePage,
  //   pageType:"dashboard",
  //   viewLevel:1,
  //   redirect:false,
  //   navbarDisplayName: "Overview",
  //   navbarIcon:DashboardIcon
  // },
  {
    path:  basePath +  "/adminpanel/test-usage/",
    component: TestContentManagement,
    pageType:"dashboard",
    viewLevel:1,
    redirect:false,
    navbarDisplayName: "Test Usage",
    navbarIcon:VidConnectionCircleIcon
  },
  {
    path:  basePath +  "/test-usage/:testname/:email/",
    component: TestAnalysis,
    pageType:"course",
    viewLevel:1,
    redirect:false,
    navbarDisplayName: "Test Usage",
    navbarIcon:VidConnectionCircleIcon
  },

  {
    path:  basePath +  "/adminpanel/passreset/:secstring/",
    component: ForgetPassword,
    pageType:"course",
    viewLevel:1,
    redirect:false,
    navbarDisplayName: "Test Usage",
    navbarIcon:VidConnectionCircleIcon
  },


  {
    path:  basePath +  "/adminpanel/sections/",
    component: AllSections,
    pageType:"dashboard",
    viewLevel:1,
    redirect:false,
    navbarDisplayName: "All Sections",
    navbarIcon:MediaServicesSpreadsheetIcon
  },

  // Question Management Paths
  {
    path:  basePath +  "/adminpanel/question-folder/",
    component: QuestionFolderSelect,
    pageType:"dashboard",
    viewLevel:1,
    redirect:false,
    navbarDisplayName: "Question Banks",
    navbarIcon:TrayIcon
  },

  {
    path:  basePath +  "/adminpanel/question-folder/:foldername/",
    component: QuestionBankSubFolderSelect,
    pageType:"dashboard",
    viewLevel:2,
    redirect:false,
    navbarDisplayName: "Question Banks",
    navbarIcon:TrayIcon
  },


  {
    path:  basePath +  "/adminpanel/question-folder/:foldername/:bankname/",
    component: QuestionManagement,
    pageType:"dashboard",
    viewLevel:3,
    redirect:false,
    navbarDisplayName: "Question Banks",
    navbarIcon:TrayIcon
  },




  // {
  //   path:  basePath +  "/adminpanel/question-bank/",
  //   component: QuestionBankSelect,
  //   pageType:"dashboard",
  //   viewLevel:1,
  //   redirect:false,
  //   navbarDisplayName: "Old Question Bank",
  //   navbarIcon:TrayIcon
  // },
  // {
  //   path:  basePath +  "/adminpanel/question-bank/:bankname/",
  //   component: QuestionManagement,
  //   pageType:"dashboard",
  //   viewLevel:3,
  //   redirect:false,
  //   navbarDisplayName: "Question Bank",
  //   navbarIcon:TrayIcon
  // },
  // Test Management Paths
  {
    path:  basePath +  "/adminpanel/test-bank/",
    component: TestBankSelect,
    pageType:"dashboard",
    viewLevel:1,
    redirect:false,
    navbarDisplayName: "Test Bank",
    navbarIcon:QueuesIcon
  },
  {
    path:  basePath +  "/adminpanel/test-bank/:bankname/",
    component: TestManagement,
    pageType:"dashboard",
    viewLevel:3,
    redirect:false,
    navbarDisplayName: "Test Bank",
    navbarIcon:QueuesIcon
  },
  {
    path:  basePath +  "/adminpanel/test-bank/:bankname/:testname/",
    component: IndividualTest,
    pageType:"dashboard",
    viewLevel:4,
    redirect:false,
    navbarDisplayName: "Test Bank",
    navbarIcon:QueuesIcon
  },
  {
    path:  basePath +  "/adminpanel/test-bank/:bankname/:testname/:sectionid/",
    component: SectionManagement,
    pageType:"dashboard",
    viewLevel:5,
    redirect:false,
    navbarDisplayName: "Test Bank",
    navbarIcon:QueuesIcon
  },
  {
    path:  basePath +  "/adminpanel/courses/",
    component: CourseManagement,
    pageType:"dashboard",
    viewLevel:1,
    redirect:false,
    navbarDisplayName: "Courses",
    navbarIcon:SuitcaseIcon
  },
  {
    path:  basePath +  "/adminpanel/courses/:coursename/",
    component: CoursePage,
    pageType:"dashboard",
    viewLevel:2,
    redirect:false,
    navbarDisplayName: "Courses",
    navbarIcon:SuitcaseIcon
  },
  {
    path:  basePath +  "/adminpanel/settings/",
    component: Settings,
    pageType:"dashboard",
    viewLevel:1,
    redirect:false,
    navbarDisplayName: "Settings",
    navbarIcon:GearIcon
  },
  {
    path:  basePath +  "/adminpanel/settings/staff-management/",
    component: StaffManagement,
    pageType:"dashboard",
    viewLevel:2,
    redirect:false,
    navbarDisplayName: "Settings",
    navbarIcon:GearIcon
  },
  {
    path:  basePath +  "/adminpanel/settings/question-bank-management/",
    component: QuestionBankManagement,
    pageType:"dashboard",
    viewLevel:2,
    redirect:false,
    navbarDisplayName: "Settings",
    navbarIcon:GearIcon
  },
  {
    path:  basePath +  "/adminpanel/settings/question-topic-management/",
    component: QuestionTopicManagement,
    pageType:"dashboard",
    viewLevel:2,
    redirect:false,
    navbarDisplayName: "Settings",
    navbarIcon:GearIcon
  },
  {
    path:  basePath +  "/adminpanel/settings/test-bank-management/",
    component: TestBankManagement,
    pageType:"dashboard",
    viewLevel:2,
    redirect:false,
    navbarDisplayName: "Settings",
    navbarIcon:GearIcon
  },
  {
    path:  basePath +  "/adminpanel/settings/test-topic-management/",
    component: TestTopicManagement,
    pageType:"dashboard",
    viewLevel:2,
    redirect:false,
    navbarDisplayName: "Settings",
    navbarIcon:GearIcon
  },
  {
    path:  basePath +  "/adminpanel/settings/percentile-management/",
    component: PercentileMananagement,
    pageType:"dashboard",
    viewLevel:2,
    redirect:false,
    navbarDisplayName: "Settings",
    navbarIcon:TableIcon
  },

  {
    path:  basePath +  "/adminpanel/logout/",
    component: Logout,
    pageType:"dashboard",
    viewLevel:1,
    redirect:false,
    navbarDisplayName: "Logout",
    navbarIcon:SignOutIcon
  }
  // { redirect: true, path:  basePath +  "/adminpanel", to: "/adminpanel/home" }
];

export default Routes;
