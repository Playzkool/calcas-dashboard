import { useState, useEffect } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
    RegistrationFormSchema,
    type RegistrationFormType,
    type RegistrationFormInputType,
} from "../types.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../hooks";
import { resetRegistration, resetUpdateRegistration, submitRegistration, updateRegistration } from "../store/registration-slice";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const GRADES: { label: string; value: number }[] = [
    { label: "Petite section", value: 1 },
    { label: "Moyenne section", value: 2 },
    { label: "Grande section", value: 3 },
    { label: "CP", value: 4 },
    { label: "CE1", value: 5 },
    { label: "CE2", value: 6 },
    { label: "CM1", value: 7 },
    { label: "CM2", value: 8 },
];

const DISEASES = [
    { key: "angine", label: "Angine" },
    { key: "asthme", label: "Asthme" },
    { key: "coqueluche", label: "Coqueluche" },
    { key: "oreillons", label: "Oreillons" },
    { key: "otites", label: "Otites" },
    { key: "rhumatisme", label: "Rhumatisme" },
    { key: "rougeole", label: "Rougeole" },
    { key: "rubeole", label: "Rubéole" },
    { key: "scarlatine", label: "Scarlatine" },
    { key: "varicelle", label: "Varicelle" },
] as const;

const emptyDefaults = {
    firstname: "",
    lastname: "",
    diseases_history: {} as Record<string, boolean>,
    emergency_contacts: [] as { name: string; phone: string; relation?: string }[],
    authorized_pickup_persons: [] as { name: string; relation?: string; phone?: string; address?: string }[],
} satisfies Partial<RegistrationFormInputType>;

export interface DocumentUrls {
    photo?: string | null;
    document?: string | null;
    document_2?: string | null;
    document_3?: string | null;
    document_4?: string | null;
    document_5?: string | null;
    document_6?: string | null;
    document_7?: string | null;
    document_8?: string | null;
    document_9?: string | null;
    document_10?: string | null;
    vaccination_document?: string | null;
    insurance_document?: string | null;
    divorce_judgment?: string | null;
}

const EXTRA_DOC_FIELDS = [
    "document_2", "document_3", "document_4", "document_5",
    "document_6", "document_7", "document_8", "document_9", "document_10",
] as const;
type ExtraDocField = typeof EXTRA_DOC_FIELDS[number];

const MAX_DOCUMENTS = 10;

interface RegistrationFormProps {
    registrationId?: number;
    initialData?: Partial<RegistrationFormInputType>;
    documentUrls?: DocumentUrls;
}

function FileUploadButton({
    label,
    accept,
    value,
    onChange,
    error,
    helperText,
    currentUrl,
}: {
    label: string;
    accept?: string;
    value?: File;
    onChange: (f: File | undefined) => void;
    error?: boolean;
    helperText?: string;
    currentUrl?: string | null;
}) {
    const [sizeError, setSizeError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const isImage = accept === "image/*";

    useEffect(() => {
        if (!isImage) return;
        if (!value) { setPreviewUrl(null); return; }
        const url = URL.createObjectURL(value);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [value, isImage]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file && file.size > MAX_FILE_SIZE) {
            setSizeError("Le fichier ne doit pas dépasser 5 Mo.");
            onChange(undefined);
        } else {
            setSizeError(null);
            onChange(file);
        }
    }

    const displayedImage = previewUrl ?? (isImage && !value ? currentUrl : null);

    return (
        <FormControl error={error || !!sizeError}>
            <Stack spacing={1}>
                {isImage && displayedImage && (
                    <Box
                        component="img"
                        src={displayedImage}
                        alt="Aperçu photo d'identité"
                        sx={{
                            width: 96,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    />
                )}
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Button variant="outlined" component="label" size="small">
                        {value ? value.name : label}
                        <input
                            type="file"
                            accept={accept ?? "application/pdf,image/jpeg,image/png,image/webp"}
                            hidden
                            onChange={handleChange}
                        />
                    </Button>
                    {!isImage && !value && currentUrl && (
                        <Typography variant="caption">
                            <a href={currentUrl} target="_blank" rel="noreferrer">
                                Voir le fichier actuel
                            </a>
                        </Typography>
                    )}
                </Stack>
            </Stack>
            {(sizeError || helperText) && (
                <FormHelperText>{sizeError ?? helperText}</FormHelperText>
            )}
        </FormControl>
    );
}

export function RegistrationForm({ registrationId, initialData, documentUrls }: RegistrationFormProps = {}) {
    const dispatch = useAppDispatch();
    const createStatus = useAppSelector((state) => state.registration.status);
    const createError = useAppSelector((state) => state.registration.error);
    const updateStatus = useAppSelector((state) => state.registration.updateStatus);
    const updateError = useAppSelector((state) => state.registration.updateError);

    const isEditMode = registrationId !== undefined;
    const status = isEditMode ? updateStatus : createStatus;
    const error = isEditMode ? updateError : createError;

    const defaultValues = initialData
        ? { ...emptyDefaults, ...initialData }
        : emptyDefaults;

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<RegistrationFormInputType, unknown, RegistrationFormType>({
        resolver: zodResolver(RegistrationFormSchema),
        defaultValues,
    });

    const { fields: emergencyFields, append: appendEmergency, remove: removeEmergency } =
        useFieldArray({ control, name: "emergency_contacts" });

    const { fields: pickupFields, append: appendPickup, remove: removePickup } =
        useFieldArray({ control, name: "authorized_pickup_persons" });

    const familySituation = watch("family_situation");

    // Number of "other document" slots visible (1 = only "document", 2 = + document_2, …)
    const initialSlots = documentUrls
        ? 1 + EXTRA_DOC_FIELDS.filter((f) => documentUrls[f as ExtraDocField]).length
        : 1;
    const [docSlotCount, setDocSlotCount] = useState(Math.max(1, initialSlots));

    const onSubmit = (data: RegistrationFormType) => {
        if (isEditMode) {
            dispatch(updateRegistration({ id: registrationId, data }));
        } else {
            dispatch(submitRegistration(data));
        }
    };

    const handleDismissSuccess = () => {
        if (isEditMode) {
            dispatch(resetUpdateRegistration());
        } else {
            dispatch(resetRegistration());
            reset(emptyDefaults);
        }
    };

    return (
        <Box maxWidth={700} mx="auto" mt={4}>
            <Typography variant="h5" mb={3}>
                {isEditMode ? "Modifier le dossier d'inscription" : "Inscription – Dossier de marcatge"}
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>

                    {/* ── 1. Informations de l'enfant ─────────────────────── */}
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={600}>1. Informations de l'enfant</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={2}>
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <Controller
                                        control={control}
                                        name="firstname"
                                        render={({ field }) => (
                                            <TextField
                                                label="Prénom (pichon nom)"
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
                                                label="Nom (nom d'ostal)"
                                                fullWidth
                                                error={!!errors.lastname}
                                                helperText={errors.lastname?.message}
                                                {...field}
                                            />
                                        )}
                                    />
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <Controller
                                        control={control}
                                        name="birth_date"
                                        render={({ field: { value, onChange, ...rest } }) => (
                                            <TextField
                                                label="Date de naissance"
                                                type="date"
                                                fullWidth
                                                slotProps={{ inputLabel: { shrink: true } }}
                                                value={
                                                    value instanceof Date && !isNaN(value.getTime())
                                                        ? value.toISOString().split("T")[0]
                                                        : (value as string) ?? ""
                                                }
                                                onChange={(e) => onChange(e.target.value)}
                                                error={!!errors.birth_date}
                                                helperText={errors.birth_date?.message}
                                                {...rest}
                                            />
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name="birth_place"
                                        render={({ field }) => (
                                            <TextField
                                                label="Lieu de naissance"
                                                fullWidth
                                                {...field}
                                            />
                                        )}
                                    />
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <Controller
                                        control={control}
                                        name="postal_code"
                                        render={({ field }) => (
                                            <TextField
                                                label="Code postal"
                                                fullWidth
                                                {...field}
                                            />
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name="nationality"
                                        render={({ field }) => (
                                            <TextField
                                                label="Nationalité"
                                                fullWidth
                                                {...field}
                                            />
                                        )}
                                    />
                                </Stack>

                                <Controller
                                    control={control}
                                    name="address"
                                    render={({ field }) => (
                                        <TextField
                                            label="Adresse (adreiça)"
                                            multiline
                                            minRows={2}
                                            fullWidth
                                            {...field}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="grade"
                                    render={({ field }) => (
                                        <FormControl error={!!errors.grade} fullWidth>
                                            <InputLabel>Classe (classa)</InputLabel>
                                            <Select label="Classe (classa)" {...field} value={field.value ?? ""}>
                                                {GRADES.map((g) => (
                                                    <MenuItem key={g.value} value={g.value}>
                                                        {g.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.grade && (
                                                <FormHelperText>{errors.grade.message}</FormHelperText>
                                            )}
                                        </FormControl>
                                    )}
                                />

                                <Box>
                                    <Typography variant="body2" fontWeight={500} mb={1}>
                                        Photo d'identité
                                    </Typography>
                                    <Controller
                                        control={control}
                                        name="photo"
                                        render={({ field: { onChange, value } }) => (
                                            <FileUploadButton
                                                label="Choisir une photo"
                                                accept="image/jpeg,image/png,image/webp"
                                                value={value as File | undefined}
                                                onChange={onChange}
                                                error={!!errors.photo}
                                                helperText={errors.photo?.message as string}
                                                currentUrl={documentUrls?.photo}
                                            />
                                        )}
                                    />
                                </Box>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── 2. Situation familiale ───────────────────────────── */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={600}>2. Situation familiale (entresenhas familhalas)</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={2}>
                                <Controller
                                    control={control}
                                    name="family_situation"
                                    render={({ field }) => (
                                        <FormControl>
                                            <FormLabel>Situation des parents</FormLabel>
                                            <RadioGroup {...field} value={field.value ?? ""}>
                                                <FormControlLabel
                                                    value="married_or_cohabiting"
                                                    control={<Radio />}
                                                    label="Mariés ou concubins"
                                                />
                                                <FormControlLabel
                                                    value="divorced_or_separated"
                                                    control={<Radio />}
                                                    label="Divorcés ou séparés"
                                                />
                                                <FormControlLabel
                                                    value="single_parent"
                                                    control={<Radio />}
                                                    label="Parent isolé"
                                                />
                                            </RadioGroup>
                                        </FormControl>
                                    )}
                                />

                                <Stack direction="row" spacing={2}>
                                    <Controller
                                        control={control}
                                        name="siblings_brothers"
                                        render={({ field }) => (
                                            <TextField
                                                label="Nombre de frères"
                                                type="number"
                                                slotProps={{ htmlInput: { min: 0 } }}
                                                fullWidth
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name="siblings_sisters"
                                        render={({ field }) => (
                                            <TextField
                                                label="Nombre de sœurs"
                                                type="number"
                                                slotProps={{ htmlInput: { min: 0 } }}
                                                fullWidth
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        )}
                                    />
                                </Stack>

                                <Controller
                                    control={control}
                                    name="siblings_names"
                                    render={({ field }) => (
                                        <TextField
                                            label="Prénoms des frères et sœurs (facultatif)"
                                            fullWidth
                                            placeholder="Ex : Emma, Lucas…"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    )}
                                />
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── 3. Fiche sanitaire de liaison ────────────────────── */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={600}>3. Fiche sanitaire de liaison</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={2}>
                                <Controller
                                    control={control}
                                    name="other_vaccines"
                                    render={({ field }) => (
                                        <TextField
                                            label="Autres vaccinations (DTP / Tétracoq inclus)"
                                            multiline
                                            minRows={2}
                                            fullWidth
                                            placeholder="Ex: DTP à jour, vaccin contre l'hépatite B…"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    )}
                                />

                                <Box>
                                    <Typography variant="body2" fontWeight={500} mb={1}>
                                        Maladies antérieures
                                    </Typography>
                                    <Box
                                        display="grid"
                                        gridTemplateColumns={{ xs: "1fr 1fr", sm: "1fr 1fr 1fr" }}
                                        gap={0}
                                    >
                                        {DISEASES.map(({ key, label }) => (
                                            <Controller
                                                key={key}
                                                control={control}
                                                name={`diseases_history.${key}`}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={!!field.value}
                                                                onChange={(e) => field.onChange(e.target.checked)}
                                                                size="small"
                                                            />
                                                        }
                                                        label={label}
                                                    />
                                                )}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                <Controller
                                    control={control}
                                    name="samu_authorized"
                                    render={({ field }) => (
                                        <FormControl>
                                            <FormLabel>
                                                En cas de maladie ou d'accident, j'autorise l'école à appeler
                                                le SAMU, les pompiers ou un médecin
                                            </FormLabel>
                                            <RadioGroup
                                                row
                                                value={field.value === true ? "oui" : field.value === false ? "non" : ""}
                                                onChange={(e) => field.onChange(e.target.value === "oui")}
                                            >
                                                <FormControlLabel value="oui" control={<Radio />} label="Oui" />
                                                <FormControlLabel value="non" control={<Radio />} label="Non" />
                                            </RadioGroup>
                                        </FormControl>
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="allergies_info"
                                    render={({ field }) => (
                                        <TextField
                                            label="Allergies / autres informations médicales"
                                            multiline
                                            minRows={2}
                                            fullWidth
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    )}
                                />

                                {/* Emergency contacts */}
                                <Box>
                                    <Typography variant="body2" fontWeight={500} mb={1}>
                                        Personnes à prévenir en cas d'urgence
                                    </Typography>
                                    <Stack spacing={1}>
                                        {emergencyFields.map((item, index) => (
                                            <Stack key={item.id} direction="row" spacing={1} alignItems="flex-start">
                                                <Controller
                                                    control={control}
                                                    name={`emergency_contacts.${index}.name`}
                                                    render={({ field }) => (
                                                        <TextField label="Nom / Prénom" size="small" {...field} />
                                                    )}
                                                />
                                                <Controller
                                                    control={control}
                                                    name={`emergency_contacts.${index}.phone`}
                                                    render={({ field }) => (
                                                        <TextField label="Téléphone" size="small" {...field} />
                                                    )}
                                                />
                                                <Controller
                                                    control={control}
                                                    name={`emergency_contacts.${index}.relation`}
                                                    render={({ field }) => (
                                                        <TextField label="Lien (facultatif)" size="small" {...field} />
                                                    )}
                                                />
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => removeEmergency(index)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={() => appendEmergency({ name: "", phone: "" })}
                                            sx={{ alignSelf: "flex-start" }}
                                        >
                                            Ajouter une personne
                                        </Button>
                                    </Stack>
                                </Box>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── 4. Autorisations ─────────────────────────────────── */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={600}>4. Autorisations</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={3}>
                                {/* Sortie pédagogique */}
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Autorisation permanente de sortie pédagogique
                                    </Typography>
                                    <Controller
                                        control={control}
                                        name="school_trips_authorized"
                                        render={({ field }) => (
                                            <FormControl>
                                                <FormLabel>
                                                    J'autorise mon enfant à participer à toutes les sorties
                                                    organisées par les enseignants
                                                </FormLabel>
                                                <RadioGroup
                                                    row
                                                    value={field.value === true ? "oui" : field.value === false ? "non" : ""}
                                                    onChange={(e) => field.onChange(e.target.value === "oui")}
                                                >
                                                    <FormControlLabel value="oui" control={<Radio />} label="Oui" />
                                                    <FormControlLabel value="non" control={<Radio />} label="Non" />
                                                </RadioGroup>
                                            </FormControl>
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name="doctor_name_phone"
                                        render={({ field }) => (
                                            <TextField
                                                label="Médecin traitant (nom et numéro)"
                                                fullWidth
                                                size="small"
                                                sx={{ mt: 1 }}
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        )}
                                    />
                                </Box>

                                <Divider />

                                {/* Droit à l'image */}
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Droit à l'image
                                    </Typography>
                                    <Controller
                                        control={control}
                                        name="image_rights_authorized"
                                        render={({ field }) => (
                                            <FormControl>
                                                <FormLabel>
                                                    J'autorise l'école Calandreta et l'association Festa d'Oc à
                                                    photographier/filmer mon enfant (presse, site internet, plaquettes…)
                                                </FormLabel>
                                                <RadioGroup
                                                    row
                                                    value={field.value === true ? "oui" : field.value === false ? "non" : ""}
                                                    onChange={(e) => field.onChange(e.target.value === "oui")}
                                                >
                                                    <FormControlLabel value="oui" control={<Radio />} label="Oui" />
                                                    <FormControlLabel value="non" control={<Radio />} label="Non" />
                                                </RadioGroup>
                                            </FormControl>
                                        )}
                                    />
                                </Box>

                                <Divider />

                                {/* Personnes autorisées à récupérer l'enfant */}
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Personnes autorisées à venir chercher l'enfant
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                        Les deux parents sont toujours autorisés. Renseignez ici les autres personnes.
                                    </Typography>
                                    <Stack spacing={1}>
                                        {pickupFields.map((item, index) => (
                                            <Stack
                                                key={item.id}
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={1}
                                                alignItems="flex-start"
                                            >
                                                <Controller
                                                    control={control}
                                                    name={`authorized_pickup_persons.${index}.name`}
                                                    render={({ field }) => (
                                                        <TextField label="Nom / Prénom" size="small" {...field} />
                                                    )}
                                                />
                                                <Controller
                                                    control={control}
                                                    name={`authorized_pickup_persons.${index}.relation`}
                                                    render={({ field }) => (
                                                        <TextField
                                                            label="Lien (oncle, voisin…)"
                                                            size="small"
                                                            {...field}
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    control={control}
                                                    name={`authorized_pickup_persons.${index}.phone`}
                                                    render={({ field }) => (
                                                        <TextField label="Téléphone" size="small" {...field} />
                                                    )}
                                                />
                                                <Controller
                                                    control={control}
                                                    name={`authorized_pickup_persons.${index}.address`}
                                                    render={({ field }) => (
                                                        <TextField label="Adresse (facultatif)" size="small" {...field} />
                                                    )}
                                                />
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => removePickup(index)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        <Button
                                            size="small"
                                            startIcon={<AddIcon />}
                                            onClick={() => appendPickup({ name: "" })}
                                            sx={{ alignSelf: "flex-start" }}
                                        >
                                            Ajouter une personne
                                        </Button>
                                    </Stack>
                                </Box>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── 5. Documents à joindre ───────────────────────────── */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={600}>5. Pièces justificatives</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={2}>
                                <Typography variant="caption" color="text.secondary">
                                    Formats acceptés : PDF ou image (JPG, PNG). Laissez vide pour conserver le fichier existant.
                                </Typography>

                                <Controller
                                    control={control}
                                    name="vaccination_document"
                                    render={({ field: { onChange, value } }) => (
                                        <FileUploadButton
                                            label="Carnet de santé / attestation vaccinale"
                                            value={value as File | undefined}
                                            onChange={onChange}
                                            error={!!errors.vaccination_document}
                                            helperText={errors.vaccination_document?.message as string}
                                            currentUrl={documentUrls?.vaccination_document}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="insurance_document"
                                    render={({ field: { onChange, value } }) => (
                                        <FileUploadButton
                                            label="Attestation d'assurance (RC + dommage corporel)"
                                            value={value as File | undefined}
                                            onChange={onChange}
                                            error={!!errors.insurance_document}
                                            helperText={errors.insurance_document?.message as string}
                                            currentUrl={documentUrls?.insurance_document}
                                        />
                                    )}
                                />

                                {familySituation === "divorced_or_separated" && (
                                    <Controller
                                        control={control}
                                        name="divorce_judgment"
                                        render={({ field: { onChange, value } }) => (
                                            <FileUploadButton
                                                label="Copie du dernier jugement (divorce/séparation)"
                                                value={value as File | undefined}
                                                onChange={onChange}
                                                error={!!errors.divorce_judgment}
                                                helperText={errors.divorce_judgment?.message as string}
                                                currentUrl={documentUrls?.divorce_judgment}
                                            />
                                        )}
                                    />
                                )}

                                {/* Slot 1 */}
                                <Controller
                                    control={control}
                                    name="document"
                                    render={({ field: { onChange, value } }) => (
                                        <FileUploadButton
                                            label="Autre document"
                                            value={value as File | undefined}
                                            onChange={onChange}
                                            error={!!errors.document}
                                            helperText={errors.document?.message as string}
                                            currentUrl={documentUrls?.document}
                                        />
                                    )}
                                />

                                {/* Slots 2–10 */}
                                {EXTRA_DOC_FIELDS.slice(0, docSlotCount - 1).map((fieldName) => (
                                    <Controller
                                        key={fieldName}
                                        control={control}
                                        name={fieldName}
                                        render={({ field: { onChange, value } }) => (
                                            <FileUploadButton
                                                label="Autre document"
                                                value={value as File | undefined}
                                                onChange={onChange}
                                                currentUrl={documentUrls?.[fieldName as ExtraDocField]}
                                            />
                                        )}
                                    />
                                ))}

                                {docSlotCount < MAX_DOCUMENTS && (
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => setDocSlotCount((n) => n + 1)}
                                        sx={{ alignSelf: "flex-start" }}
                                    >
                                        Ajouter un document
                                    </Button>
                                )}
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── 6. Charte Calandreta ─────────────────────────────── */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={600}>6. Charte Calandreta et règlement intérieur</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                    En cochant cette case, je déclare avoir lu et compris l'ensemble
                                    de la Charte des Calandretas ainsi que le règlement intérieur de la
                                    Calandreta de Castanet Tolosan, et je m'engage à les respecter sur
                                    la durée totale de scolarisation de mon enfant.
                                </Typography>
                                <Controller
                                    control={control}
                                    name="charter_accepted"
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={!!field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                            }
                                            label="Lu et approuvé – j'accepte la Charte Calandreta et le règlement intérieur"
                                        />
                                    )}
                                />
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* ── Submit ───────────────────────────────────────────── */}
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={status === "loading"}
                        startIcon={
                            status === "loading" ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : null
                        }
                    >
                        {status === "loading"
                            ? "Envoi en cours…"
                            : isEditMode
                                ? "Enregistrer les modifications"
                                : "Envoyer le dossier"}
                    </Button>

                    {status === "succeeded" && (
                        <Alert severity="success" onClose={handleDismissSuccess}>
                            {isEditMode
                                ? "Dossier mis à jour avec succès."
                                : "Dossier envoyé avec succès."}
                        </Alert>
                    )}
                    {status === "failed" && (
                        <Alert severity="error" onClose={handleDismissSuccess}>
                            {error ?? "Une erreur est survenue."}
                        </Alert>
                    )}
                </Stack>
            </form>
        </Box>
    );
}
