import {
    UPDATE_TASK,
    UPDATE_TASK_LIST,
    CLOSE_PROJECT,
    DELETE_TASK
} from "../CONSTANTS";
  
const initialState = {
    loading: false,
    tasks: {

    }
};
  
const taskReducer = (state = initialState, action) => {
    const { payload } = action;
  
    switch (action.type) {
        case UPDATE_TASK_LIST:
            return {
                ...state,
                tasks: ((payload) => {
                    const obj: Record<string, any> = {};
                    payload.map((a) => {
                        obj[a.id] = a;
                    });
                    return obj;
                })(payload)
            }
        case UPDATE_TASK:
            return {
                ...state,
                tasks: {
                    ...state.tasks,
                    [payload.id]: payload
                }
            }
        case DELETE_TASK:
            return {
                ...state,
                tasks: Object.keys(state.tasks).filter((a) => state.tasks[a].id !== payload)            
            }
        case CLOSE_PROJECT:
            return {
                ...state,
                tasks: {}
            }
        default:
            return state;
    }
};

export default taskReducer;