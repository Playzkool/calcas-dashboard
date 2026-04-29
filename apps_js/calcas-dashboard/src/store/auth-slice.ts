import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AuthUser } from "../types";
import { getCsrfToken } from "../lib/csrf";

export const fetchMe = createAsyncThunk(
    "auth/fetchMe",
    async (_, { rejectWithValue }) => {
        const res = await fetch("/api/me/", { credentials: "include" });
        if (!res.ok) return rejectWithValue("unauthenticated");
        return res.json() as Promise<AuthUser>;
    }
);

export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials: { username: string; password: string }, { rejectWithValue }) => {
        const res = await fetch("/api/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            credentials: "include",
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return rejectWithValue((data as { detail?: string }).detail ?? "Erreur de connexion.");
        }
        return res.json() as Promise<AuthUser>;
    }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
    await fetch("/api/logout/", {
        method: "POST",
        headers: { "X-CSRFToken": getCsrfToken() },
        credentials: "include",
    });
});

interface AuthState {
    user: AuthUser | null;
    status: "idle" | "loading" | "authenticated" | "unauthenticated";
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    status: "idle",
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMe.pending, (state) => { state.status = "loading"; })
            .addCase(fetchMe.fulfilled, (state, action) => {
                state.status = "authenticated";
                state.user = action.payload;
            })
            .addCase(fetchMe.rejected, (state) => {
                state.status = "unauthenticated";
                state.user = null;
            })
            .addCase(loginUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "authenticated";
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "unauthenticated";
                state.error = action.payload as string;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.status = "unauthenticated";
                state.user = null;
            });
    },
});

export default authSlice.reducer;