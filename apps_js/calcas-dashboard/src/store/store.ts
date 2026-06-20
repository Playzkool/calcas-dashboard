import { configureStore } from "@reduxjs/toolkit";
import accountReducer from "./account-slice";
import authReducer from "./auth-slice";
import legalRepresentativesReducer from "./legal-representatives-slice";
import myRegistrationsReducer from "./my-registrations-slice";
import profileReducer from "./profile-slice";
import registrationReducer from "./registration-slice";
import registrationDetailReducer from "./registration-detail-slice";
import registrationsListReducer from "./registrations-list-slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        account: accountReducer,
        myRegistrations: myRegistrationsReducer,
        profile: profileReducer,
        registration: registrationReducer,
        registrationDetail: registrationDetailReducer,
        registrationsList: registrationsListReducer,
        legalRepresentatives: legalRepresentativesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;