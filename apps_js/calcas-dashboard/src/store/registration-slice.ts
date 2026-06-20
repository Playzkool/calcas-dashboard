import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RegistrationFormType } from "../types";
import { getCsrfToken } from "../lib/csrf";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

const FILE_FIELDS: (keyof RegistrationFormType)[] = [
    "photo",
    "document",
    "document_2",
    "document_3",
    "document_4",
    "document_5",
    "document_6",
    "document_7",
    "document_8",
    "document_9",
    "document_10",
    "vaccination_document",
    "insurance_document",
    "divorce_judgment",
];

const JSON_FIELDS: (keyof RegistrationFormType)[] = [
    "diseases_history",
    "emergency_contacts",
    "authorized_pickup_persons",
];

function buildFormData(data: RegistrationFormType): FormData {
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
    return body;
}

export const submitRegistration = createAsyncThunk(
    "registration/submit",
    async (data: RegistrationFormType, { rejectWithValue }) => {
        const res = await fetch(`${API_BASE}/api/registrations/`, {
            method: "POST",
            headers: { "X-CSRFToken": getCsrfToken() },
            credentials: "include",
            body: buildFormData(data),
        });
        if (!res.ok) return rejectWithValue(await res.text());
        return res.json();
    }
);

export const updateRegistration = createAsyncThunk(
    "registration/update",
    async ({ id, data }: { id: number; data: RegistrationFormType }, { rejectWithValue }) => {
        const res = await fetch(`${API_BASE}/api/registrations/${id}/`, {
            method: "PATCH",
            headers: { "X-CSRFToken": getCsrfToken() },
            credentials: "include",
            body: buildFormData(data),
        });
        if (!res.ok) return rejectWithValue(await res.text());
        return res.json();
    }
);

interface RegistrationState {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    updateStatus: "idle" | "loading" | "succeeded" | "failed";
    updateError: string | null;
}

const initialState: RegistrationState = {
    status: "idle",
    error: null,
    updateStatus: "idle",
    updateError: null,
};

const registrationSlice = createSlice({
    name: "registration",
    initialState,
    reducers: {
        resetRegistration(state) {
            state.status = "idle";
            state.error = null;
        },
        resetUpdateRegistration(state) {
            state.updateStatus = "idle";
            state.updateError = null;
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
            })
            .addCase(updateRegistration.pending, (state) => {
                state.updateStatus = "loading";
                state.updateError = null;
            })
            .addCase(updateRegistration.fulfilled, (state) => {
                state.updateStatus = "succeeded";
            })
            .addCase(updateRegistration.rejected, (state, action) => {
                state.updateStatus = "failed";
                state.updateError = (action.payload as string) ?? action.error.message ?? "Erreur inconnue";
            });
    },
});

export const { resetRegistration, resetUpdateRegistration } = registrationSlice.actions;
export default registrationSlice.reducer;
