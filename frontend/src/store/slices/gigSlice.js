import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api/gigs`;

axios.defaults.withCredentials = true;

// Fetch all gigs
export const fetchGigs = createAsyncThunk(
  'gigs/fetchAll',
  async ({ search = '' } = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, {
        params: { search }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Create new gig
export const createGig = createAsyncThunk(
  'gigs/create',
  async (gigData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, gigData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch single gig
export const fetchGigById = createAsyncThunk(
  'gigs/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const gigSlice = createSlice({
  name: 'gigs',
  initialState: {
    gigs: [],
    currentGig: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch gigs
      .addCase(fetchGigs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs = action.payload.gigs;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch gigs';
      })
      // Create gig
      .addCase(createGig.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gigs.unshift(action.payload.gig);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create gig';
      })
      // Fetch single gig
      .addCase(fetchGigById.fulfilled, (state, action) => {
        state.currentGig = action.payload.gig;
      });
  },
});

export const { clearError } = gigSlice.actions;
export default gigSlice.reducer;