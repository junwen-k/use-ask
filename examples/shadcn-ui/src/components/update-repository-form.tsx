'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { z } from 'zod'

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
  repository: z.string().min(1, { message: 'Repository name is required' }),
})

export type UpdateRepositoryFormData = z.infer<typeof formSchema>

interface UpdateRepositoryFormProps
  extends Omit<React.ComponentPropsWithoutRef<'form'>, 'onSubmit'> {
  onSubmit: (data: UpdateRepositoryFormData) => void
}

export const UpdateRepositoryForm = React.forwardRef<
  React.ElementRef<'form'>,
  UpdateRepositoryFormProps
>(({ onSubmit, ...props }, ref) => {
  const form = useForm<UpdateRepositoryFormData>({
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
UpdateRepositoryForm.displayName = 'UpdateRepositoryForm'

export const UpdateRepositoryFormFields = () => {
  const form = useFormContext<UpdateRepositoryFormData>()

  return (
    <FormField
      control={form.control}
      name="repository"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Repository name</FormLabel>
          <FormControl>
            <Input placeholder="Repository name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
