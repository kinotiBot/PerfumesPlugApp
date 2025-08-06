import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { clearCart } from '../cart/cartSlice';
import { getApiUrl } from '../../utils/api';

const initialState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  success: false,
};

// Create order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { dispatch, getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      // Check if user is authenticated
      if (!auth.userToken || !auth.isAuthenticated) {
        return rejectWithValue('Please log in to place an order');
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.post(getApiUrl('/api/orders/'), orderData, config);
      
      // Clear cart after successful order
      dispatch(clearCart());
      
      return data;
    } catch (error) {
      console.error('Order creation error:', error);
      
      // Handle 401 Unauthorized - token expired
      if (error.response && error.response.status === 401) {
        // Import logout action dynamically to avoid circular dependency
        const { logout } = await import('../auth/authSlice');
        dispatch(logout());
        return rejectWithValue('Your session has expired. Please log in again.');
      }
      
      if (error.response && error.response.data) {
        // Handle different error response formats
        const errorMessage = error.response.data.message || 
                           error.response.data.detail || 
                           JSON.stringify(error.response.data) || 
                           'Order creation failed';
        return rejectWithValue(errorMessage);
      } else {
        return rejectWithValue(error.message || 'Network error occurred');
      }
    }
  }
);

// Get user orders
export const getUserOrders = createAsyncThunk(
  'order/getUserOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.get(getApiUrl('/api/orders/my-orders/'), config);
      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Get order details
export const getOrderDetails = createAsyncThunk(
  'order/getOrderDetails',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.get(getApiUrl(`/api/orders/${id}/`), config);
      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Cancel order
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.post(getApiUrl(`/api/orders/${id}/cancel/`), {}, config);
      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Get all orders (admin)
export const getAllOrders = createAsyncThunk(
  'order/getAllOrders',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.order_id) queryParams.append('order_id', params.order_id);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/api/orders/?${queryString}` : '/api/orders/';
      
      const { data } = await axios.get(getApiUrl(url), config);
      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Update order status (admin)
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.put(
        getApiUrl(`/api/orders/${orderId}/`),
        { status },
        config
      );
      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    resetOrderSuccess: (state) => {
      state.success = false;
    },
    clearOrderDetails: (state) => {
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.order = payload;
      })
      .addCase(createOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Ensure orders is always an array
        state.orders = Array.isArray(payload) ? payload : (payload?.results || payload?.orders || []);
      })
      .addCase(getUserOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.orders = []; // Reset to empty array on error
      })
      // Get order details
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOrderDetails.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.order = payload;
      })
      .addCase(getOrderDetails.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.order = payload;
      })
      .addCase(cancelOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get all orders (admin)
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Ensure orders is always an array
        state.orders = Array.isArray(payload) ? payload : (payload?.results || payload?.orders || []);
      })
      .addCase(getAllOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.orders = []; // Reset to empty array on error
      })
      // Update order status (admin)
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.order = payload;
      })
      .addCase(updateOrderStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearOrderError, resetOrderSuccess, clearOrderDetails } =
  orderSlice.actions;
export default orderSlice.reducer;