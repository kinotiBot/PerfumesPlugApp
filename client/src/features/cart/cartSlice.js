import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';

const initialState = {
  cartItems: [],
  loading: false,
  error: null,
  success: false,
  cartTotal: 0,
  cartCount: 0,
};

// Get cart
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.get(getApiUrl('/api/orders/cart/my_cart/'), config);
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

// Add to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ perfumeId, quantity }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.post(
        getApiUrl('/api/orders/cart/add_item/'),
        { perfume_id: perfumeId, quantity },
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

// Update cart item
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.post(
        getApiUrl('/api/orders/cart/update_item/'),
        { item_id: itemId, quantity },
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

// Remove from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      await axios.post(getApiUrl('/api/orders/cart/remove_item/'), { item_id: itemId }, config);
      return itemId;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      await axios.post(getApiUrl('/api/orders/cart/clear/'), {}, config);
      return {};
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    resetCartSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get cart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCart.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.cartItems = payload.items || [];
        state.cartTotal = Number(payload.subtotal) || 0;
        state.cartCount = payload.total_items || 0;
      })
      .addCase(getCart.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.cartItems = payload.items || [];
        state.cartTotal = Number(payload.subtotal) || 0;
        state.cartCount = payload.total_items || 0;
      })
      .addCase(addToCart.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Update cart item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.cartItems = payload.items || [];
        state.cartTotal = Number(payload.subtotal) || 0;
        state.cartCount = payload.total_items || 0;
      })
      .addCase(updateCartItem.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.cartItems = state.cartItems.filter(
          (item) => item.id !== payload
        );
        state.cartCount = state.cartItems.length;
        state.cartTotal = state.cartItems.reduce(
          (acc, item) => acc + item.quantity * item.perfume.price,
          0
        );
      })
      .addCase(removeFromCart.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.cartItems = [];
        state.cartTotal = 0;
        state.cartCount = 0;
      })
      .addCase(clearCart.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearCartError, resetCartSuccess } = cartSlice.actions;
export default cartSlice.reducer;