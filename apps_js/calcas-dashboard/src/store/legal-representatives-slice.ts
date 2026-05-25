import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCsrfToken } from "../lib/csrf";

export interface LegalRepresentativeItem {
    id: number;
    username: string;
    email: string;
    date_creation: string;
}

export const fetchLegalRepresentatives = createAsyncThunk(
    "legalRepresentatives/fetch",
    async (_, { rejectWithValue }) => {
        const res = await fetch("/api/legal-representatives/", { credentials: "include" });
        if (!res.ok) return rejectWithValue(await res.text());
        return res.json() as Promise<LegalRepresentativeItem[]>;
    }
);

export const createLegalRepresentative = createAsyncThunk(
    "legalRepresentatives/create",
    async (email: string, { rejectWithValue }) => {
        const res = await fetch("/api/legal-representatives/", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
            credentials: "include",
            body: JSON.stringify({ email }),
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

interface LegalRepresentativesState {
    items: LegalRepresentativeItem[];
    fetchStatus: "idle" | "loading" | "succeeded" | "failed";
    fetchError: string | null;
    createStatus: "idle" | "loading" | "succeeded" | "failed";
    createError: string | null;
}

const initialState: LegalRepresentativesState = {
    items: [],
    fetchStatus: "idle",
    fetchError: null,
    createStatus: "idle",
    createError: null,
};

const legalRepresentativesSlice = createSlice({
    name: "legalRepresentatives",
    initialState,
    reducers: {
        resetCreateStatus(state) {
            state.createStatus = "idle";
            state.createError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLegalRepresentatives.pending, (state) => { state.fetchStatus = "loading"; })
            .addCase(fetchLegalRepresentatives.fulfilled, (state, action) => {
                state.fetchStatus = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchLegalRepresentatives.rejected, (state, action) => {
                state.fetchStatus = "failed";
                state.fetchError = action.payload as string;
            })
            .addCase(createLegalRepresentative.pending, (state) => { state.createStatus = "loading"; })
            .addCase(createLegalRepresentative.fulfilled, (state) => { state.createStatus = "succeeded"; })
            .addCase(createLegalRepresentative.rejected, (state, action) => {
                state.createStatus = "failed";
                state.createError = action.payload as string;
            });
    },
});

export const { resetCreateStatus } = legalRepresentativesSlice.actions;
export default legalRepresentativesSlice.reducer;