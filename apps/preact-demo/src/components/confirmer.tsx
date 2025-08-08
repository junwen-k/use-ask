import { createSingletonCallStore, useSingletonCallStore } from '@ui-call/preact';

const confirmStore = createSingletonCallStore<string>();

export const confirm = confirmStore.call.bind(confirmStore);

export function Confirmer() {
  const call = useSingletonCallStore(confirmStore);
  if (!call) {
    return null;
  }

  return (
    <dialog
      open={call.pending}
      onCancel={() => call.resolve(false)}
      onClose={() => call.resolve(false)}
    >
      <p>{call.payload}</p>
      <button onClick={() => call.resolve(true)}>OK</button>
      <button onClick={() => call.resolve(false)}>Cancel</button>
    </dialog>
  );
}
