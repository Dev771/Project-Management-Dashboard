import type { Actions, ProjectState } from "../../interface/types";
import {
    CLOSE_PROJECT,
    UPDATE_PROJECT,
} from "../CONSTANTS";
  
const initialState = {
    loading: false,
    project: null,
    members: null,
    users: null
};
  
const projectReducer = (state: ProjectState = initialState, action: Actions) => {
    const { payload } = action;
  
    switch (action.type) {
        case UPDATE_PROJECT:
            return {
                ...state,
                project: payload.project ?? state.project,
                members: payload.members ?? state.members,
                users: payload.users ?? state.users
            }
        case CLOSE_PROJECT:
            return {
                ...state,
                project: null,
                members: null,
                users: null            
            }
        default:
            return state;
    }
};

export default projectReducer;