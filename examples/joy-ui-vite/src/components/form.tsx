import { ErrorMessage } from '@hookform/error-message'
import { FormControl as MuiFormControl, FormLabel, FormHelperText, Typography } from '@mui/joy'
import * as React from 'react'
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form'
import { Controller, FormProvider, useFormContext } from 'react-hook-form'

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  return {
    name: fieldContext.name,
    ...fieldState,
  }
}

const FormControl = React.forwardRef<
  React.ElementRef<typeof MuiFormControl>,
  React.ComponentPropsWithoutRef<typeof MuiFormControl>
>(({ error, ...props }, ref) => {
  const { invalid } = useFormField()

  return <MuiFormControl ref={ref} error={invalid || error} {...props} />
})
FormControl.displayName = 'FormControl'

const FormMessage = React.forwardRef<
  React.ElementRef<typeof ErrorMessage>,
  Omit<React.ComponentPropsWithoutRef<typeof ErrorMessage>, 'name' | 'render'>
>((props, ref) => {
  const { name } = useFormField()

  return (
    <ErrorMessage
      ref={ref}
      name={name}
      render={({ message }) => (
        <Typography level="body-sm" color="danger">
          {message}
        </Typography>
      )}
      {...props}
    />
  )
})
FormMessage.displayName = 'FormMessage'

export { Form, FormLabel, FormControl, FormField, FormHelperText, FormMessage }
