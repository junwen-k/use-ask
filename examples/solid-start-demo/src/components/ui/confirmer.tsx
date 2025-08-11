import { createSingletonCallStore, createSingletonCallStoreSignal } from '@ui-call/solid';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const confirmStore = createSingletonCallStore<{
  title: string;
  message: string;
}>({
  unmountingDelay: 150,
});

export const confirm = confirmStore.call.bind(confirmStore);

export function Confirmer() {
  const call = createSingletonCallStoreSignal(confirmStore);

  return (
    <AlertDialog open={call()?.pending}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{call()?.payload.title}</AlertDialogTitle>
          <AlertDialogDescription>{call()?.payload.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose onClick={() => call()?.resolve(false)}>Cancel</AlertDialogClose>
          <AlertDialogAction onClick={() => call()?.resolve(true)}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
