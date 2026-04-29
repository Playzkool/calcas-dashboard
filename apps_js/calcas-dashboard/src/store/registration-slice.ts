import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RegistrationFormType } from "../types";
import { getCsrfToken } from "../lib/csrf";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export const submitRegistration = createAsyncThunk(
    "registration/submit",
    async (data: RegistrationFormType, { rejectWithValue }) => {
        const body = new FormData();
        body.append("firstname", data.firstname);
        body.append("lastname", data.lastname);
        body.append("birth_date", data.birth_date.toISOString().split("T")[0]);
        body.append("grade", String(data.grade));
body.append("document", data.document);

        const res = await fetch(`${API_BASE}/api/registrations/`, {
            method: "POST",
            headers: { "X-CSRFToken": getCsrfToken() },
            credentials: "include",
            body,
        });

        if (!res.ok) {
            return rejectWithValue(await res.text());
        }
        return res.json();
    }
);

interface RegistrationState {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: RegistrationState = {
    status: "idle",
    error: null,
};

const registrationSlice = createSlice({
    name: "registration",
    initialState,
    reducers: {
        resetRegistration(state) {
            state.status = "idle";
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitRegistration.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(submitRegistration.fulfilled, (state) => {
                state.status = "succeeded";
            })
            .addCase(submitRegistration.rejected, (state, action) => {
                state.status = "failed";
                state.error = (action.payload as string) ?? action.error.message ?? "Erreur inconnue";
            });
    },
});

export const { resetRegistration } = registrationSlice.actions;
export default registrationSlice.reducer;