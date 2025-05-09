import {
    UPDATE_TASK_LIST,
    DELETE_TASK,
    UPDATE_TASK
} from "../CONSTANTS";


export const updateTaskList = (tasks) => {
    return {
        type: UPDATE_TASK_LIST,
        payload: tasks
    };
};

export const updateTask = (task) => {
    return {
        type: UPDATE_TASK,
        payload: task
    };
};

export const deleteTask = (id) => {
    return {
        type: DELETE_TASK,
        payload: id
    };
};