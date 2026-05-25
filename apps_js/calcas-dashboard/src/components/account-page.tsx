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
    const { info, fetchStatus, fetchError, createStatus, createError } = useAppSelector(
        (s) => s.account
    );

    const [dialogOpen, setDialogOpen] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (fetchStatus === "idle") dispatch(fetchAccountInfo());
    }, [dispatch, fetchStatus]);

    useEffect(() => {
        if (createStatus === "succeeded") {
            setDialogOpen(false);
            setEmail("");
            dispatch(resetCreateStatus());
            dispatch(fetchAccountInfo());
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
            <Typography variant="h5" mb={3}>Mon compte</Typography>

            {!info?.has_pupil ? (
                <Typography color="text.secondary">
                    Aucun dossier d'inscription soumis. Soumettez d'abord le formulaire d'inscription.
                </Typography>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Élève</Typography>
                        <Typography>{info.pupil_firstname} {info.pupil_lastname}</Typography>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary">Co-représentant légal</Typography>
                        {info.co_representative_email ? (
                            <Typography>{info.co_representative_email}</Typography>
                        ) : (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}>
                                <Typography color="text.secondary" variant="body2">Aucun</Typography>
                                <Button variant="outlined" size="small" onClick={handleOpenDialog}>
                                    Ajouter un représentant légal
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
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
                        onKeyDown={(e) => { if (e.key === "Enter" && email.trim()) dispatch(createCoRepresentative(email.trim())); }}
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
                        onClick={() => { if (email.trim()) dispatch(createCoRepresentative(email.trim())); }}
                        disabled={!email.trim() || createStatus === "loading"}
                    >
                        {createStatus === "loading" ? <CircularProgress size={20} /> : "Ajouter"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
