import { combineReducers, configureStore } from "@reduxjs/toolkit";
import accountReducer from "./account-slice";
import authReducer, { logoutUser } from "./auth-slice";
import legalRepresentativesReducer from "./legal-representatives-slice";
import myRegistrationsReducer from "./my-registrations-slice";
import profileReducer from "./profile-slice";
import registrationReducer from "./registration-slice";
import registrationDetailReducer from "./registration-detail-slice";
import registrationsListReducer from "./registrations-list-slice";

const combinedReducer = combineReducers({
    auth: authReducer,
    account: accountReducer,
    myRegistrations: myRegistrationsReducer,
    profile: profileReducer,
    registration: registrationReducer,
    registrationDetail: registrationDetailReducer,
    registrationsList: registrationsListReducer,
    legalRepresentatives: legalRepresentativesReducer,
});

// On logout, reset every slice to its initialState by passing undefined as state.
const rootReducer: typeof combinedReducer = (state, action) => {
    if (logoutUser.fulfilled.match(action)) {
        return combinedReducer(undefined, action);
    }
    return combinedReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;