import {
    LOGIN,
    LOGOUT,
    UPDATE_USER_DETAILS,
} from "../CONSTANTS";
  
const initialState = {
    loading: false,
    user: null,
    token: null,
};
  
const userReducer = (state = initialState, action) => {
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