import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';

const initialState = {
  users: [],
  loading: false,
  error: null,
};

// Get all users (admin only)
export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      
      // Fetch all users by setting a high page size
      const { data } = await axios.get(getApiUrl('/api/users/?page_size=10000'), config);
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

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Ensure users is always an array
        state.users = Array.isArray(payload) ? payload : (payload?.results || payload?.users || []);
      })
      .addCase(getAllUsers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.users = [];
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;