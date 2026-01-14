import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const API_URL = `${BACKEND_URL}/api/bids`;

axios.defaults.withCredentials = true;

// Submit bid
export const submitBid = createAsyncThunk(
  'bids/submit',
  async (bidData, { rejectWithValue }) => {
    try {
      console.log('📦 BID DATA SENT:', bidData);
      const response = await axios.post(API_URL, bidData);
      return response.data;
    } catch (error) {
      console.error('❌ BID ERROR:', error.response?.data);
      return rejectWithValue(error.response.data);
    }
  }
);


// Fetch bids for a gig
export const fetchBidsForGig = createAsyncThunk(
  'bids/fetchForGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${gigId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Hire freelancer
export const hireFreelancer = createAsyncThunk(
  'bids/hire',
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${bidId}/hire`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const bidSlice = createSlice({
  name: 'bids',
  initialState: {
    bids: [],
    isLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit bid
      .addCase(submitBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Bid submitted successfully';
      })
      .addCase(submitBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to submit bid';
      })
      // Fetch bids
      .addCase(fetchBidsForGig.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBidsForGig.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bids = action.payload.bids;
      })
      .addCase(fetchBidsForGig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch bids';
      })
      // Hire freelancer
      .addCase(hireFreelancer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(hireFreelancer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = 'Freelancer hired successfully!';
        // Update bids in state
        const hiredBidId = action.payload.bid._id;
        state.bids = state.bids.map(bid => {
          if (bid._id === hiredBidId) {
            return { ...bid, status: 'hired' };
          } else if (bid.status === 'pending') {
            return { ...bid, status: 'rejected' };
          }
          return bid;
        });
      })
      .addCase(hireFreelancer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to hire freelancer';
      });
  },
});

export const { clearError, clearSuccess } = bidSlice.actions;
export default bidSlice.reducer;