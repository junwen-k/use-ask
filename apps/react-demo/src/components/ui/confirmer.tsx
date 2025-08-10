'use client';

import { createSingletonCallStore, useSingletonCallStore } from '@ui-call/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
  const call = useSingletonCallStore(confirmStore);

  return (
    <AlertDialog open={call?.pending}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{call?.payload.title}</AlertDialogTitle>
          <AlertDialogDescription>{call?.payload.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => call?.resolve(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => call?.resolve(true)}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
