import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RegistrationFormType } from "../types";
import { getCsrfToken } from "../lib/csrf";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const FILE_FIELDS: (keyof RegistrationFormType)[] = [
    "document",
    "vaccination_document",
    "insurance_document",
    "divorce_judgment",
];

const JSON_FIELDS: (keyof RegistrationFormType)[] = [
    "diseases_history",
    "emergency_contacts",
    "authorized_pickup_persons",
];

export const submitRegistration = createAsyncThunk(
    "registration/submit",
    async (data: RegistrationFormType, { rejectWithValue }) => {
        const body = new FormData();

        for (const [key, value] of Object.entries(data) as [keyof RegistrationFormType, unknown][]) {
            if (value === undefined || value === null) continue;

            if (FILE_FIELDS.includes(key)) {
                body.append(key, value as File);
            } else if (JSON_FIELDS.includes(key)) {
                body.append(key, JSON.stringify(value));
            } else if (key === "birth_date" && value instanceof Date) {
                body.append(key, value.toISOString().split("T")[0]);
            } else if (typeof value === "boolean") {
                body.append(key, value ? "true" : "false");
            } else {
                body.append(key, String(value));
            }
        }

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
