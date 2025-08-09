'use client';

import { createSingletonCallStore, useSingletonCallStore } from '@ui-call/react';
import { useEffect } from 'react';
import { ConfirmationDialog } from './confirmation-dialog';

const confirmStore = createSingletonCallStore<{
  title: string;
  loading?: boolean;
  error?: Error | null;
}>();

export const withConfirmation = (
  payload: Parameters<typeof confirmStore.call>[0],
  callback: () => void
) =>
  confirmStore.call({
    ...payload,
  });

export function Confirmer() {
  console.log('Confirmer rendered');

  const call = useSingletonCallStore(confirmStore);
  if (!call) {
    return null;
  }

  useEffect(() => {
    confirmStore.update(call.payload);
  }, [call]);

  return (
    <div>
      <button onClick={() => confirmStore.update({ title: 'Updated title' })}>
        Update payload test
      </button>
      <ConfirmationDialog
        open={call.pending}
        onConfirm={() => call.resolve(true)}
        onCancel={() => call.resolve(false)}
        title={call.payload.title}
        loading={call.payload.loading}
        error={call.payload.error}
      />
    </div>
  );
}
