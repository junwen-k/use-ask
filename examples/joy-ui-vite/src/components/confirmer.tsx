import { WarningRounded } from '@mui/icons-material'
import {
  ModalDialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Modal,
} from '@mui/joy'
import { createAsk } from 'use-ask'

const [confirmStore, useConfirmStore] = createAsk<ConfirmOptions, boolean>()

export const confirm = confirmStore.ask

export const safeConfirm = confirmStore.safeAsk

interface ConfirmOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  cancelText?: React.ReactNode
  actionText?: React.ReactNode
  CancelProps?: React.ComponentProps<typeof Button>
  ActionProps?: React.ComponentProps<typeof Button>
}

const defaultOptions = {
  title: 'Are you sure?',
  cancelText: 'Cancel',
  actionText: 'Continue',
  CancelProps: {
    variant: 'plain',
    color: 'neutral',
  },
  ActionProps: {
    variant: 'solid',
    color: 'danger',
  },
} as const satisfies ConfirmOptions

export const Confirmer = () => {
  const { asking, cancel, ok, key, props } = useConfirmStore()

  const options = { ...defaultOptions, ...props }

  return (
    <Modal key={key} open={asking} onClose={() => cancel()}>
      <ModalDialog variant="outlined" role="alertdialog">
        <DialogTitle>
          <WarningRounded />
          {options.title}
        </DialogTitle>
        <Divider />
        <DialogContent>{options.description}</DialogContent>
        <DialogActions>
          <Button {...options.ActionProps} onClick={() => ok(true)}>
            {options.actionText}
          </Button>
          <Button {...options.CancelProps} onClick={() => cancel()}>
            {options.cancelText}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}
