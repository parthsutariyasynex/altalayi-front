import * as Types from '../constants/actionTypes';
import { axiosGet, axiosPost } from '../axiosHelper';

export const fetchFavoriteProducts = () => async (dispatch: any) => {
    axiosGet({
        url: '/products',
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.FETCH_FAVORITES_SUCCESS, payload: response.data });
        }
    });
};

export const toggleFavorite = (body: any, cb?: (err: any) => void) => async (dispatch: any) => {
    axiosPost({
        url: '/products',
        reqBody: body,
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.TOGGLE_FAVORITE_SUCCESS, payload: response.data });
            if (cb) cb(null);
        } else {
            if (cb) cb(response.data.message);
        }
    });
};
