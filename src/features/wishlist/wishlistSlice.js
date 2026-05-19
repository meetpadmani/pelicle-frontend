import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistAPI } from '../../services/api';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await wishlistAPI.get();
    return res.data.wishlist;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await wishlistAPI.toggle(productId);
    return { productId, added: res.data.added };
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.products = action.payload?.products || [];
        state.loading = false;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, added } = action.payload;
        if (added) {
          toast.success('Added to wishlist ❤️');
        } else {
          state.products = state.products.filter(p => (p._id || p) !== productId);
          toast.success('Removed from wishlist');
        }
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        toast.error(action.payload || 'Please login to use wishlist');
      });
  },
});

export default wishlistSlice.reducer;
