import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks";
import { resetRegistration } from "../store/registration-slice";
import { fetchMyRegistrations } from "../store/my-registrations-slice";
import { RegistrationForm } from "./registration-form";

export function RegistrationPage() {
    const dispatch = useAppDispatch();
    const { items, status: fetchStatus, error: fetchError } = useAppSelector((s) => s.myRegistrations);
    const registrationStatus = useAppSelector((s) => s.registration.status);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (fetchStatus === "idle") dispatch(fetchMyRegistrations());
    }, [dispatch, fetchStatus]);

    useEffect(() => {
        if (registrationStatus === "succeeded") {
            setShowForm(false);
            dispatch(resetRegistration());
            dispatch(fetchMyRegistrations());
        }
    }, [registrationStatus, dispatch]);

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

    if (items.length === 0 || showForm) {
        return (
            <Box>
                {items.length > 0 && (
                    <Button sx={{ mb: 1 }} onClick={() => setShowForm(false)}>
                        ← Retour
                    </Button>
                )}
                <RegistrationForm />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5">Inscription – année en cours</Typography>
                <Button variant="contained" onClick={() => setShowForm(true)}>
                    Nouvelle inscription
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Prénom</TableCell>
                            <TableCell>Nom</TableCell>
                            <TableCell>Date de naissance</TableCell>
                            <TableCell>Niveau</TableCell>
                            <TableCell>Document</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.firstname}</TableCell>
                                <TableCell>{item.lastname}</TableCell>
                                <TableCell>{item.birth_date}</TableCell>
                                <TableCell>{item.grade_label}</TableCell>
                                <TableCell>
                                    {item.document_url ? (
                                        <a href={item.document_url} target="_blank" rel="noreferrer">
                                            Voir
                                        </a>
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
