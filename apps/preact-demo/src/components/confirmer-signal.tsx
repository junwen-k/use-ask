import { For } from '@preact/signals/utils';
import {
  createCallStore,
  createSingletonCallStore,
  useCallStore,
  useSingletonCallStore,
} from '@ui-call/preact/signals';

const confirmStore = createSingletonCallStore<string>();

export const confirm = confirmStore.call.bind(confirmStore);

export function Confirmer() {
  console.log('Confirmer signal rendered');

  const signal = useSingletonCallStore(confirmStore);

  const call = signal.value;
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
  console.log('StackableConfirmer signal rendered');

  const signal = useCallStore(stackableConfirmStore);

  return (
    <For each={signal}>
      {(call, index) => (
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
      )}
    </For>
  );
}
