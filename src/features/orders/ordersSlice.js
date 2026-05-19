import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try {
    const res = await ordersAPI.create(data);
    return res.data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Order failed'); }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (params, { rejectWithValue }) => {
  try {
    const res = await ordersAPI.getMyOrders(params);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchOrderById = createAsyncThunk('orders/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await ordersAPI.getById(id);
    return res.data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const res = await ordersAPI.cancel(id, reason);
    return res.data.order;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    selectedOrder: null,
    total: 0,
    loading: false,
    createLoading: false,
    error: null,
  },
  reducers: {
    clearSelectedOrder: (state) => { state.selectedOrder = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.createLoading = true; state.error = null; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.createLoading = false;
        state.selectedOrder = action.payload;
        toast.success('Order placed successfully! 🎉');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.createLoading = false; state.error = action.payload;
        toast.error(action.payload || 'Failed to place order');
      })

      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.orders;
        state.total = action.payload.total;
      })
      .addCase(fetchMyOrders.rejected, (state) => { state.loading = false; })

      .addCase(fetchOrderById.pending, (state) => { state.loading = true; })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false; state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state) => { state.loading = false; })

      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
        state.list = state.list.map(o => o._id === action.payload._id ? action.payload : o);
        toast.success('Order cancelled');
      });
  },
});

export const { clearSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
