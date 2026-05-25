import * as z from 'zod'

export type UserRole = 'legal_representative' | 'registration_supervisor'

export interface AuthUser {
    username: string
    role: UserRole
}

// ─── Emergency contact ────────────────────────────────────────────────────────
export const EmergencyContactSchema = z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    relation: z.string().optional(),
})
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>

// ─── Authorized pickup person ─────────────────────────────────────────────────
export const AuthorizedPickupPersonSchema = z.object({
    name: z.string().min(1),
    relation: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
})
export type AuthorizedPickupPerson = z.infer<typeof AuthorizedPickupPersonSchema>

// ─── Diseases history ─────────────────────────────────────────────────────────
export const DiseasesHistorySchema = z.object({
    angine: z.boolean().optional(),
    asthme: z.boolean().optional(),
    coqueluche: z.boolean().optional(),
    oreillons: z.boolean().optional(),
    otites: z.boolean().optional(),
    rhumatisme: z.boolean().optional(),
    rougeole: z.boolean().optional(),
    rubeole: z.boolean().optional(),
    scarlatine: z.boolean().optional(),
    varicelle: z.boolean().optional(),
})
export type DiseasesHistory = z.infer<typeof DiseasesHistorySchema>

// ─── Registration form ────────────────────────────────────────────────────────
export const RegistrationFormSchema = z.object({
    // Child info
    firstname: z.string().min(1, "Prénom requis"),
    lastname: z.string().min(1, "Nom requis"),
    birth_date: z.coerce.date(),
    birth_place: z.string().optional(),
    postal_code: z.string().optional(),
    nationality: z.string().optional(),
    address: z.string().optional(),
    grade: z.number(),

    // Family situation
    family_situation: z.enum(["married_or_cohabiting", "divorced_or_separated", "single_parent"]).optional(),
    siblings_brothers: z.coerce.number().int().min(0).optional(),
    siblings_sisters: z.coerce.number().int().min(0).optional(),

    // Documents
    document: z.instanceof(File).optional(),
    vaccination_document: z.instanceof(File).optional(),
    insurance_document: z.instanceof(File).optional(),
    divorce_judgment: z.instanceof(File).optional(),

    // Fiche sanitaire
    other_vaccines: z.string().optional(),
    diseases_history: DiseasesHistorySchema.optional(),
    samu_authorized: z.boolean().optional(),
    emergency_contacts: z.array(EmergencyContactSchema).optional(),
    allergies_info: z.string().optional(),

    // Sortie pédagogique
    school_trips_authorized: z.boolean().optional(),
    doctor_name_phone: z.string().optional(),

    // Droit à l'image
    image_rights_authorized: z.boolean().optional(),

    // Personnes autorisées à récupérer l'enfant
    authorized_pickup_persons: z.array(AuthorizedPickupPersonSchema).optional(),

    // Charte
    charter_accepted: z.boolean().optional(),
})

export type RegistrationFormType = z.infer<typeof RegistrationFormSchema>
export type RegistrationFormInputType = z.input<typeof RegistrationFormSchema>

// ─── Profile form (LegalRepresentative) ──────────────────────────────────────
export const ProfileFormSchema = z.object({
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    birth_date: z.string().optional(),
    address: z.string().optional(),
    phone_home: z.string().optional(),
    phone_mobile: z.string().optional(),
    phone_work: z.string().optional(),
    profession: z.string().optional(),
    has_parental_authority: z.boolean().optional(),
    insurance_reference: z.string().optional(),
    coordinates_sharing_authorized: z.boolean().optional(),
    pool_accompaniment: z.boolean().optional(),
    pool_attestation: z.instanceof(File).optional(),
})

export type ProfileFormType = z.infer<typeof ProfileFormSchema>

export interface ProfileData {
    email: string
    firstname: string | null
    lastname: string | null
    birth_date: string | null
    address: string | null
    phone_home: string | null
    phone_mobile: string | null
    phone_work: string | null
    profession: string | null
    has_parental_authority: boolean | null
    insurance_reference: string | null
    coordinates_sharing_authorized: boolean | null
    pool_accompaniment: boolean
    pool_attestation: string | null
}
