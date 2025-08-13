import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';

// Get user token from localStorage
const userToken = localStorage.getItem('userToken')
  ? localStorage.getItem('userToken')
  : null;

// Initial state
const initialState = {
  loading: false,
  userInfo: null,
  userToken,
  error: null,
  success: false,
  isAuthenticated: userToken ? true : false,
};

// Register user
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        getApiUrl('/api/users/register/'),
        userData,
        config
      );
      localStorage.setItem('userToken', data.access);
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

// Login user
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        getApiUrl('/api/users/login/'),
        userData,
        config
      );
      localStorage.setItem('userToken', data.access);
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

// Get user profile
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.get(getApiUrl('/api/users/profile/me/'), config);
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

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.put(
        getApiUrl('/api/users/profile/me/'),
        userData,
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

// Check if user is authenticated
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.userToken) {
        return rejectWithValue('No token found');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      const { data } = await axios.get(getApiUrl('/api/users/profile/me/'), config);
      return data;
    } catch (error) {
      localStorage.removeItem('userToken');
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('userToken');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register user
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.success = true;
        state.userInfo = payload.user;
        state.userToken = payload.access;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = payload.user;
        state.userToken = payload.access;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = payload;
      })
      .addCase(getUserProfile.rejected, (state, { payload }) => {
        state.loading = false;
      })
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = payload;
        state.success = true;
      })
      .addCase(updateUserProfile.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.userToken = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.userToken = null;
        state.error = null;
        state.success = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;