import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import perfumeReducer from './features/perfume/perfumeSlice';
import cartReducer from './features/cart/cartSlice';
import orderReducer from './features/order/orderSlice';
import userReducer from './features/user/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    perfume: perfumeReducer,
    cart: cartReducer,
    order: orderReducer,
    user: userReducer,
  },
});

export default store;