import * as Types from "../constants/actionTypes";

const initialState = {
    favoriteProducts: [],
    loading: false,
    error: null,
};

export default (state = initialState, action: any) => {
    switch (action.type) {
        case Types.FETCH_FAVORITES_SUCCESS:
        case Types.TOGGLE_FAVORITE_SUCCESS:
            return {
                ...state,
                favoriteProducts: action.payload,
            };

        default:
            return state;
    }
};
