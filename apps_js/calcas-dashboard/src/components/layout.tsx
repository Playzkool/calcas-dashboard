import {
    AppBar,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Switch,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState, type ReactNode } from "react";
import type { AuthUser, UserRole } from "../types";
import logo from "../assets/logo.png";

const DRAWER_WIDTH = 220;

export type Page = "registration" | "registrations-list" | "legal-representatives" | "account" | "cgu" | "rgpd";

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
    const [mobileOpen, setMobileOpen] = useState(false);

    const drawerContent = (
        <>
            <Toolbar />
            <List sx={{ flexGrow: 1 }}>
                {navItems.map(({ label, page: p }) => (
                    <ListItem key={p} disablePadding>
                        <ListItemButton
                            selected={page === p}
                            onClick={() => { onNavigate(p); setMobileOpen(false); }}
                        >
                            <ListItemText primary={label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List dense>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={page === "cgu"}
                        onClick={() => { onNavigate("cgu"); setMobileOpen(false); }}
                    >
                        <ListItemText
                            primary="CGU"
                            primaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                        />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        selected={page === "rgpd"}
                        onClick={() => { onNavigate("rgpd"); setMobileOpen(false); }}
                    >
                        <ListItemText
                            primary="Données personnelles"
                            primaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setMobileOpen(true)}
                        sx={{ mr: 1, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}>
                        <img src={logo} alt="Calandreta Castanet Tolosan" style={{ height: 40 }} />
                    </Box>
                    <Typography variant="body2" sx={{ mr: 1, display: { xs: "none", sm: "block" } }}>
                        {mode === "dark" ? "Sombre" : "Clair"}
                    </Typography>
                    <Switch checked={mode === "dark"} onChange={onToggleMode} size="small" />
                    <Typography variant="body2" sx={{ mx: 2, display: { xs: "none", md: "block" } }}>
                        {user.username}
                    </Typography>
                    <Button color="inherit" size="small" onClick={onLogout}>
                        Déconnexion
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Drawer mobile — s'ouvre en overlay */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", sm: "none" },
                    "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", display: "flex", flexDirection: "column" },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Drawer desktop — toujours visible */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", sm: "block" },
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", display: "flex", flexDirection: "column" },
                }}
                open
            >
                {drawerContent}
            </Drawer>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minWidth: 0,
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
