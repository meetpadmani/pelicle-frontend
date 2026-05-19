import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await productsAPI.getAll(params);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchFeatured = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const res = await productsAPI.getFeatured();
    return res.data.products;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchNewArrivals = createAsyncThunk('products/newArrivals', async (_, { rejectWithValue }) => {
  try {
    const res = await productsAPI.getNewArrivals();
    return res.data.products;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchProductDetail = createAsyncThunk('products/detail', async (slug, { rejectWithValue }) => {
  try {
    const res = await productsAPI.getBySlug(slug);
    return res.data.product;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    list: [],
    featured: [],
    newArrivals: [],
    selectedProduct: null,
    totalProducts: 0,
    totalPages: 1,
    currentPage: 1,
    loading: false,
    detailLoading: false,
    error: null,
    filters: {
      keyword: '', category: '', gender: '', minPrice: '', maxPrice: '',
      sizes: [], colors: [], brand: '', sort: '-createdAt',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        keyword: '', category: '', gender: '', minPrice: '', maxPrice: '',
        sizes: [], colors: [], brand: '', sort: '-createdAt',
      };
    },
    clearSelectedProduct: (state) => { state.selectedProduct = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.products;
        state.totalProducts = action.payload.totalProducts;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      .addCase(fetchFeatured.fulfilled, (state, action) => { state.featured = action.payload; })
      .addCase(fetchNewArrivals.fulfilled, (state, action) => { state.newArrivals = action.payload; })

      .addCase(fetchProductDetail.pending, (state) => { state.detailLoading = true; })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.detailLoading = false; state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state) => { state.detailLoading = false; });
  },
});

export const { setFilters, resetFilters, clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
