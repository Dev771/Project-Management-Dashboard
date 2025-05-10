import type { Projects, Users } from "../../interface/types";
import {
    UPDATE_PROJECT,
    CLOSE_PROJECT
} from "../CONSTANTS";

export const closeProject = () => {
    return {
        type: CLOSE_PROJECT,
    };
};

export const updateProject = ({ project, members, users }: {
    project?: Projects,
    members?: Users[],
    users?: Users[]
}) => {
    return {
        type: UPDATE_PROJECT,
        payload: { project, members, users }
    };
};