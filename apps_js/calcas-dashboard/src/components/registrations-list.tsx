import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    CircularProgress,
    IconButton,
    LinearProgress,
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
import DownloadIcon from "@mui/icons-material/Download";
import { useAppDispatch, useAppSelector } from "../hooks";
import { fetchRegistrations } from "../store/registrations-list-slice";
import { RegistrationDetailView } from "./registration-detail";

// ─── Completion badge ─────────────────────────────────────────────────────────

function CompletionCell({ pct }: { pct: number }) {
    const color =
        pct >= 80 ? "success" :
        pct >= 50 ? "warning" :
        "error";

    return (
        <Box sx={{ minWidth: 100 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                    {pct} %
                </Typography>
            </Box>
            <LinearProgress
                variant="determinate"
                value={pct}
                color={color}
                sx={{ height: 6, borderRadius: 3 }}
            />
        </Box>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RegistrationsList() {
    const dispatch = useAppDispatch();
    const { items, status, error } = useAppSelector((s) => s.registrationsList);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        if (status === "idle") dispatch(fetchRegistrations());
    }, [dispatch, status]);

    // Vue détail
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
                                <TableCell>Complétion</TableCell>
                                <TableCell align="center">Dossier</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <Tooltip
                                    key={item.id}
                                    title="Cliquer pour voir le dossier complet"
                                    placement="left"
                                >
                                    <TableRow
                                        hover
                                        onClick={() => setSelectedId(item.id)}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        <TableCell>{item.firstname}</TableCell>
                                        <TableCell>{item.lastname}</TableCell>
                                        <TableCell>{item.birth_date}</TableCell>
                                        <TableCell>{item.grade_label}</TableCell>
                                        <TableCell sx={{ minWidth: 130 }}>
                                            <CompletionCell pct={item.completion_pct} />
                                        </TableCell>
                                        <TableCell
                                            align="center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Tooltip title="Télécharger le dossier (.zip)">
                                                <IconButton
                                                    size="small"
                                                    component="a"
                                                    href={`/api/registrations/${item.id}/download/`}
                                                    download
                                                    color="primary"
                                                >
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
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