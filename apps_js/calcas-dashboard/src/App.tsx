import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Layout, type Page } from "./components/layout";
import { LoginPage } from "./components/login-page";
import { RegistrationForm } from "./components/registration-form";
import { RegistrationsList } from "./components/registrations-list";
import { useAppDispatch, useAppSelector } from "./hooks";
import { fetchMe, logoutUser } from "./store/auth-slice";
import type { UserRole } from "./types";

const ROLE_DEFAULT_PAGE: Record<UserRole, Page> = {
    legal_representative: "registration",
    registration_supervisor: "registrations-list",
};

const PAGE_COMPONENTS: Record<Page, React.ReactNode> = {
    registration: <RegistrationForm />,
    "registrations-list": <RegistrationsList />,
};

function App() {
    const dispatch = useAppDispatch();
    const { status, user } = useAppSelector((s) => s.auth);

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [mode, setMode] = useState<"light" | "dark">(prefersDark ? "dark" : "light");
    const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

    const [page, setPage] = useState<Page>("registration");

    useEffect(() => { dispatch(fetchMe()); }, [dispatch]);

    useEffect(() => {
        if (user) setPage(ROLE_DEFAULT_PAGE[user.role]);
    }, [user]);

    let content: React.ReactNode;
    if (status === "idle" || status === "loading") {
        content = (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    } else if (status === "unauthenticated") {
        content = <LoginPage />;
    } else {
        content = (
            <Layout
                mode={mode}
                onToggleMode={() => setMode((m) => (m === "light" ? "dark" : "light"))}
                user={user!}
                onLogout={() => dispatch(logoutUser())}
                page={page}
                onNavigate={setPage}
            >
                {PAGE_COMPONENTS[page]}
            </Layout>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {content}
        </ThemeProvider>
    );
}

export default App;