import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';

const initialState = {
  perfumes: [],
  perfume: null,
  featuredPerfumes: [],
  onSalePerfumes: [],
  categories: [],
  brands: [],
  loading: false,
  error: null,
  page: 1,
  pages: 1,
  count: 0,
};

// Get all perfumes
export const getPerfumes = createAsyncThunk(
  'perfume/getPerfumes',
  async (params, { rejectWithValue }) => {
    try {
      const { page = 1, category, brand, search, ordering, featured, on_sale } = params || {};
      let url = `/api/perfumes/?page=${page}`;
      
      if (category) url += `&category=${category}`;
      if (brand) url += `&brand=${brand}`;
      if (search) url += `&search=${search}`;
      if (ordering) url += `&ordering=${ordering}`;
      if (featured) url += `&is_featured=${featured}`;
      if (on_sale) url += `&on_sale=${on_sale}`;
      
      const { data } = await axios.get(getApiUrl(url));
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

// Get perfume details
export const getPerfumeDetails = createAsyncThunk(
  'perfume/getPerfumeDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(getApiUrl(`/api/perfumes/${id}/`));
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

// Get featured perfumes
export const getFeaturedPerfumes = createAsyncThunk(
  'perfume/getFeaturedPerfumes',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(getApiUrl('/api/perfumes/featured/'));
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

// Get on sale perfumes
export const getOnSalePerfumes = createAsyncThunk(
  'perfume/getOnSalePerfumes',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(getApiUrl('/api/perfumes/on_sale/'));
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

// Get all perfumes for admin
export const getAllPerfumes = createAsyncThunk(
  'perfume/getAllPerfumes',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(getApiUrl('/api/perfumes/'));
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

// Get all categories
export const getCategories = createAsyncThunk(
  'perfume/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(getApiUrl('/api/perfumes/categories/'));
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

// Get all brands
export const getBrands = createAsyncThunk(
  'perfume/getBrands',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(getApiUrl('/api/perfumes/brands/'));
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

// Delete perfume
export const deletePerfume = createAsyncThunk(
  'perfume/deletePerfume',
  async (slug, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${auth.userToken}`,
        },
      };
      
      await axios.delete(getApiUrl(`/api/perfumes/${slug}/`), config);
      return slug;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const perfumeSlice = createSlice({
  name: 'perfume',
  initialState,
  reducers: {
    clearPerfumeError: (state) => {
      state.error = null;
    },
    clearPerfumeDetails: (state) => {
      state.perfume = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all perfumes
      .addCase(getPerfumes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPerfumes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.perfumes = payload.results;
        state.page = payload.current_page || 1;
        state.pages = payload.total_pages || 1;
        state.count = payload.count || 0;
      })
      .addCase(getPerfumes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get perfume details
      .addCase(getPerfumeDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPerfumeDetails.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.perfume = payload;
      })
      .addCase(getPerfumeDetails.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get featured perfumes
      .addCase(getFeaturedPerfumes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFeaturedPerfumes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.featuredPerfumes = payload;
      })
      .addCase(getFeaturedPerfumes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get on sale perfumes
      .addCase(getOnSalePerfumes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getOnSalePerfumes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.onSalePerfumes = payload;
      })
      .addCase(getOnSalePerfumes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get all categories
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories = payload.results || payload;
      })
      .addCase(getCategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get all brands
      .addCase(getBrands.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBrands.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.brands = payload.results || payload;
      })
      .addCase(getBrands.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Get all perfumes for admin
      .addCase(getAllPerfumes.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPerfumes.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.perfumes = payload.results || payload;
      })
      .addCase(getAllPerfumes.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Delete perfume
      .addCase(deletePerfume.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePerfume.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.perfumes = state.perfumes.filter(perfume => perfume.slug !== payload);
      })
      .addCase(deletePerfume.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearPerfumeError, clearPerfumeDetails } = perfumeSlice.actions;
export default perfumeSlice.reducer;