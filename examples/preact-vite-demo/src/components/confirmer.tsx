import {
  createCallStore,
  createSingletonCallStore,
  useCallStore,
  useSingletonCallStore,
} from '@ui-call/preact';

const confirmStore = createSingletonCallStore<string>();

export const confirm = confirmStore.call.bind(confirmStore);

export function Confirmer() {
  console.log('Confirmer rendered');

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

const stackableConfirmStore = createCallStore<string>();

export const stackableConfirm = stackableConfirmStore.call.bind(stackableConfirmStore);

export function StackableConfirmer() {
  console.log('StackableConfirmer rendered');

  const stack = useCallStore(stackableConfirmStore);
  if (!stack) {
    return null;
  }

  return stack.map((call, index) => (
    <dialog
      key={call.id}
      open={call.pending}
      onCancel={() => call.resolve(false)}
      onClose={() => call.resolve(false)}
    >
      <p>{call.payload}</p>
      <button onClick={() => stackableConfirmStore.call(`Call #${index}`)}>Again!</button>
      <button onClick={() => call.resolve(true)}>OK</button>
      <button onClick={() => call.resolve(false)}>Cancel</button>
    </dialog>
  ));
}
