import { useMemo, useState } from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { Layout, type Page } from "./components/layout";
import { RegistrationForm } from "./components/registration-form";

const PAGES: Record<Page, React.ReactNode> = {
    registration: <RegistrationForm />,
};

function App() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [mode, setMode] = useState<"light" | "dark">(prefersDark ? "dark" : "light");
    const [page, setPage] = useState<Page>("registration");

    const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Layout
                mode={mode}
                onToggleMode={() => setMode((m) => (m === "light" ? "dark" : "light"))}
                page={page}
                onNavigate={setPage}
            >
                {PAGES[page]}
            </Layout>
        </ThemeProvider>
    );
}

export default App;