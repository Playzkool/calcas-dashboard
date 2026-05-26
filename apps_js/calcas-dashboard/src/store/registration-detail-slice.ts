import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RegistrationDetail } from "../types";

export const fetchRegistrationDetail = createAsyncThunk(
    "registrationDetail/fetch",
    async (id: number, { rejectWithValue }) => {
        const res = await fetch(`/api/registrations/${id}/`, { credentials: "include" });
        if (!res.ok) return rejectWithValue(await res.text());
        return res.json() as Promise<RegistrationDetail>;
    }
);

interface RegistrationDetailState {
    data: RegistrationDetail | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: RegistrationDetailState = {
    data: null,
    status: "idle",
    error: null,
};

const registrationDetailSlice = createSlice({
    name: "registrationDetail",
    initialState,
    reducers: {
        clearDetail(state) {
            state.data = null;
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRegistrationDetail.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchRegistrationDetail.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.data = action.payload;
            })
            .addCase(fetchRegistrationDetail.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export const { clearDetail } = registrationDetailSlice.actions;
export default registrationDetailSlice.reducer;
