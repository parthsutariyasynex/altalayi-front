import * as Types from "../constants/actionTypes";

const initialState = {
    widths: [],
    heights: [],
    rims: [],
    loading: false,
    error: null,
};

export default (state = initialState, action: any) => {
    switch (action.type) {
        case Types.FETCH_WIDTHS_SUCCESS:
            return {
                ...state,
                widths: action.payload,
            };

        case Types.FETCH_HEIGHTS_SUCCESS:
            return {
                ...state,
                heights: action.payload,
            };

        case Types.FETCH_RIMS_SUCCESS:
            return {
                ...state,
                rims: action.payload,
            };

        case Types.CLEAR_TYRE_DATA:
            return {
                ...state,
                widths: [],
                heights: [],
                rims: [],
            };

        default:
            return state;
    }
};
