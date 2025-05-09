import {
    UPDATE_PROJECT,
    CLOSE_PROJECT
} from "../CONSTANTS";

export const closeProject = () => {
    return {
        type: CLOSE_PROJECT,
    };
};

export const updateProject = ({ project, members, users }) => {
    return {
        type: UPDATE_PROJECT,
        payload: { project, members, users }
    };
};