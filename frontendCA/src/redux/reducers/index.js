
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import question from './question';
import test from './test';
import flag from "./flag";
import section from "./section";
import sectionquestion from "./sectionquestion";
import coursetest from './coursetest';
import authorization from "./authorization";

export default combineReducers({
  routing: routerReducer,
  question,
  section,
  test,
  flag,
  sectionquestion,
  authorization,
  coursetest
});
