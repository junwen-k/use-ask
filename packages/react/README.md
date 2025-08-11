![@ui-call's Logo](../../docs/@ui-call.svg) ![React's Logo](./docs/react.svg)

# @ui-call/react

Idiomatic React bindings for `@ui-call/core`, built on `useSyncExternalStore` for stable, performant reactivity in React 18+.

## 📦 Installation

```bash
npm install @ui-call/react
```

## 🚀 Getting Started

This example demonstrates the most common use case: a confirmation dialog using a singleton call store.

### Create a `<Confirmer />` Component

Build your own callable confirmation dialog using the singleton call store:

```tsx
'use client';

import { createSingletonCallStore, useSingletonCallStore } from '@ui-call/react';

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

Place it anywhere in your component tree, including server components like `layout.tsx`:

```tsx
import { Confirmer } from '@/components/confirmer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Confirmer />
      </body>
    </html>
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
