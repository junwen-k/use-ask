'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

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
      name="repository"
      render={({ field }) => (
        <FormItem>
          <FormLabel>To confirm, type "junwen-k/use-ask" in the box below</FormLabel>
          <FormControl>
            <Input placeholder="junwen-k/use-ask" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export const DeleteRepositoryFormSubmitButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ disabled, type = 'submit', variant = 'destructive', ...props }, ref) => {
  const form = useFormContext<DeleteRepositoryFormData>()

  return (
    <Button
      ref={ref}
      disabled={!form.formState.isValid || disabled}
      type={type}
      variant={variant}
      {...props}
    >
      Delete
    </Button>
  )
})
DeleteRepositoryFormSubmitButton.displayName = 'DeleteRepositoryFormSubmitButton'
