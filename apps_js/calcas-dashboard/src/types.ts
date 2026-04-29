import * as z from 'zod'

export const RegistrationFormSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    birth_date: z.coerce.date(),
    grade: z.number(),
document: z.file().mime('application/pdf') // TODO rename the document

})

export type RegistrationFormType = z.infer<typeof RegistrationFormSchema>
export type RegistrationFormInputType = z.input<typeof RegistrationFormSchema>