import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormLabel,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
    createCoRepresentative,
    fetchAccountInfo,
    resetCreateStatus,
} from "../store/account-slice";
import {
    fetchProfile,
    resetUpdateStatus,
    updateProfile,
} from "../store/profile-slice";
import { ProfileFormSchema, type ProfileFormType } from "../types";

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection() {
    const dispatch = useAppDispatch();
    const { data, fetchStatus, fetchError, updateStatus, updateError } = useAppSelector(
        (s) => s.profile
    );

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<ProfileFormType>({
        resolver: zodResolver(ProfileFormSchema),
        defaultValues: {},
    });

    useEffect(() => {
        if (fetchStatus === "idle") dispatch(fetchProfile());
    }, [dispatch, fetchStatus]);

    useEffect(() => {
        if (data) {
            reset({
                firstname: data.firstname ?? "",
                lastname: data.lastname ?? "",
                birth_date: data.birth_date ?? "",
                address: data.address ?? "",
                phone_home: data.phone_home ?? "",
                phone_mobile: data.phone_mobile ?? "",
                phone_work: data.phone_work ?? "",
                profession: data.profession ?? "",
                has_parental_authority: data.has_parental_authority ?? undefined,
                insurance_reference: data.insurance_reference ?? "",
                coordinates_sharing_authorized: data.coordinates_sharing_authorized ?? undefined,
                pool_accompaniment: data.pool_accompaniment ?? false,
            });
        }
    }, [data, reset]);

    useEffect(() => {
        if (updateStatus === "succeeded") {
            setTimeout(() => dispatch(resetUpdateStatus()), 3000);
        }
    }, [updateStatus, dispatch]);

    const onSubmit = (formData: ProfileFormType) => {
        dispatch(updateProfile(formData));
    };

    if (fetchStatus === "idle" || fetchStatus === "loading") {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (fetchStatus === "failed") {
        return <Alert severity="error">{fetchError ?? "Erreur lors du chargement du profil."}</Alert>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h6" mb={2}>Mon profil</Typography>

            <Stack spacing={2}>
                {/* Email (read-only) */}
                <TextField
                    label="Email"
                    value={data?.email ?? ""}
                    disabled
                    size="small"
                    fullWidth
                />

                {/* Name */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Controller
                        control={control}
                        name="firstname"
                        render={({ field }) => (
                            <TextField
                                label="Prénom"
                                size="small"
                                fullWidth
                                error={!!errors.firstname}
                                helperText={errors.firstname?.message}
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="lastname"
                        render={({ field }) => (
                            <TextField
                                label="Nom"
                                size="small"
                                fullWidth
                                error={!!errors.lastname}
                                helperText={errors.lastname?.message}
                                {...field}
                            />
                        )}
                    />
                </Stack>

                {/* Birth date + profession */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Controller
                        control={control}
                        name="birth_date"
                        render={({ field }) => (
                            <TextField
                                label="Date de naissance"
                                type="date"
                                size="small"
                                fullWidth
                                slotProps={{ inputLabel: { shrink: true } }}
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="profession"
                        render={({ field }) => (
                            <TextField
                                label="Profession"
                                size="small"
                                fullWidth
                                {...field}
                            />
                        )}
                    />
                </Stack>

                {/* Address */}
                <Controller
                    control={control}
                    name="address"
                    render={({ field }) => (
                        <TextField
                            label="Adresse"
                            multiline
                            minRows={2}
                            size="small"
                            fullWidth
                            {...field}
                        />
                    )}
                />

                {/* Phones */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Controller
                        control={control}
                        name="phone_home"
                        render={({ field }) => (
                            <TextField
                                label="Téléphone fixe"
                                size="small"
                                fullWidth
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="phone_mobile"
                        render={({ field }) => (
                            <TextField
                                label="Téléphone portable"
                                size="small"
                                fullWidth
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name="phone_work"
                        render={({ field }) => (
                            <TextField
                                label="Téléphone travail"
                                size="small"
                                fullWidth
                                {...field}
                            />
                        )}
                    />
                </Stack>

                <Divider />

                {/* Autorité parentale */}
                <Controller
                    control={control}
                    name="has_parental_authority"
                    render={({ field }) => (
                        <FormControl>
                            <FormLabel>Autorité parentale</FormLabel>
                            <RadioGroup
                                row
                                value={
                                    field.value === true
                                        ? "oui"
                                        : field.value === false
                                        ? "non"
                                        : ""
                                }
                                onChange={(e) => field.onChange(e.target.value === "oui")}
                            >
                                <FormControlLabel value="oui" control={<Radio size="small" />} label="Oui" />
                                <FormControlLabel value="non" control={<Radio size="small" />} label="Non" />
                            </RadioGroup>
                        </FormControl>
                    )}
                />

                {/* Insurance */}
                <Controller
                    control={control}
                    name="insurance_reference"
                    render={({ field }) => (
                        <TextField
                            label="Attestation d'assurance n°"
                            size="small"
                            fullWidth
                            {...field}
                        />
                    )}
                />

                <Divider />

                {/* Coordonnées sharing */}
                <Controller
                    control={control}
                    name="coordinates_sharing_authorized"
                    render={({ field }) => (
                        <FormControl>
                            <FormLabel>
                                Autorisation de diffusion des coordonnées personnelles (mail, téléphone,
                                adresse) aux autres parents membres de l'association
                            </FormLabel>
                            <RadioGroup
                                row
                                value={
                                    field.value === true
                                        ? "oui"
                                        : field.value === false
                                        ? "non"
                                        : ""
                                }
                                onChange={(e) => field.onChange(e.target.value === "oui")}
                            >
                                <FormControlLabel value="oui" control={<Radio size="small" />} label="Oui" />
                                <FormControlLabel value="non" control={<Radio size="small" />} label="Non" />
                            </RadioGroup>
                        </FormControl>
                    )}
                />

                <Divider />

                {/* Pool accompaniment */}
                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Accompagnement piscine
                    </Typography>
                    <Controller
                        control={control}
                        name="pool_accompaniment"
                        render={({ field }) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={!!field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Je souhaite accompagner les enfants lors des sorties piscine"
                            />
                        )}
                    />
                    {/* Pool attestation file */}
                    <Controller
                        control={control}
                        name="pool_attestation"
                        render={({ field: { onChange, value } }) => (
                            <FormControl sx={{ mt: 1 }}>
                                <Button variant="outlined" component="label" size="small" sx={{ alignSelf: "flex-start" }}>
                                    {value
                                        ? (value as File).name
                                        : data?.pool_attestation
                                        ? "Attestation déjà fournie – remplacer"
                                        : "Joindre attestation natation (≥ 50 m)"}
                                    <input
                                        type="file"
                                        accept="application/pdf,image/*"
                                        hidden
                                        onChange={(e) => onChange(e.target.files?.[0])}
                                    />
                                </Button>
                                {data?.pool_attestation && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Fichier actuel :{" "}
                                        <a href={data.pool_attestation} target="_blank" rel="noreferrer">
                                            voir le document
                                        </a>
                                    </Typography>
                                )}
                            </FormControl>
                        )}
                    />
                </Box>

                {/* Feedback */}
                {updateStatus === "failed" && (
                    <Alert severity="error">{updateError ?? "Une erreur est survenue."}</Alert>
                )}
                {updateStatus === "succeeded" && (
                    <Alert severity="success">Profil mis à jour.</Alert>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    disabled={updateStatus === "loading" || !isDirty}
                    startIcon={
                        updateStatus === "loading" ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : null
                    }
                    sx={{ alignSelf: "flex-start" }}
                >
                    {updateStatus === "loading" ? "Enregistrement…" : "Enregistrer le profil"}
                </Button>
            </Stack>
        </Box>
    );
}

// ─── Co-representative section ────────────────────────────────────────────────

function CoRepresentativeSection() {
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
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (fetchStatus === "failed") {
        return <Alert severity="error">{fetchError ?? "Erreur lors du chargement."}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h6" mb={2}>Représentants légaux par enfant</Typography>

            {pupils.length === 0 ? (
                <Typography color="text.secondary">
                    Aucun dossier d'inscription soumis. Soumettez d'abord le formulaire d'inscription.
                </Typography>
            ) : (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
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

            <Dialog
                open={activePupilId !== null}
                onClose={() => setActivePupilId(null)}
                maxWidth="xs"
                fullWidth
            >
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
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmit();
                        }}
                        fullWidth
                        autoFocus
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setActivePupilId(null)}
                        disabled={createStatus === "loading"}
                    >
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

// ─── Main page ────────────────────────────────────────────────────────────────

export function AccountPage() {
    return (
        <Box maxWidth={700} mx="auto">
            <Typography variant="h5" mb={3}>
                Mon compte
            </Typography>

            <Stack spacing={4}>
                <Paper sx={{ p: 3 }}>
                    <ProfileSection />
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <CoRepresentativeSection />
                </Paper>
            </Stack>
        </Box>
    );
}
