![@ui-call's Logo](../../docs/@ui-call.svg) ![Preact's Logo](./docs/preact.svg)

# @ui-call/preact

Idiomatic Preact bindings for `@ui-call/core` with lightweight hooks and optional first-class `@preact/signals` support.

## 📦 Installation

```bash
npm install @ui-call/preact
```

## 🚀 Getting Started

This example demonstrates the most common use case: a confirmation dialog using a singleton call store.

### Create a `<Confirmer />` Component

Build your own callable confirmation dialog using the singleton call store:

```tsx
import { createSingletonCallStore, useSingletonCallStore } from '@ui-call/preact';

const store = createSingletonCallStore<string, boolean>();

export const confirm = store.call.bind(store);

export function Confirmer() {
  const call = useSingletonCallStore(store);

  if (!call?.pending) {
    return null;
  }

  return (
    // Using a basic <dialog> for brevity—customize the UI as needed
    <dialog open onCancel={() => call.resolve(false)}>
      <p>{call.payload}</p>
      <button onClick={() => call.resolve(false)}>Cancel</button>
      <button onClick={() => call.resolve(true)}>OK</button>
    </dialog>
  );
}
```

### Add `<Confirmer />` to Your App

Place it anywhere in your component tree:

```tsx
import { Confirmer } from '@/components/confirmer';

export function App() {
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

### Using `@preact/signals` (optional)

If you're already using `@preact/signals` in your project, you can switch to the signals variant by changing imports. The only difference is you read values via `.value`:

```tsx
import { createSingletonCallStore, useSingletonCallStore } from '@ui-call/preact/signals';

const store = createSingletonCallStore<string, boolean>({ unmountingDelay: 150 });

export const confirm = store.call.bind(store);

export function Confirmer() {
  const callSignal = useSingletonCallStore(store);

  const call = callSignal.value;
  if (!call?.pending) {
    return null;
  }

  return (
    <dialog open onCancel={() => call.resolve(false)}>
      <p>{call.payload}</p>
      <button onClick={() => call.resolve(false)}>Cancel</button>
      <button onClick={() => call.resolve(true)}>OK</button>
    </dialog>
  );
}
```
