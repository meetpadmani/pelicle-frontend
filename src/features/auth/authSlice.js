import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const saveToStorage = (accessToken, refreshToken, user) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.register(data);
    saveToStorage(res.data.accessToken, res.data.refreshToken, res.data.user);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.login(data);
    saveToStorage(res.data.accessToken, res.data.refreshToken, res.data.user);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authAPI.logout();
    clearStorage();
  } catch (_) {
    clearStorage();
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authAPI.getMe();
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await usersAPI.updateProfile(data);
    return res.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const getUserFromStorage = () => {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch (_) { return null; }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUserFromStorage(),
    accessToken: localStorage.getItem('accessToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      toast.success(`Welcome to PELLICLE, ${action.payload.user.name}! 🎉`);
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false; state.error = action.payload;
      toast.error(action.payload);
    });

    // Login
    builder.addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      toast.success(`Welcome back, ${action.payload.user.name}!`);
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false; state.error = action.payload;
      toast.error(action.payload);
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null; state.accessToken = null; state.isAuthenticated = false;
      toast.success('Logged out successfully.');
    });

    // Fetch Me
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.user = null; state.isAuthenticated = false;
      clearStorage();
    });

    // Update Profile
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
      toast.success('Profile updated!');
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      toast.error(action.payload);
    });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
