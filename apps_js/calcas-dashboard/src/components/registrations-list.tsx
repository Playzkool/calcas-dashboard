import { useEffect, useState } from "react";
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
    Tooltip,
    Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchRegistrations } from "../store/registrations-list-slice";
import { RegistrationDetailView } from "./registration-detail";

export function RegistrationsList() {
    const dispatch = useAppDispatch();
    const { items, status, error } = useAppSelector((s) => s.registrationsList);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        if (status === "idle") dispatch(fetchRegistrations());
    }, [dispatch, status]);

    // Si un item est sélectionné, afficher la vue détail
    if (selectedId !== null) {
        return (
            <RegistrationDetailView
                id={selectedId}
                onBack={() => setSelectedId(null)}
            />
        );
    }

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
                                <Tooltip title="Voir le dossier complet" key={item.id} placement="left">
                                    <TableRow
                                        hover
                                        onClick={() => setSelectedId(item.id)}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        <TableCell>{item.firstname}</TableCell>
                                        <TableCell>{item.lastname}</TableCell>
                                        <TableCell>{item.birth_date}</TableCell>
                                        <TableCell>{item.grade_label}</TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            {item.document_url ? (
                                                <a href={item.document_url} target="_blank" rel="noreferrer">
                                                    Voir
                                                </a>
                                            ) : (
                                                "—"
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </Tooltip>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
