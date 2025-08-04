import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import cartReducer from './features/cart/cartSlice';
import perfumeReducer from './features/perfume/perfumeSlice';
import orderReducer from './features/order/orderSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    perfume: perfumeReducer,
    order: orderReducer,
  },
});

export default store;