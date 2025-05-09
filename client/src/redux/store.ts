/* eslint-disable no-underscore-dangle */
import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import { thunk } from "redux-thunk";
import userReducer from "./reducers/userReducer";
import projectReducer from "./reducers/projectReducer";
import taskReducer from "./reducers/taskReducer";

const rootReducer = combineReducers({
    user: userReducer,
    project: projectReducer,
    task: taskReducer
});
const middlewares = [thunk];

const store = createStore(
  rootReducer,
  compose(applyMiddleware(...middlewares))
);

export default store;