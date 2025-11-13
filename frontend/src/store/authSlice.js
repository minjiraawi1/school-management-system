import { createSlice } from '@reduxjs/toolkit';

// Retrieve initial state from localStorage
const getInitialState = () => {
  try {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
        isAuthenticated: !!(parsed.token && parsed.user),
        loading: false,
        error: null,
        restored: true, // Mark that we've already restored from localStorage
      };
    }
  } catch (error) {
    console.error('Error parsing saved auth:', error);
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    restored: true,
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      // Persist to localStorage
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: action.payload.user,
          token: action.payload.token,
        })
      );
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      // Clear from localStorage
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    restoreAuth: (state) => {
      const savedAuth = getInitialState();
      state.user = savedAuth.user;
      state.token = savedAuth.token;
      state.isAuthenticated = savedAuth.isAuthenticated;
    },
  },
});

export const { setLogin, setLogout, setLoading, setError, restoreAuth } = authSlice.actions;

export default authSlice.reducer;