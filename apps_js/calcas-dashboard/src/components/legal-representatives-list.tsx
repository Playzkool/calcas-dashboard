import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
    createLegalRepresentative,
    fetchLegalRepresentatives,
    resetCreateStatus,
} from "../store/legal-representatives-slice";

export function LegalRepresentativesList() {
    const dispatch = useAppDispatch();
    const { items, fetchStatus, fetchError, createStatus, createError } = useAppSelector(
        (s) => s.legalRepresentatives
    );

    const [dialogOpen, setDialogOpen] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (fetchStatus === "idle") dispatch(fetchLegalRepresentatives());
    }, [dispatch, fetchStatus]);

    useEffect(() => {
        if (createStatus === "succeeded") {
            setDialogOpen(false);
            setEmail("");
            dispatch(resetCreateStatus());
            dispatch(fetchLegalRepresentatives());
        }
    }, [createStatus, dispatch]);

    const handleOpenDialog = () => {
        dispatch(resetCreateStatus());
        setEmail("");
        setDialogOpen(true);
    };

    if (fetchStatus === "idle" || fetchStatus === "loading") {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (fetchStatus === "failed") {
        return <Alert severity="error">{fetchError ?? "Erreur lors du chargement."}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5">Représentants légaux</Typography>
                <Button variant="contained" onClick={handleOpenDialog}>
                    Nouveau représentant
                </Button>
            </Box>

            {items.length === 0 ? (
                <Typography color="text.secondary">Aucun représentant légal enregistré.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Email</TableCell>
                                <TableCell>Date de création</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.email || item.username}</TableCell>
                                    <TableCell>
                                        {new Date(item.date_creation).toLocaleDateString("fr-FR")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Nouveau représentant légal</DialogTitle>
                <DialogContent>
                    {createStatus === "failed" && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {createError ?? "Une erreur est survenue."}
                        </Alert>
                    )}
                    <TextField
                        label="Adresse email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && email.trim()) dispatch(createLegalRepresentative(email.trim())); }}
                        fullWidth
                        autoFocus
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={createStatus === "loading"}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => { if (email.trim()) dispatch(createLegalRepresentative(email.trim())); }}
                        disabled={!email.trim() || createStatus === "loading"}
                    >
                        {createStatus === "loading" ? <CircularProgress size={20} /> : "Créer"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
