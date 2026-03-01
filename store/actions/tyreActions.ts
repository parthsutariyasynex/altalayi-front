import * as Types from '../constants/actionTypes';
import { axiosGet } from '../axiosHelper';

export const fetchWidths = () => async (dispatch: any) => {
    axiosGet({
        url: '/tyre-width',
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.FETCH_WIDTHS_SUCCESS, payload: response.data });
        }
    });
};

export const fetchHeights = (width: string) => async (dispatch: any) => {
    axiosGet({
        url: `/tyre-height?width=${width}`,
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.FETCH_HEIGHTS_SUCCESS, payload: response.data });
        }
    });
};

export const fetchRims = (width: string, height: string) => async (dispatch: any) => {
    axiosGet({
        url: `/tyre-rim?width=${width}&height=${height}`,
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.FETCH_RIMS_SUCCESS, payload: response.data });
        }
    });
};

export const clearTyreData = () => (dispatch: any) => {
    dispatch({ type: Types.CLEAR_TYRE_DATA });
};
