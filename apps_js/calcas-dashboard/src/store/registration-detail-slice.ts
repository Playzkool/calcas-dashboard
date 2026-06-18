import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RegistrationDetail } from "../types";
import { getCsrfToken } from "../lib/csrf";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export const fetchRegistrationDetail = createAsyncThunk(
    "registrationDetail/fetch",
    async (id: number, { rejectWithValue }) => {
        const res = await fetch(`${API_BASE}/api/registrations/${id}/`, { credentials: "include" });
        if (!res.ok) return rejectWithValue(await res.text());
        return res.json() as Promise<RegistrationDetail>;
    }
);

export const toggleRegistrationClosed = createAsyncThunk(
    "registrationDetail/toggleClosed",
    async ({ id, is_closed }: { id: number; is_closed: boolean }, { rejectWithValue }) => {
        const res = await fetch(`${API_BASE}/api/registrations/${id}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCsrfToken(),
            },
            credentials: "include",
            body: JSON.stringify({ is_closed }),
        });
        if (!res.ok) return rejectWithValue(await res.text());
        return { is_closed } as { is_closed: boolean };
    }
);

interface RegistrationDetailState {
    data: RegistrationDetail | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    toggleStatus: "idle" | "loading" | "succeeded" | "failed";
    toggleError: string | null;
}

const initialState: RegistrationDetailState = {
    data: null,
    status: "idle",
    error: null,
    toggleStatus: "idle",
    toggleError: null,
};

const registrationDetailSlice = createSlice({
    name: "registrationDetail",
    initialState,
    reducers: {
        clearDetail(state) {
            state.data = null;
            state.status = "idle";
            state.error = null;
            state.toggleStatus = "idle";
            state.toggleError = null;
        },
        resetToggle(state) {
            state.toggleStatus = "idle";
            state.toggleError = null;
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
            })
            .addCase(toggleRegistrationClosed.pending, (state) => {
                state.toggleStatus = "loading";
                state.toggleError = null;
            })
            .addCase(toggleRegistrationClosed.fulfilled, (state, action) => {
                state.toggleStatus = "succeeded";
                if (state.data) {
                    state.data.is_closed = action.payload.is_closed;
                }
            })
            .addCase(toggleRegistrationClosed.rejected, (state, action) => {
                state.toggleStatus = "failed";
                state.toggleError = action.payload as string;
            });
    },
});

export const { clearDetail, resetToggle } = registrationDetailSlice.actions;
export default registrationDetailSlice.reducer;
