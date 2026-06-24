import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export interface MyRegistrationItem {
    id: number;
    firstname: string;
    lastname: string;
    birth_date: string;
    grade: number;
    grade_label: string;
    document_url: string | null;
    completion_pct: number;
    is_closed: boolean;
}

export const fetchMyRegistrations = createAsyncThunk(
    "myRegistrations/fetch",
    async (_, { rejectWithValue }) => {
        const res = await fetch("/api/my-registrations/", { credentials: "include" });
        if (!res.ok) return rejectWithValue(await res.text());
        return res.json() as Promise<MyRegistrationItem[]>;
    }
);

interface MyRegistrationsState {
    items: MyRegistrationItem[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: MyRegistrationsState = { items: [], status: "idle", error: null };

const myRegistrationsSlice = createSlice({
    name: "myRegistrations",
    initialState,
    reducers: {
        resetMyRegistrations(state) {
            state.status = "idle";
            state.items = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyRegistrations.pending, (state) => { state.status = "loading"; })
            .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchMyRegistrations.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            });
    },
});

export const { resetMyRegistrations } = myRegistrationsSlice.actions;
export default myRegistrationsSlice.reducer;
