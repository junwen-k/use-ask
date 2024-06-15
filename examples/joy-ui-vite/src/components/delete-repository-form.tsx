import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@mui/joy'
import * as React from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { z } from 'zod'

import { Form, FormField, FormControl, FormLabel, FormMessage } from '@/components/form'

const formSchema = z.object({
  repository: z.string().refine((repository) => repository === 'junwen-k/use-ask'),
})

export type DeleteRepositoryFormData = z.infer<typeof formSchema>

interface DeleteRepositoryFormProps
  extends Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit'> {
  onSubmit: (data: DeleteRepositoryFormData) => void
}

export const DeleteRepositoryForm = React.forwardRef<
  React.ElementRef<'form'>,
  DeleteRepositoryFormProps
>(({ onSubmit, ...props }, ref) => {
  const form = useForm<DeleteRepositoryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repository: '',
    },
  })

  return (
    <Form {...form}>
      <form ref={ref} onSubmit={form.handleSubmit(onSubmit)} {...props} />
    </Form>
  )
})
DeleteRepositoryForm.displayName = 'DeleteRepositoryForm'

export const DeleteRepositoryFormFields = () => {
  const form = useFormContext<DeleteRepositoryFormData>()

  return (
    <FormField
      control={form.control}
      rules={{ required: true }}
      name="repository"
      render={({ field }) => (
        <FormControl required>
          <FormLabel>To confirm, type "junwen-k/use-ask" in the box below</FormLabel>
          <Input placeholder="junwen-k/use-ask" {...field} />
          <FormMessage />
        </FormControl>
      )}
    />
  )
}

export const DeleteRepositoryFormSubmitButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ disabled, type = 'submit', variant = 'solid', color = 'danger', ...props }, ref) => {
  const form = useFormContext<DeleteRepositoryFormData>()

  return (
    <Button
      ref={ref}
      disabled={!form.formState.isValid || disabled}
      type={type}
      variant={variant}
      color={color}
      {...props}
    >
      Delete
    </Button>
  )
})
DeleteRepositoryFormSubmitButton.displayName = 'DeleteRepositoryFormSubmitButton'
