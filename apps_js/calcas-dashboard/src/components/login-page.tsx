import { useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    TextField,
} from "@mui/material";
import logo from "../assets/logo.png";
import { useAppDispatch, useAppSelector } from "../hooks";
import { loginUser } from "../store/auth-slice";

export function LoginPage() {
    const dispatch = useAppDispatch();
    const { status, error } = useAppSelector((s) => s.auth);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(loginUser({ username, password }));
    };

    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <Card sx={{ width: 360 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                        <img src={logo} alt="Calandreta Castanet Tolosan" style={{ height: 80 }} />
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                label="Identifiant"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                autoFocus
                            />
                            <TextField
                                label="Mot de passe"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            {error && <Alert severity="error">{error}</Alert>}
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={status === "loading"}
                                startIcon={
                                    status === "loading" ? <CircularProgress size={16} color="inherit" /> : null
                                }
                            >
                                {status === "loading" ? "Connexion…" : "Se connecter"}
                            </Button>
                        </Stack>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}