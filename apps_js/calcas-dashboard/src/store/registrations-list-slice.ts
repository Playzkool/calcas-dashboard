import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface RegistrationListItem {
    id: number;
    firstname: string;
    lastname: string;
    birth_date: string;
    grade: number;
    grade_label: string;
    completion_pct: number;
    is_closed: boolean;
}

export const fetchRegistrations = createAsyncThunk(
    "registrationsList/fetch",
    async (_, { rejectWithValue }) => {
        const res = await fetch("/api/registrations/", { credentials: "include" });
        if (!res.ok) return rejectWithValue(await res.text());
        return res.json() as Promise<RegistrationListItem[]>;
    }
);

interface RegistrationsListState {
    items: RegistrationListItem[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: RegistrationsListState = {
    items: [],
    status: "idle",
    error: null,
};

const registrationsListSlice = createSlice({
    name: "registrationsList",
    initialState,
    reducers: {
        resetRegistrationsList(state) {
            state.status = "idle";
            state.items = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRegistrations.pending, (state) => { state.status = "loading"; })
            .addCase(fetchRegistrations.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchRegistrations.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export const { resetRegistrationsList } = registrationsListSlice.actions;
export default registrationsListSlice.reducer;