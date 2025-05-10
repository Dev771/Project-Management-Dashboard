import type { Actions, UserState } from "../../interface/types";
import {
    LOGIN,
    LOGOUT,
    UPDATE_USER_DETAILS,
} from "../CONSTANTS";
  
const initialState: UserState = {
    loading: false,
    user: null,
    token: null,
};
  
const userReducer = (state: UserState = initialState, action: Actions): UserState => {
    const { payload } = action;
  
    switch (action.type) {
        case LOGIN:
            return { 
                ...state,
                loading: false,
                user: payload.user,
                token: payload.token,
            };

        case UPDATE_USER_DETAILS:
            return { 
                ...state,
                loading: false,
                user: payload.user,
                token: payload.token,
            }
    
        case LOGOUT:
            return { 
                ...state,
                loading: false,
                user: null,
                token: null,
            };

        default:
            return state;
    }
};

export default userReducer;