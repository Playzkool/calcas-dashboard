import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCsrfToken } from "../lib/csrf";

export interface PupilAccountEntry {
    pupil_id: number;
    pupil_firstname: string;
    pupil_lastname: string;
    grade_label: string;
    co_representative_email: string | null;
}

export const fetchAccountInfo = createAsyncThunk(
    "account/fetch",
    async (_, { rejectWithValue }) => {
        const res = await fetch("/api/co-representative/", { credentials: "include" });
        if (!res.ok) return rejectWithValue(await res.text());
        return res.json() as Promise<PupilAccountEntry[]>;
    }
);

export const createCoRepresentative = createAsyncThunk(
    "account/createCoRepresentative",
    async ({ email, pupilId }: { email: string; pupilId: number }, { rejectWithValue }) => {
        const res = await fetch("/api/co-representative/", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
            credentials: "include",
            body: JSON.stringify({ email, pupil_id: pupilId }),
        });
        if (!res.ok) {
            try {
                const data = await res.json();
                const messages = (Object.values(data) as string[][]).flat().join(" ");
                return rejectWithValue(messages);
            } catch {
                return rejectWithValue("Une erreur est survenue.");
            }
        }
        return res.json() as Promise<{ id: number }>;
    }
);

interface AccountState {
    pupils: PupilAccountEntry[];
    fetchStatus: "idle" | "loading" | "succeeded" | "failed";
    fetchError: string | null;
    createStatus: "idle" | "loading" | "succeeded" | "failed";
    createError: string | null;
}

const initialState: AccountState = {
    pupils: [],
    fetchStatus: "idle",
    fetchError: null,
    createStatus: "idle",
    createError: null,
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        resetCreateStatus(state) {
            state.createStatus = "idle";
            state.createError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccountInfo.pending, (state) => { state.fetchStatus = "loading"; })
            .addCase(fetchAccountInfo.fulfilled, (state, action) => {
                state.fetchStatus = "succeeded";
                state.pupils = action.payload;
            })
            .addCase(fetchAccountInfo.rejected, (state, action) => {
                state.fetchStatus = "failed";
                state.fetchError = action.payload as string;
            })
            .addCase(createCoRepresentative.pending, (state) => { state.createStatus = "loading"; })
            .addCase(createCoRepresentative.fulfilled, (state) => { state.createStatus = "succeeded"; })
            .addCase(createCoRepresentative.rejected, (state, action) => {
                state.createStatus = "failed";
                state.createError = action.payload as string;
            });
    },
});

export const { resetCreateStatus } = accountSlice.actions;
export default accountSlice.reducer;
