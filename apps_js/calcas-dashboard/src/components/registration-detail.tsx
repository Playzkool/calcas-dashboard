import { useEffect } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Link,
    Stack,
    Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useAppDispatch, useAppSelector } from "../hooks";
import { clearDetail, fetchRegistrationDetail } from "../store/registration-detail-slice";
import type { LegalRepresentativeDetail } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DISEASE_LABELS: Record<string, string> = {
    angine: "Angine",
    asthme: "Asthme",
    coqueluche: "Coqueluche",
    oreillons: "Oreillons",
    otites: "Otites",
    rhumatisme: "Rhumatisme",
    rougeole: "Rougeole",
    rubeole: "Rubéole",
    scarlatine: "Scarlatine",
    varicelle: "Varicelle",
};

const FAMILY_SITUATION_LABELS: Record<string, string> = {
    married_or_cohabiting: "Marié(e) / En couple",
    divorced_or_separated: "Divorcé(e) / Séparé(e)",
    single_parent: "Parent seul",
};

function InfoField({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body2">{value ?? "—"}</Typography>
        </Box>
    );
}

function BoolField({ label, value }: { label: string; value: boolean | null | undefined }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            {value === null || value === undefined ? (
                <Typography variant="body2" color="text.secondary">Non renseigné</Typography>
            ) : value ? (
                <Chip
                    icon={<CheckCircleOutlineIcon />}
                    label="Oui"
                    color="success"
                    size="small"
                    variant="outlined"
                />
            ) : (
                <Chip
                    icon={<CancelOutlinedIcon />}
                    label="Non"
                    size="small"
                    variant="outlined"
                />
            )}
        </Box>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mt: 0 }}>
            {children}
        </Typography>
    );
}

function DocLink({ label, url }: { label: string; url: string | null | undefined }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <InsertDriveFileOutlinedIcon fontSize="small" color={url ? "primary" : "disabled"} />
            {url ? (
                <Link href={url} target="_blank" rel="noreferrer" variant="body2">
                    {label}
                </Link>
            ) : (
                <Typography variant="body2" color="text.secondary">
                    {label} — non fourni
                </Typography>
            )}
        </Box>
    );
}

// ─── Legal representative card ────────────────────────────────────────────────

function LegalRepresentativeCard({ lr, index }: { lr: LegalRepresentativeDetail; index: number }) {
    const fullName = [lr.firstname, lr.lastname].filter(Boolean).join(" ") || lr.email;
    const phones = [
        lr.phone_mobile && `Portable : ${lr.phone_mobile}`,
        lr.phone_home && `Fixe : ${lr.phone_home}`,
        lr.phone_work && `Travail : ${lr.phone_work}`,
    ].filter(Boolean);

    return (
        <Card variant="outlined">
            <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <PersonOutlineIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>
                        Représentant {index + 1} — {fullName}
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoField label="Email" value={lr.email} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoField label="Date de naissance" value={lr.birth_date ?? undefined} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <InfoField label="Adresse" value={lr.address ?? undefined} />
                    </Grid>
                    {phones.length > 0 && (
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Téléphones
                            </Typography>
                            {phones.map((p, i) => (
                                <Typography key={i} variant="body2">{p}</Typography>
                            ))}
                        </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoField label="Profession" value={lr.profession ?? undefined} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoField label="Référence assurance" value={lr.insurance_reference ?? undefined} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <BoolField label="Autorité parentale" value={lr.has_parental_authority} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <BoolField label="Diffusion coordonnées" value={lr.coordinates_sharing_authorized} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <BoolField label="Accompagnement piscine" value={lr.pool_accompaniment} />
                    </Grid>
                    {lr.pool_attestation_url && (
                        <Grid size={{ xs: 12 }}>
                            <DocLink label="Attestation natation" url={lr.pool_attestation_url} />
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}

// ─── Main detail component ────────────────────────────────────────────────────

interface RegistrationDetailViewProps {
    id: number;
    onBack: () => void;
}

export function RegistrationDetailView({ id, onBack }: RegistrationDetailViewProps) {
    const dispatch = useAppDispatch();
    const { data, status, error } = useAppSelector((s) => s.registrationDetail);

    useEffect(() => {
        dispatch(fetchRegistrationDetail(id));
        return () => { dispatch(clearDetail()); };
    }, [dispatch, id]);

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

    if (!data) return null;

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={onBack} variant="outlined" size="small">
                    Retour
                </Button>
                <Typography variant="h5">
                    {data.firstname} {data.lastname}
                </Typography>
                <Chip label={data.grade_label} color="primary" size="small" />
            </Box>

            <Stack spacing={3}>
                {/* ── Informations de l'élève ── */}
                <Card variant="outlined">
                    <CardContent>
                        <SectionTitle>Informations de l'élève</SectionTitle>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoField label="Prénom" value={data.firstname} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoField label="Nom" value={data.lastname} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <InfoField label="Date de naissance" value={data.birth_date} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <InfoField label="Lieu de naissance" value={data.birth_place} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <InfoField label="Nationalité" value={data.nationality} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <InfoField label="Code postal" value={data.postal_code} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 8 }}>
                                <InfoField label="Adresse" value={data.address} />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* ── Situation familiale ── */}
                <Card variant="outlined">
                    <CardContent>
                        <SectionTitle>Situation familiale</SectionTitle>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <InfoField
                                    label="Situation"
                                    value={
                                        data.family_situation
                                            ? FAMILY_SITUATION_LABELS[data.family_situation] ?? data.family_situation
                                            : undefined
                                    }
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <InfoField label="Nombre de frères" value={data.siblings_brothers} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <InfoField label="Nombre de sœurs" value={data.siblings_sisters} />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* ── Fiche sanitaire ── */}
                <Card variant="outlined">
                    <CardContent>
                        <SectionTitle>Fiche sanitaire de liaison</SectionTitle>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <BoolField label="Autorisation appel SAMU / pompiers" value={data.samu_authorized} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <InfoField label="Médecin traitant" value={data.doctor_name_phone} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <InfoField label="Allergies / informations médicales" value={data.allergies_info} />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <InfoField label="Autres vaccinations" value={data.other_vaccines} />
                            </Grid>

                            {/* Antécédents médicaux */}
                            {Object.keys(data.diseases_history).length > 0 && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                        Antécédents médicaux
                                    </Typography>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {Object.entries(data.diseases_history).map(([key, val]) =>
                                            val ? (
                                                <Chip
                                                    key={key}
                                                    label={DISEASE_LABELS[key] ?? key}
                                                    size="small"
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                            ) : null
                                        )}
                                    </Box>
                                </Grid>
                            )}

                            {/* Contacts d'urgence */}
                            {data.emergency_contacts.length > 0 && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                        Contacts d'urgence
                                    </Typography>
                                    <Stack spacing={1}>
                                        {data.emergency_contacts.map((c, i) => (
                                            <Box key={i} sx={{ pl: 1, borderLeft: "2px solid", borderColor: "divider" }}>
                                                <Typography variant="body2" fontWeight={500}>{c.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {c.phone}{c.relation ? ` — ${c.relation}` : ""}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>

                {/* ── Autorisations ── */}
                <Card variant="outlined">
                    <CardContent>
                        <SectionTitle>Autorisations</SectionTitle>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <BoolField label="Sortie pédagogique" value={data.school_trips_authorized} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <BoolField label="Droit à l'image" value={data.image_rights_authorized} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <BoolField label="Charte acceptée" value={data.charter_accepted} />
                            </Grid>
                        </Grid>

                        {data.authorized_pickup_persons.length > 0 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    Personnes autorisées à récupérer l'enfant
                                </Typography>
                                <Stack spacing={1}>
                                    {data.authorized_pickup_persons.map((p, i) => (
                                        <Box key={i} sx={{ pl: 1, borderLeft: "2px solid", borderColor: "divider" }}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {p.name}{p.relation ? ` (${p.relation})` : ""}
                                            </Typography>
                                            {(p.phone || p.address) && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {[p.phone, p.address].filter(Boolean).join(" — ")}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Stack>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* ── Documents ── */}
                <Card variant="outlined">
                    <CardContent>
                        <SectionTitle>Documents joints</SectionTitle>
                        <Stack spacing={1}>
                            <DocLink label="Certificat de naissance / livret de famille" url={data.document_url} />
                            <DocLink label="Carnet de santé / attestation vaccinale" url={data.vaccination_document_url} />
                            <DocLink label="Attestation d'assurance" url={data.insurance_document_url} />
                            <DocLink label="Jugement de divorce / séparation" url={data.divorce_judgment_url} />
                        </Stack>
                    </CardContent>
                </Card>

                {/* ── Représentants légaux ── */}
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Représentants légaux
                    </Typography>
                    {data.legal_representatives.length === 0 ? (
                        <Typography color="text.secondary">Aucun représentant légal associé.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            {data.legal_representatives.map((lr, i) => (
                                <LegalRepresentativeCard key={lr.id} lr={lr} index={i} />
                            ))}
                        </Stack>
                    )}
                </Box>
            </Stack>
        </Box>
    );
}
