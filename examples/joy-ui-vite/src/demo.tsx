import { ErrorRounded } from '@mui/icons-material'
import {
  Button,
  Snackbar,
  Container,
  Card,
  Typography,
  List,
  ListItem,
  Divider,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalDialog,
} from '@mui/joy'
import React from 'react'
import { useAsk } from 'use-ask'

import { confirm } from '@/components/confirmer'
import type { DeleteRepositoryFormData } from '@/components/delete-repository-form'
import {
  DeleteRepositoryForm,
  DeleteRepositoryFormFields,
  DeleteRepositoryFormSubmitButton,
} from '@/components/delete-repository-form'

export const Demo = () => {
  const [open, setOpen] = React.useState(false)
  const [message, setMessage] = React.useState('')

  const toast = (message: string) => {
    setOpen(true)
    setMessage(message)
  }

  const [{ safeAsk: safeAskDeleteRepository }, askDeleteRepository] =
    useAsk<DeleteRepositoryFormData>()

  const handleDeleteRepository = async () => {
    const answer = await safeAskDeleteRepository()
    if (!answer.ok) {
      return
    }

    toast(`Successfully deleted repository ${answer.data.repository}.`)
  }

  return (
    <Container component="main" sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
      <Modal open={askDeleteRepository.asking} onClose={askDeleteRepository.cancel}>
        <ModalDialog
          component={DeleteRepositoryForm}
          onSubmit={askDeleteRepository.ok}
          maxWidth="sm"
          color="danger"
          role="alertdialog"
        >
          <DialogTitle>
            <ErrorRounded />
            Delete junwen-k/use-ask
          </DialogTitle>
          <Divider />
          <DialogContent>
            This action cannot be undone. This will permanently delete your repository and remove
            your data from our servers.
          </DialogContent>
          <DialogContent>
            <DeleteRepositoryFormFields />
          </DialogContent>
          <DialogActions>
            <DeleteRepositoryFormSubmitButton />
            <Button variant="plain" color="neutral" onClick={askDeleteRepository.cancel}>
              Cancel
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
      <Card component={List} color="danger" size="sm" variant="outlined">
        <ListItem
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Typography level="title-sm">Archive this repository</Typography>
            <Typography level="body-sm">Mark this repository as archived and read-only.</Typography>
          </div>
          <Button
            variant="solid"
            color="danger"
            onClick={() =>
              confirm({
                title: 'Archive repository',
                description:
                  'This repository will become read-only. You will still be able to fork the repository and unarchive it at any time.',
              })
                .then(() => toast('Successfully archived repository.'))
                .catch(() => {})
            }
          >
            Archive this repository
          </Button>
        </ListItem>
        <Divider />
        <ListItem
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <Typography level="title-sm">Delete this repository</Typography>
            <Typography level="body-sm">
              Once you delete a repository, there is no going back. Please be certain.
            </Typography>
          </div>
          <Button variant="solid" color="danger" onClick={handleDeleteRepository}>
            Delete this repository
          </Button>
        </ListItem>
      </Card>
      <Snackbar
        color="success"
        open={!!open}
        onClose={(_, reason) => reason !== 'clickaway' && setOpen(false)}
        onUnmount={() => setMessage('')}
        autoHideDuration={4000}
      >
        {message}
      </Snackbar>
    </Container>
  )
}
