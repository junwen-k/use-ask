'use client'

import { confirm } from '@/components/confirmer'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { toast } from 'sonner'
import { useAsk } from 'use-ask'

import {
  DeleteRepositoryForm,
  DeleteRepositoryFormFields,
  DeleteRepositoryFormSubmitButton,
  type DeleteRepositoryFormData,
} from '@/components/delete-repository-form'
import { ModeToggle } from '@/components/mode-toggle'
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
import { Popover, PopoverContent } from '@/components/ui/popover'
import {
  UpdateRepositoryForm,
  UpdateRepositoryFormFields,
  type UpdateRepositoryFormData,
} from '@/components/update-repository-form'

const Home = () => {
  const [{ safeAsk: safeAskDeleteRepository }, askDeleteRepository] =
    useAsk<DeleteRepositoryFormData>()
  const [{ safeAsk: safeAskRenameRepository }, askRenameRepository] = useAsk()

  const handleDeleteRepository = async () => {
    const answer = await safeAskDeleteRepository()
    if (!answer.ok) {
      return
    }

    toast.success(`Successfully deleted repository ${answer.data.repository}.`)
  }

  const handleRenameRepository = async (data: UpdateRepositoryFormData) => {
    const answer = await safeAskRenameRepository()
    if (!answer.ok) {
      return
    }

    toast.success(`Successfully renamed repository ${data.repository}.`)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex justify-end p-6">
        <ModeToggle />
      </header>
      <main className="grid flex-1 place-items-center px-6">
        <AlertDialog
          open={askDeleteRepository.asking}
          onOpenChange={(open) => !open && askDeleteRepository.cancel()}
        >
          <AlertDialogContent asChild>
            <DeleteRepositoryForm onSubmit={askDeleteRepository.ok}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete junwen-k/use-ask</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your repository and
                  remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <DeleteRepositoryFormFields />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <DeleteRepositoryFormSubmitButton />
              </AlertDialogFooter>
            </DeleteRepositoryForm>
          </AlertDialogContent>
        </AlertDialog>
        <div className="grid w-full max-w-screen-md gap-8">
          <div className="grid gap-2">
            <h2 className="text-2xl">General</h2>
            <Popover
              open={askRenameRepository.asking}
              onOpenChange={(open) => !open && askRenameRepository.cancel()}
            >
              <UpdateRepositoryForm
                onSubmit={handleRenameRepository}
                className="w-full max-w-md space-y-4"
              >
                <UpdateRepositoryFormFields />
                <PopoverPrimitive.Anchor asChild>
                  <Button type="submit">Rename</Button>
                </PopoverPrimitive.Anchor>
                <PopoverContent side="right">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <h4 className="font-medium leading-none">Rename repository</h4>
                      <p className="text-muted-foreground text-sm">
                        Renaming repository might have unwanted consequences, please proceed with
                        caution.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={askRenameRepository.cancel}
                      >
                        Cancel
                      </Button>
                      <Button className="w-full" onClick={askRenameRepository.ok}>
                        Rename
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </UpdateRepositoryForm>
            </Popover>
          </div>
          <div className="grid gap-2">
            <h2 className="text-2xl">Danger Zone</h2>
            <ul className="border-destructive/50 bg-card text-card-foreground divide-y rounded-lg border">
              <li className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="text-sm">
                  <h6 className="font-semibold">Archive this repository</h6>
                  <p className="text-muted-foreground">
                    Mark this repository as archived and read-only.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() =>
                    confirm({
                      title: 'Archive repository',
                      description:
                        'This repository will become read-only. You will still be able to fork the repository and unarchive it at any time.',
                      actionText: 'Archive',
                      ActionProps: {
                        variant: 'destructive',
                      },
                    })
                      .then(() => toast.success('Successfully archived repository.'))
                      .catch(() => {})
                  }
                >
                  Archive this repository
                </Button>
              </li>
              <li className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="text-sm">
                  <h6 className="font-semibold">Delete this repository</h6>
                  <p className="text-muted-foreground">
                    Once you delete a repository, there is no going back. Please be certain.
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteRepository}>
                  Delete this repository
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home
