import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth-slice";
import registrationReducer from "./registration-slice";
import registrationsListReducer from "./registrations-list-slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        registration: registrationReducer,
        registrationsList: registrationsListReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;