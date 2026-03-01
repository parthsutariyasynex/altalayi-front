import * as Types from '../constants/actionTypes';
import { axiosGet, axiosPost, axiosDelete } from '../axiosHelper';

export const fetchCart = () => async (dispatch: any) => {
    axiosGet({
        url: '/cart',
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.FETCH_CART_SUCCESS, payload: response.data });
        }
    });
};

export const addToCart = (sku: string, qty: number = 1, cb?: (err: any) => void) => async (dispatch: any) => {
    axiosPost({
        url: '/cart/add',
        reqBody: { sku, qty },
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.ADD_TO_CART_SUCCESS, payload: response.data });
            dispatch(fetchCart());
            if (cb) cb(null);
        } else {
            if (cb) cb(response.data.message);
        }
    });
};

export const removeFromCart = (itemId: number, cb?: (err: any) => void) => async (dispatch: any) => {
    axiosDelete({
        url: `/cart?itemId=${itemId}`,
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.REMOVE_FROM_CART_SUCCESS, payload: itemId });
            dispatch(fetchCart());
            if (cb) cb(null);
        } else {
            if (cb) cb(response.data.message);
        }
    });
};

export const clearCart = () => (dispatch: any) => {
    dispatch({ type: Types.CLEAR_CART });
};
