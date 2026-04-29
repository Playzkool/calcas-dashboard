import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { RegistrationFormSchema, type RegistrationFormType, type RegistrationFormInputType } from "../types.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../hooks";
import { resetRegistration, submitRegistration } from "../store/registration-slice";

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

const defaultValues = {
    firstname: "",
    lastname: "",
};

export function RegistrationForm() {
    const dispatch = useAppDispatch();
    const { status, error } = useAppSelector((state) => state.registration);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RegistrationFormInputType, unknown, RegistrationFormType>({
        resolver: zodResolver(RegistrationFormSchema),
        defaultValues,
    });

    const onSubmit = (data: RegistrationFormType) => {
        dispatch(submitRegistration(data));
    };

    return (
        <Box maxWidth={480} mx="auto" mt={4}>
            <Typography variant="h5" mb={3}>
                Inscription
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                    <Controller
                        control={control}
                        name="firstname"
                        render={({ field }) => (
                            <TextField
                                label="Prénom"
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
                                error={!!errors.lastname}
                                helperText={errors.lastname?.message}
                                {...field}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="birth_date"
                        render={({ field: { value, onChange, ...rest } }) => (
                            <TextField
                                label="Date de naissance"
                                type="date"
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
                        name="grade"
                        render={({ field }) => (
                            <FormControl error={!!errors.grade}>
                                <InputLabel>Niveau</InputLabel>
                                <Select label="Niveau" {...field} value={field.value ?? ""}>
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

<Controller
                        control={control}
                        name="document"
                        render={({ field: { onChange, value, ref } }) => (
                            <FormControl error={!!errors.document}>
                                <Button variant="outlined" component="label">
                                    {value ? (value as File).name : "Joindre un document (PDF)"}
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        ref={ref}
                                        onChange={(e) => onChange(e.target.files?.[0])}
                                    />
                                </Button>
                                {errors.document && (
                                    <FormHelperText>{errors.document.message}</FormHelperText>
                                )}
                            </FormControl>
                        )}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={status === "loading"}
                        startIcon={status === "loading" ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {status === "loading" ? "Envoi en cours…" : "S'inscrire"}
                    </Button>

                    {status === "succeeded" && (
                        <Alert severity="success" onClose={() => { dispatch(resetRegistration()); reset(defaultValues); }}>
                            Inscription envoyée avec succès.
                        </Alert>
                    )}
                    {status === "failed" && (
                        <Alert severity="error" onClose={() => dispatch(resetRegistration())}>
                            {error ?? "Une erreur est survenue."}
                        </Alert>
                    )}
                </Stack>
            </form>
        </Box>
    );
}