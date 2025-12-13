/**
 * Affiliate Slice
 * Redux state management for affiliate data
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as affiliateService from '../../services/affiliateService';

// Async thunks
export const fetchAffiliateProfile = createAsyncThunk(
    'affiliate/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await affiliateService.getAffiliateProfile();

            // If service returns null (404 - user is not affiliate), silently return NOT_AFFILIATE
            if (!response) {
                return rejectWithValue('NOT_AFFILIATE');
            }

            // Backend returns: { success: true, data: { affiliate: {...} } }
            // Service returns: response.data from axios which is { success: true, data: { affiliate: {...} } }
            // Check multiple possible structures
            let affiliateData = null;

            if (response?.success && response?.data?.affiliate) {
                // Standard structure: { success: true, data: { affiliate: {...} } }
                affiliateData = response.data;
            } else if (response?.data?.affiliate) {
                // Nested structure: { data: { affiliate: {...} } }
                affiliateData = response.data;
            } else if (response?.affiliate) {
                // Direct structure: { affiliate: {...} }
                affiliateData = { affiliate: response.affiliate };
            } else {
                // No affiliate found - this is normal
                return rejectWithValue('NOT_AFFILIATE');
            }

            return affiliateData; // This should be { affiliate: {...} }
        } catch (error) {
            // Any error means user is not affiliate - silently handle
            return rejectWithValue('NOT_AFFILIATE');
        }
    }
);

export const fetchAffiliateStatistics = createAsyncThunk(
    'affiliate/fetchStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await affiliateService.getAffiliateStatistics();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
        }
    }
);

export const fetchCommissions = createAsyncThunk(
    'affiliate/fetchCommissions',
    async ({ filters = {}, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await affiliateService.getCommissions(filters, page, limit);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch commissions');
        }
    }
);

export const fetchWithdrawRequests = createAsyncThunk(
    'affiliate/fetchWithdrawRequests',
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await affiliateService.getWithdrawRequests(page, limit);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch withdraw requests');
        }
    }
);

export const createWithdraw = createAsyncThunk(
    'affiliate/createWithdraw',
    async (withdrawData, { rejectWithValue }) => {
        try {
            const response = await affiliateService.createWithdrawRequest(withdrawData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create withdraw request');
        }
    }
);

export const registerAffiliate = createAsyncThunk(
    'affiliate/register',
    async (affiliateData, { rejectWithValue }) => {
        try {
            const response = await affiliateService.registerAsAffiliate(affiliateData);
            console.log('registerAffiliate thunk - response:', response);
            console.log('registerAffiliate thunk - response.data:', response.data);
            console.log('registerAffiliate thunk - response.success:', response.success);

            // Check if response is successful
            if (response && response.success) {
                // Return the data structure that matches what the reducer expects
                return response.data || response;
            } else {
                throw new Error(response?.message || 'Registration failed');
            }
        } catch (error) {
            console.error('registerAffiliate thunk error:', error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to register as affiliate');
        }
    }
);

/**
 * Cancel affiliate registration
 */
export const cancelAffiliateRegistration = createAsyncThunk(
    'affiliate/cancel',
    async (_, { rejectWithValue }) => {
        try {
            const response = await affiliateService.cancelAffiliateRegistration();
            console.log('cancelAffiliateRegistration thunk - response:', response);
            return response;
        } catch (error) {
            console.error('cancelAffiliateRegistration thunk error:', error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Failed to cancel affiliate registration');
        }
    }
);

// Initial state
const initialState = {
    affiliate: null,
    statistics: null,
    commissions: [],
    withdrawRequests: [],
    loading: false,
    error: null,
    isAffiliate: false,
    affiliateStatus: null,
    pagination: {
        commissions: { page: 1, limit: 10, total: 0, pages: 0 },
        withdrawRequests: { page: 1, limit: 10, total: 0, pages: 0 }
    }
};

// Slice
const affiliateSlice = createSlice({
    name: 'affiliate',
    initialState,
    reducers: {
        clearAffiliate: (state) => {
            state.affiliate = null;
            state.statistics = null;
            state.commissions = [];
            state.withdrawRequests = [];
            state.isAffiliate = false;
            state.affiliateStatus = null;
        },
        setAffiliateStatus: (state, action) => {
            state.isAffiliate = action.payload.isAffiliate;
            state.affiliateStatus = action.payload.status;
        }
    },
    extraReducers: (builder) => {
        // Fetch profile
        builder
            .addCase(fetchAffiliateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAffiliateProfile.fulfilled, (state, action) => {
                state.loading = false;
                console.log('=== Redux: fetchAffiliateProfile fulfilled ===');
                console.log('Redux: action.payload:', action.payload);
                console.log('Redux: action.payload type:', typeof action.payload);
                console.log('Redux: action.payload keys:', action.payload ? Object.keys(action.payload) : []);
                console.log('Redux: action.payload.affiliate:', action.payload?.affiliate);
                console.log('Redux: action.payload.data:', action.payload?.data);
                console.log('Redux: action.payload.data?.affiliate:', action.payload?.data?.affiliate);

                // Handle response structure: 
                // Backend returns: { success: true, data: { affiliate: {...} } }
                // Service returns: response.data which is { success: true, data: { affiliate: {...} } }
                // Redux thunk returns: response.data which is { success: true, data: { affiliate: {...} } }
                // So action.payload is { success: true, data: { affiliate: {...} } }
                // We need to access: action.payload.data.affiliate
                let affiliate = null;

                if (action.payload?.affiliate) {
                    // Direct affiliate in payload
                    affiliate = action.payload.affiliate;
                    console.log('Redux: Found affiliate (direct):', affiliate);
                } else if (action.payload?.data?.affiliate) {
                    // Affiliate nested in data
                    affiliate = action.payload.data.affiliate;
                    console.log('Redux: Found affiliate (nested):', affiliate);
                } else {
                    console.warn('Redux: No affiliate found in payload');
                    console.warn('Redux: Full payload:', JSON.stringify(action.payload, null, 2));
                }

                if (affiliate) {
                    console.log('Redux: Setting affiliate state:', {
                        id: affiliate.id,
                        status: affiliate.status,
                        referralCode: affiliate.referralCode
                    });
                    state.affiliate = affiliate;
                    state.isAffiliate = true;
                    state.affiliateStatus = affiliate.status || 'pending';
                    console.log('Redux: ✅ Set isAffiliate=true, status=', state.affiliateStatus);
                } else {
                    console.warn('Redux: ❌ No affiliate found, setting isAffiliate=false');
                    state.isAffiliate = false;
                    state.affiliateStatus = null;
                    state.affiliate = null;
                }
                console.log('==========================================');
            })
            .addCase(fetchAffiliateProfile.rejected, (state, action) => {
                state.loading = false;
                // If error is 'NOT_AFFILIATE', it's normal - user is not registered as affiliate
                if (action.payload === 'NOT_AFFILIATE') {
                    state.error = null; // Don't set error for normal case
                } else {
                    state.error = action.payload;
                }
                state.isAffiliate = false;
                state.affiliateStatus = null;
                state.affiliate = null;
            });

        // Fetch statistics
        builder
            .addCase(fetchAffiliateStatistics.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAffiliateStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload;
            })
            .addCase(fetchAffiliateStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch commissions
        builder
            .addCase(fetchCommissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCommissions.fulfilled, (state, action) => {
                state.loading = false;
                state.commissions = action.payload.commissions || [];
                state.pagination.commissions = action.payload.pagination || state.pagination.commissions;
            })
            .addCase(fetchCommissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Fetch withdraw requests
        builder
            .addCase(fetchWithdrawRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWithdrawRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.withdrawRequests = action.payload.requests || [];
                state.pagination.withdrawRequests = action.payload.pagination || state.pagination.withdrawRequests;
            })
            .addCase(fetchWithdrawRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Create withdraw
        builder
            .addCase(createWithdraw.pending, (state) => {
                state.loading = true;
            })
            .addCase(createWithdraw.fulfilled, (state, action) => {
                state.loading = false;
                state.withdrawRequests.unshift(action.payload.request);
            })
            .addCase(createWithdraw.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Register affiliate
        builder
            .addCase(registerAffiliate.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerAffiliate.fulfilled, (state, action) => {
                state.loading = false;
                console.log('registerAffiliate fulfilled - action.payload:', action.payload);

                // Handle different response structures
                const affiliate = action.payload?.affiliate || action.payload;

                if (affiliate) {
                    state.affiliate = affiliate;
                    state.isAffiliate = true;
                    state.affiliateStatus = affiliate.status || 'pending';
                } else {
                    // If no affiliate data, still mark as affiliate with pending status
                    state.isAffiliate = true;
                    state.affiliateStatus = 'pending';
                }
            })
            .addCase(registerAffiliate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Cancel affiliate registration
        builder
            .addCase(cancelAffiliateRegistration.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(cancelAffiliateRegistration.fulfilled, (state) => {
                state.loading = false;
                state.affiliate = null;
                state.isAffiliate = false;
                state.affiliateStatus = null;
                state.statistics = null;
                state.commissions = [];
                state.withdrawRequests = [];
            })
            .addCase(cancelAffiliateRegistration.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearAffiliate, setAffiliateStatus } = affiliateSlice.actions;

// Selectors
export const selectAffiliate = (state) => state.affiliate.affiliate;
export const selectAffiliateStatistics = (state) => state.affiliate.statistics;
export const selectCommissions = (state) => state.affiliate.commissions;
export const selectWithdrawRequests = (state) => state.affiliate.withdrawRequests;
export const selectIsAffiliate = (state) => state.affiliate.isAffiliate;
export const selectAffiliateStatus = (state) => state.affiliate.affiliateStatus;
export const selectAffiliateLoading = (state) => state.affiliate.loading;
export const selectAffiliateError = (state) => state.affiliate.error;
export const selectAffiliatePagination = (state) => state.affiliate.pagination;

export default affiliateSlice.reducer;

