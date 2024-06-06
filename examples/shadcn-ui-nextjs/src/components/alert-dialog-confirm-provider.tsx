'use client'

import * as React from 'react'
import { useAsk } from 'use-ask'

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

const AlertDialogConfirmContext = React.createContext<{
  confirm: (options: AlertDialogConfirmActionOptions) => Promise<boolean>
  safeConfirm: (options: AlertDialogConfirmActionOptions) => Promise<boolean>
}>({
  confirm: () => new Promise((resolve) => resolve(true)),
  safeConfirm: () => new Promise((resolve) => resolve(true)),
})

interface AlertDialogConfirmActionOptions {
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
} as const satisfies AlertDialogConfirmActionOptions

export const AlertDialogConfirmProvider = ({ children }: React.PropsWithChildren) => {
  const [{ ask: asyncConfirm, safeAsk: asyncSafeConfirm }, { asking, cancel, ok }] =
    useAsk<boolean>()

  const [options, setOptions] = React.useState<AlertDialogConfirmActionOptions>({})
  const [key, setKey] = React.useState(0)

  const handleConfirm = React.useCallback(
    (options: AlertDialogConfirmActionOptions = {}, safe?: boolean) => {
      setKey((prevKey) => prevKey + 1)
      setOptions({ ...defaultOptions, ...options })

      return safe ? asyncSafeConfirm().then(({ ok }) => ok) : asyncConfirm()
    },
    [asyncConfirm, asyncSafeConfirm]
  )

  const confirm = React.useCallback(
    (options: AlertDialogConfirmActionOptions = {}) => handleConfirm(options),
    [handleConfirm]
  )

  const safeConfirm = React.useCallback(
    (options: AlertDialogConfirmActionOptions = {}) => handleConfirm(options, true),
    [handleConfirm]
  )

  return (
    <AlertDialogConfirmContext.Provider
      value={{
        confirm,
        safeConfirm,
      }}
    >
      {children}
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
    </AlertDialogConfirmContext.Provider>
  )
}

export const useAlertDialogConfirm = () => {
  const alertDialogConfirmContext = React.useContext(AlertDialogConfirmContext)
  if (!alertDialogConfirmContext) {
    throw new Error('useAlertDialogConfirm should be used within <AlertDialogConfirmProvider>')
  }
  return alertDialogConfirmContext
}
