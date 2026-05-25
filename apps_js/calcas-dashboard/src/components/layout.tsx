import {
    AppBar,
    Box,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Switch,
    Toolbar,
    Typography,
} from "@mui/material";
import { type ReactNode } from "react";
import type { AuthUser, UserRole } from "../types";
import logo from "../assets/logo.png";

const DRAWER_WIDTH = 220;

export type Page = "registration" | "registrations-list" | "legal-representatives" | "account";

const NAV_ITEMS: { label: string; page: Page; role: UserRole }[] = [
    { label: "Inscription", page: "registration", role: "legal_representative" },
    { label: "Mon compte", page: "account", role: "legal_representative" },
    { label: "Inscriptions", page: "registrations-list", role: "registration_supervisor" },
    { label: "Représentants légaux", page: "legal-representatives", role: "registration_supervisor" },
];

interface LayoutProps {
    mode: "light" | "dark";
    onToggleMode: () => void;
    user: AuthUser;
    onLogout: () => void;
    page: Page;
    onNavigate: (page: Page) => void;
    children: ReactNode;
}

export function Layout({ mode, onToggleMode, user, onLogout, page, onNavigate, children }: LayoutProps) {
    const navItems = NAV_ITEMS.filter((item) => item.role === user.role);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <img src={logo} alt="Calandreta Castanet Tolosan" style={{ height: 48 }} />
                    </Box>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                        {mode === "dark" ? "Sombre" : "Clair"}
                    </Typography>
                    <Switch checked={mode === "dark"} onChange={onToggleMode} size="small" />
                    <Typography variant="body2" sx={{ mx: 2 }}>
                        {user.username}
                    </Typography>
                    <Button color="inherit" size="small" onClick={onLogout}>
                        Déconnexion
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
                }}
            >
                <Toolbar />
                <List>
                    {navItems.map(({ label, page: p }) => (
                        <ListItem key={p} disablePadding>
                            <ListItemButton selected={page === p} onClick={() => onNavigate(p)}>
                                <ListItemText primary={label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}