'use client'

import { createAsk } from 'use-ask'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

const [confirmStore, useConfirmStore] = createAsk<ConfirmOptions, boolean>()

export const confirm = confirmStore.ask

export const safeConfirm = confirmStore.safeAsk

interface ConfirmOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  cancelText?: React.ReactNode
  actionText?: React.ReactNode
  CancelProps?: React.ComponentProps<typeof AlertDialogCancel>
  ActionProps?: React.ComponentProps<typeof Button>
}

const defaultOptions = {
  title: 'Are you sure?',
  cancelText: 'Cancel',
  actionText: 'Continue',
} as const satisfies ConfirmOptions

export const Confirmer = () => {
  const { asking, cancel, ok, key, props } = useConfirmStore()

  const options = { ...defaultOptions, ...props }

  return (
    <AlertDialog key={key} open={asking} onOpenChange={(open) => !open && cancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>{options.description}</AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel {...options.CancelProps}>{options.cancelText}</AlertDialogCancel>
          <Button {...options.ActionProps} onClick={() => ok(true)}>
            {options.actionText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
