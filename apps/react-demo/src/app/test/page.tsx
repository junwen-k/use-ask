'use client';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

const mockApiFn = () =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      // Randomly succeed or fail with 50% probability
      if (Math.random() > 0.5) {
        resolve(void 0);
      } else {
        reject(new Error('Random failure'));
      }
    }, 2000);
  });

export default function TestPage() {
  const [open, setOpen] = useState(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: mockApiFn,
    onSuccess: () => setOpen(false),
  });

  return (
    <div>
      <ConfirmationDialog
        open={open}
        onConfirm={mutate}
        onCancel={() => setOpen(false)}
        title="Are you sure?"
        loading={isPending}
        error={error}
      />
      <button onClick={() => setOpen(true)}>Mutate</button>
    </div>
  );
}
