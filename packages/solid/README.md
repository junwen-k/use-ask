![@ui-call's Logo](../../docs/@ui-call.svg) ![Solid's Logo](./docs/solid.svg)

# @ui-call/solid

Idiomatic Solid bindings for `@ui-call/core` with signal-first subscriptions via `from`.

## 📦 Installation

```bash
npm install @ui-call/solid
```

## 🚀 Getting Started

This example demonstrates the most common use case: a confirmation dialog using a singleton call store.

### Create a `<Confirmer />` Component

Build your own callable confirmation dialog using the singleton call store:

```tsx
import { createSingletonCallStore, createSingletonCallStoreSignal } from '@ui-call/solid';

const store = createSingletonCallStore<string, boolean>();

export const confirm = store.call.bind(store);

export function Confirmer() {
  const call = createSingletonCallStoreSignal(store);

  return (
    // Using a basic <dialog> for brevity—customize the UI as needed
    <dialog open={!!call()?.pending} onCancel={() => call()?.resolve(false)}>
      <p>{call()?.payload}</p>
      <button onClick={() => call()?.resolve(false)}>Cancel</button>
      <button onClick={() => call()?.resolve(true)}>OK</button>
    </dialog>
  );
}
```

### Add `<Confirmer />` to Your App

Place it anywhere in your component tree:

```tsx
import { Confirmer } from '@/components/confirmer';

export default function App() {
  return (
    <>
      {/* ...your app... */}
      <Confirmer />
    </>
  );
}
```

### Call Your Confirmation Dialog

Imperatively trigger your custom UI from anywhere in your app:

```tsx
import { confirm } from '@/components/confirmer';

function DeleteButton() {
  async function handleDelete() {
    const confirmed = await confirm('Are you sure you want to delete this item?');
    if (confirmed) {
      deleteItem();
    }
  }

  return <button onClick={handleDelete}>Delete</button>;
}
```
