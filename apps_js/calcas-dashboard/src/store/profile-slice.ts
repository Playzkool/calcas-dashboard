import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ProfileData, ProfileFormType } from "../types";
import { getCsrfToken } from "../lib/csrf";

export const fetchProfile = createAsyncThunk(
    "profile/fetch",
    async (_, { rejectWithValue }) => {
        const res = await fetch("/api/my-profile/", { credentials: "include" });
        if (!res.ok) return rejectWithValue(await res.text());
        return res.json() as Promise<ProfileData>;
    }
);

export const updateProfile = createAsyncThunk(
    "profile/update",
    async (data: ProfileFormType, { rejectWithValue }) => {
        const body = new FormData();
        const fileFields: (keyof ProfileFormType)[] = ["pool_attestation"];
        for (const [key, value] of Object.entries(data)) {
            if (value === undefined || value === null) continue;
            if (fileFields.includes(key as keyof ProfileFormType)) {
                body.append(key, value as File);
            } else if (typeof value === "boolean") {
                body.append(key, value ? "true" : "false");
            } else {
                body.append(key, String(value));
            }
        }
        const res = await fetch("/api/my-profile/", {
            method: "PATCH",
            headers: { "X-CSRFToken": getCsrfToken() },
            credentials: "include",
            body,
        });
        if (!res.ok) {
            try {
                const err = await res.json();
                const messages = (Object.values(err) as string[][]).flat().join(" ");
                return rejectWithValue(messages);
            } catch {
                return rejectWithValue("Une erreur est survenue.");
            }
        }
        return res.json() as Promise<ProfileData>;
    }
);

interface ProfileState {
    data: ProfileData | null;
    fetchStatus: "idle" | "loading" | "succeeded" | "failed";
    fetchError: string | null;
    updateStatus: "idle" | "loading" | "succeeded" | "failed";
    updateError: string | null;
}

const initialState: ProfileState = {
    data: null,
    fetchStatus: "idle",
    fetchError: null,
    updateStatus: "idle",
    updateError: null,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        resetUpdateStatus(state) {
            state.updateStatus = "idle";
            state.updateError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => { state.fetchStatus = "loading"; })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.fetchStatus = "succeeded";
                state.data = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.fetchStatus = "failed";
                state.fetchError = action.payload as string;
            })
            .addCase(updateProfile.pending, (state) => { state.updateStatus = "loading"; state.updateError = null; })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.updateStatus = "succeeded";
                state.data = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.updateStatus = "failed";
                state.updateError = action.payload as string;
            });
    },
});

export const { resetUpdateStatus } = profileSlice.actions;
export default profileSlice.reducer;
