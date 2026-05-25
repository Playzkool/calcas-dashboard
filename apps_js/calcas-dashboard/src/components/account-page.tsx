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
    createCoRepresentative,
    fetchAccountInfo,
    resetCreateStatus,
} from "../store/account-slice";

export function AccountPage() {
    const dispatch = useAppDispatch();
    const { pupils, fetchStatus, fetchError, createStatus, createError } = useAppSelector(
        (s) => s.account
    );

    const [activePupilId, setActivePupilId] = useState<number | null>(null);
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (fetchStatus === "idle") dispatch(fetchAccountInfo());
    }, [dispatch, fetchStatus]);

    useEffect(() => {
        if (createStatus === "succeeded") {
            setActivePupilId(null);
            setEmail("");
            dispatch(resetCreateStatus());
            dispatch(fetchAccountInfo());
        }
    }, [createStatus, dispatch]);

    const handleOpenDialog = (pupilId: number) => {
        dispatch(resetCreateStatus());
        setEmail("");
        setActivePupilId(pupilId);
    };

    const handleSubmit = () => {
        if (email.trim() && activePupilId !== null) {
            dispatch(createCoRepresentative({ email: email.trim(), pupilId: activePupilId }));
        }
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
            <Typography variant="h5" mb={3}>Mon compte</Typography>

            {pupils.length === 0 ? (
                <Typography color="text.secondary">
                    Aucun dossier d'inscription soumis. Soumettez d'abord le formulaire d'inscription.
                </Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Prénom</TableCell>
                                <TableCell>Nom</TableCell>
                                <TableCell>Niveau</TableCell>
                                <TableCell>Co-représentant légal</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pupils.map((entry) => (
                                <TableRow key={entry.pupil_id}>
                                    <TableCell>{entry.pupil_firstname}</TableCell>
                                    <TableCell>{entry.pupil_lastname}</TableCell>
                                    <TableCell>{entry.grade_label}</TableCell>
                                    <TableCell>
                                        {entry.co_representative_email ?? (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleOpenDialog(entry.pupil_id)}
                                            >
                                                Ajouter un représentant légal
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={activePupilId !== null} onClose={() => setActivePupilId(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Ajouter un représentant légal</DialogTitle>
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
                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                        fullWidth
                        autoFocus
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setActivePupilId(null)} disabled={createStatus === "loading"}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!email.trim() || createStatus === "loading"}
                    >
                        {createStatus === "loading" ? <CircularProgress size={20} /> : "Ajouter"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
