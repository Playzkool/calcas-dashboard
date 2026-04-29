import {Box, TextField, Typography} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import {RegistrationFormSchema, type RegistrationFormType} from "../types.ts";
import {zodResolver} from "@hookform/resolvers/zod";


const defaultValues = {}
export function RegistrationForm() {
    const {
        register,
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegistrationFormType>({
        resolver: zodResolver(RegistrationFormSchema),
        defaultValues
    })

    const onSubmit = (data: RegistrationFormType) => {
        console.log(`Data to POST : ${data}`)
    }
    return (
        <Box>
            <Typography >TEST FORM WIZARD</Typography>

            <form onSubmit={handleSubmit(onSubmit)} >

                <Controller control={control} render={
                    ({field: {value, onChange}, ...rest}) => {
                        return <TextField
                                    label={"Prénom"}
                                    value={value}
                                    onChange={(_, v) => onChange(v)}
                                    {...rest}
                                     />
                    }
                } name={'firstname'} />

            </form>

        </Box>
    )
}