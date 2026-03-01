import * as Types from "../constants/actionTypes";

const initialState = {
    items: [],
    loading: false,
    error: null,
};

export default (state = initialState, action: any) => {
    switch (action.type) {
        case Types.FETCH_CART_SUCCESS:
            return {
                ...state,
                items: action.payload,
            };

        case Types.CLEAR_CART:
            return {
                ...state,
                items: [],
            };

        default:
            return state;
    }
};
