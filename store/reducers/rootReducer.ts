import { combineReducers } from 'redux';
import authReducer from './authReducer';
import addressReducer from './addressReducer';
import cartReducer from './cartReducer';
import customerReducer from './customerReducer';
import productReducer from './productReducer';
import tyreReducer from './tyreReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    address: addressReducer,
    cart: cartReducer,
    customer: customerReducer,
    product: productReducer,
    tyre: tyreReducer,
});

export default rootReducer;
