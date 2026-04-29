import * as z from 'zod'

export type UserRole = 'legal_representative' | 'registration_supervisor'

export interface AuthUser {
    username: string
    role: UserRole
}

export const RegistrationFormSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    birth_date: z.coerce.date(),
    grade: z.number(),
document: z.file().mime('application/pdf') // TODO rename the document

})

export type RegistrationFormType = z.infer<typeof RegistrationFormSchema>
export type RegistrationFormInputType = z.input<typeof RegistrationFormSchema>