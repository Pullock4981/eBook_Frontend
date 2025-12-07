/**
 * User Slice
 * 
 * Redux slice for user profile and address management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../../services/userService';

// Initial state
const initialState = {
    profile: null,
    addresses: [],
    isLoading: false,
    isUpdating: false,
    error: null
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userService.getCurrentUser();
            return response.data.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch profile'
            );
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await userService.updateProfile(profileData);
            return response.data.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to update profile'
            );
        }
    }
);

export const changeUserPassword = createAsyncThunk(
    'user/changePassword',
    async ({ currentPassword, newPassword }, { rejectWithValue }) => {
        try {
            const response = await userService.changePassword(currentPassword, newPassword);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to change password'
            );
        }
    }
);

export const fetchAddresses = createAsyncThunk(
    'user/fetchAddresses',
    async (_, { rejectWithValue }) => {
        try {
            const response = await userService.getAddresses();
            // API interceptor returns response.data, so response is already { success, message, data }
            // Backend returns: { success: true, message: '...', data: addresses }
            if (response && response.data) {
                return Array.isArray(response.data) ? response.data : [];
            }
            // Fallback: if response is array directly
            if (Array.isArray(response)) {
                return response;
            }
            return [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch addresses'
            );
        }
    }
);

export const createAddress = createAsyncThunk(
    'user/createAddress',
    async (addressData, { rejectWithValue }) => {
        try {
            const response = await userService.addAddress(addressData);
            return response.data.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to create address'
            );
        }
    }
);

export const updateAddress = createAsyncThunk(
    'user/updateAddress',
    async ({ addressId, addressData }, { rejectWithValue }) => {
        try {
            const response = await userService.updateAddress(addressId, addressData);
            return response.data.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to update address'
            );
        }
    }
);

export const deleteAddress = createAsyncThunk(
    'user/deleteAddress',
    async (addressId, { rejectWithValue }) => {
        try {
            await userService.deleteAddress(addressId);
            return addressId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to delete address'
            );
        }
    }
);

// User slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearProfile: (state) => {
            state.profile = null;
            state.addresses = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update profile
            .addCase(updateUserProfile.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload;
            })
            // Change password
            .addCase(changeUserPassword.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(changeUserPassword.fulfilled, (state) => {
                state.isUpdating = false;
                state.error = null;
            })
            .addCase(changeUserPassword.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload;
            })
            // Fetch addresses
            .addCase(fetchAddresses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.isLoading = false;
                state.addresses = action.payload || [];
                state.error = null;
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create address
            .addCase(createAddress.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(createAddress.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.addresses = [...state.addresses, action.payload];
                state.error = null;
            })
            .addCase(createAddress.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload;
            })
            // Update address
            .addCase(updateAddress.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.addresses = state.addresses.map(addr =>
                    addr._id === action.payload._id ? action.payload : addr
                );
                state.error = null;
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload;
            })
            // Delete address
            .addCase(deleteAddress.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.addresses = state.addresses.filter(addr => addr._id !== action.payload);
                state.error = null;
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload;
            });
    }
});

// Actions
export const { clearError, clearProfile } = userSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.user.profile;
export const selectUserAddresses = (state) => state.user.addresses;
export const selectUserLoading = (state) => state.user.isLoading;
export const selectUserUpdating = (state) => state.user.isUpdating;
export const selectUserError = (state) => state.user.error;

export default userSlice.reducer;

