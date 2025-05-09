import type { Users } from "../../interface/types";
import {
    LOGIN,
    LOGOUT,
    UPDATE_USER_DETAILS,
} from "../CONSTANTS";

export const login = (user: Users, token: string) => {
    return {
        type: LOGIN,
        payload: { user, token },
    };
};

export const logout = () => {
    return {
        type: LOGOUT,
    };
};

export const updateUserDetails = (user: Users, token: string) => {
    return {
        type: UPDATE_USER_DETAILS,
        payload: { user, token },
    };
};