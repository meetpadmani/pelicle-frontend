import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await cartAPI.get();
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try {
    const res = await cartAPI.add(data);
    return res.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await cartAPI.update(itemId, { quantity });
    return res.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const res = await cartAPI.remove(itemId);
    return res.data.cart;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    await cartAPI.clear();
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalPrice: 0,
    totalItems: 0,
    couponApplied: null,
    discountAmount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    applyCoupon: (state, action) => {
      state.couponApplied = action.payload.coupon;
      state.discountAmount = action.payload.discountAmount;
    },
    removeCoupon: (state) => {
      state.couponApplied = null;
      state.discountAmount = 0;
    },
  },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      const cart = action.payload?.cart || action.payload;
      if (cart) {
        state.items = cart.items || [];
        state.totalPrice = action.payload.totalPrice || cart.items?.reduce((s, i) => s + i.price * i.quantity, 0) || 0;
        state.totalItems = action.payload.totalItems || cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;
      }
      state.loading = false;
    };

    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, (state) => { state.loading = false; })

      .addCase(addToCart.pending, (state) => { state.loading = true; })
      .addCase(addToCart.fulfilled, (state, action) => {
        setCart(state, { payload: action.payload });
        toast.success('Added to cart!');
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || 'Could not add to cart');
      })

      .addCase(updateCartItem.fulfilled, (state, action) => setCart(state, { payload: action.payload }))
      .addCase(removeFromCart.fulfilled, (state, action) => {
        setCart(state, { payload: action.payload });
        toast.success('Removed from cart');
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = []; state.totalPrice = 0; state.totalItems = 0;
        state.couponApplied = null; state.discountAmount = 0;
        state.loading = false;
      });
  },
});

export const { applyCoupon, removeCoupon } = cartSlice.actions;
export default cartSlice.reducer;
