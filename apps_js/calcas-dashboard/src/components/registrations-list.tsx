import { useEffect } from "react";
import {
    Alert,
    Box,
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
import { fetchRegistrations } from "../store/registrations-list-slice";

export function RegistrationsList() {
    const dispatch = useAppDispatch();
    const { items, status, error } = useAppSelector((s) => s.registrationsList);

    useEffect(() => {
        if (status === "idle") dispatch(fetchRegistrations());
    }, [dispatch, status]);

    if (status === "idle" || status === "loading") {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (status === "failed") {
        return <Alert severity="error">{error ?? "Erreur lors du chargement."}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h5" mb={3}>
                Inscriptions – année en cours
            </Typography>
            {items.length === 0 ? (
                <Typography color="text.secondary">Aucune inscription pour l'année en cours.</Typography>
            ) : (
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
            )}
        </Box>
    );
}