import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
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
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAppDispatch, useAppSelector } from "../hooks";
import { resetRegistration, resetUpdateRegistration } from "../store/registration-slice";
import { fetchMyRegistrations } from "../store/my-registrations-slice";
import { fetchRegistrationDetail, clearDetail } from "../store/registration-detail-slice";
import { RegistrationForm, type DocumentUrls } from "./registration-form";
import { RegistrationDetailView } from "./registration-detail";
import type { RegistrationDetail, RegistrationFormInputType } from "../types";

function detailToFormValues(d: RegistrationDetail): Partial<RegistrationFormInputType> {
    return {
        firstname: d.firstname,
        lastname: d.lastname,
        birth_date: d.birth_date,
        birth_place: d.birth_place ?? undefined,
        postal_code: d.postal_code ?? undefined,
        nationality: d.nationality ?? undefined,
        address: d.address ?? undefined,
        grade: d.grade,
        family_situation: (d.family_situation as RegistrationFormInputType["family_situation"]) ?? undefined,
        siblings_brothers: d.siblings_brothers ?? undefined,
        siblings_sisters: d.siblings_sisters ?? undefined,
        other_vaccines: d.other_vaccines ?? undefined,
        diseases_history: d.diseases_history as Record<string, boolean>,
        samu_authorized: d.samu_authorized ?? undefined,
        emergency_contacts: d.emergency_contacts,
        allergies_info: d.allergies_info ?? undefined,
        school_trips_authorized: d.school_trips_authorized ?? undefined,
        doctor_name_phone: d.doctor_name_phone ?? undefined,
        image_rights_authorized: d.image_rights_authorized ?? undefined,
        authorized_pickup_persons: d.authorized_pickup_persons,
        charter_accepted: d.charter_accepted,
    };
}

function CompletionGauge({ value }: { value: number }) {
    const color = value >= 80 ? "success" : value >= 40 ? "warning" : "error";
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 120 }}>
            <Box sx={{ flex: 1 }}>
                <LinearProgress variant="determinate" value={value} color={color} sx={{ borderRadius: 1, height: 8 }} />
            </Box>
            <Typography variant="caption" sx={{ minWidth: 32 }}>
                {value}%
            </Typography>
        </Box>
    );
}

export function RegistrationPage() {
    const dispatch = useAppDispatch();
    const { items, status: fetchStatus, error: fetchError } = useAppSelector((s) => s.myRegistrations);
    const registrationStatus = useAppSelector((s) => s.registration.status);
    const updateStatus = useAppSelector((s) => s.registration.updateStatus);
    const { data: detailData, status: detailStatus, error: detailError } = useAppSelector((s) => s.registrationDetail);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [viewingId, setViewingId] = useState<number | null>(null);

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

    useEffect(() => {
        if (updateStatus === "succeeded") {
            setEditingId(null);
            dispatch(resetUpdateRegistration());
            dispatch(clearDetail());
            dispatch(fetchMyRegistrations());
        }
    }, [updateStatus, dispatch]);

    const handleEdit = (id: number) => {
        setEditingId(id);
        dispatch(fetchRegistrationDetail(id));
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        dispatch(clearDetail());
        dispatch(resetUpdateRegistration());
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

    // Read-only detail view (dossier clôturé)
    if (viewingId !== null) {
        return (
            <RegistrationDetailView
                id={viewingId}
                onBack={() => setViewingId(null)}
                readOnly
            />
        );
    }

    // Edit mode
    if (editingId !== null) {
        if (detailStatus === "loading" || detailStatus === "idle") {
            return (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                    <CircularProgress />
                </Box>
            );
        }
        if (detailStatus === "failed") {
            return (
                <Box>
                    <Button sx={{ mb: 1 }} onClick={handleCancelEdit}>← Retour</Button>
                    <Alert severity="error">{detailError ?? "Erreur lors du chargement du dossier."}</Alert>
                </Box>
            );
        }
        if (detailStatus === "succeeded" && detailData) {
            const documentUrls: DocumentUrls = {
                document: detailData.document_url,
                vaccination_document: detailData.vaccination_document_url,
                insurance_document: detailData.insurance_document_url,
                divorce_judgment: detailData.divorce_judgment_url,
            };
            return (
                <Box>
                    <Button sx={{ mb: 1 }} onClick={handleCancelEdit}>← Retour</Button>
                    <RegistrationForm
                        registrationId={editingId}
                        initialData={detailToFormValues(detailData)}
                        documentUrls={documentUrls}
                    />
                </Box>
            );
        }
    }

    // New registration form
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
                            <TableCell>Complétion</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Document</TableCell>
                            <TableCell />
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
                                    <CompletionGauge value={item.completion_pct} />
                                </TableCell>
                                <TableCell>
                                    {item.is_closed ? (
                                        <Chip label="Clôturé" size="small" color="default" />
                                    ) : (
                                        <Chip label="En cours" size="small" color="primary" variant="outlined" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {item.document_url ? (
                                        <a href={item.document_url} target="_blank" rel="noreferrer">
                                            Voir
                                        </a>
                                    ) : (
                                        "—"
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    {item.is_closed ? (
                                        <Tooltip title="Consulter le dossier">
                                            <Button
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => setViewingId(item.id)}
                                            >
                                                Consulter
                                            </Button>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip title="Modifier le dossier">
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleEdit(item.id)}
                                            >
                                                Modifier
                                            </Button>
                                        </Tooltip>
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
