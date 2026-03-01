import * as Types from '../constants/actionTypes';
import { axiosPost } from '../axiosHelper';

export const login = (credentials: any, cb?: (err: any, data?: any) => void) => async (dispatch: any) => {
    dispatch({ type: Types.LOGIN_REQUEST });
    axiosPost({
        url: '/login',
        reqBody: {
            email: credentials.email,
            password: credentials.password,
        },
    }, (response) => {
        if (response.status === 200) {
            if (typeof window !== "undefined") {
                localStorage.setItem("token", response.data.token);
            }
            dispatch({ type: Types.LOGIN_SUCCESS, payload: response.data.token });
            if (cb) cb(null, response.data);
        } else {
            dispatch({ type: Types.LOGIN_FAILURE, payload: response.data.message });
            if (cb) cb(response.data.message);
        }
    });
};

export const sendOtp = (mobile: string, cb?: (err: any, data?: any) => void) => async (dispatch: any) => {
    dispatch({ type: Types.SEND_OTP_REQUEST });
    axiosPost({
        url: '/login-otp',
        reqBody: { mobile },
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.SEND_OTP_SUCCESS, payload: response.data });
            if (cb) cb(null, response.data);
        } else {
            dispatch({ type: Types.SEND_OTP_FAILURE, payload: response.data.message });
            if (cb) cb(response.data.message);
        }
    });
};

export const loginWithOtp = (credentials: { mobile: string; otp: string }, cb?: (err: any, data?: any) => void) => async (dispatch: any) => {
    dispatch({ type: Types.LOGIN_REQUEST });
    axiosPost({
        url: '/login-otp',
        reqBody: credentials,
    }, (response) => {
        if (response.status === 200) {
            if (typeof window !== "undefined") {
                localStorage.setItem("token", response.data.token);
            }
            dispatch({ type: Types.LOGIN_SUCCESS, payload: response.data.token });
            if (cb) cb(null, response.data);
        } else {
            dispatch({ type: Types.LOGIN_FAILURE, payload: response.data.message });
            if (cb) cb(response.data.message);
        }
    });
};

export const forgotPassword = (email: string, cb?: (err: any, data?: any) => void) => async (dispatch: any) => {
    dispatch({ type: Types.FORGOT_PASSWORD_REQUEST });
    axiosPost({
        url: '/forgot-password',
        reqBody: { email },
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.FORGOT_PASSWORD_SUCCESS });
            if (cb) cb(null, response.data);
        } else {
            dispatch({ type: Types.FORGOT_PASSWORD_FAILURE, payload: response.data.message });
            if (cb) cb(response.data.message);
        }
    });
};

export const logout = () => (dispatch: any) => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
    }
    dispatch({ type: Types.LOGOUT });
};

export const changePassword = (credentials: any, cb?: (err: any, data?: any) => void) => async (dispatch: any) => {
    dispatch({ type: Types.CHANGE_PASSWORD_REQUEST });
    axiosPost({
        url: '/change-password',
        reqBody: credentials,
    }, (response) => {
        if (response.status === 200) {
            dispatch({ type: Types.CHANGE_PASSWORD_SUCCESS });
            if (cb) cb(null, response.data);
        } else {
            dispatch({ type: Types.CHANGE_PASSWORD_FAILURE, payload: response.data.message });
            if (cb) cb(response.data.message);
        }
    });
};
