![@ui-call's Logo](../../docs/@ui-call.svg) ![Svelte's Logo](./docs/svelte.svg)

# @ui-call/svelte

Idiomatic Svelte bindings for `@ui-call/core`, implemented as reactive subclasses using `createSubscriber`, integrating directly with Svelte's compiler reactivity.

## 📦 Installation

```bash
npm install @ui-call/svelte
```

## 🚀 Getting Started

This example demonstrates the most common use case: a confirmation dialog using a singleton call store.

### Create a `<Confirmer />` Component

Build your own callable confirmation dialog using the singleton call store:

```svelte
<script lang="ts" module>
  import { SingletonCallStore } from '@ui-call/svelte';

  const store = new SingletonCallStore<string, boolean>();

  export const confirm = store.call.bind(store);
</script>

<!-- Using a basic <dialog> for brevity—customize the UI as needed -->
{#if store.current?.pending}
  <dialog open oncancel={() => store.resolve(false)}>
    <p>{store.current?.payload}</p>
    <button onclick={() => store.resolve(false)}>Cancel</button>
    <button onclick={() => store.resolve(true)}>OK</button>
  </dialog>
{/if}
```

> [!NOTE]
> Define your store in `<script module>` so that you can export your `confirm()` function.

### Add `<Confirmer />` to Your App

Place it anywhere in your component tree:

```svelte
<script lang="ts">
  import Confirmer from '@/components/confirmer.svelte';
</script>

<Confirmer />
```

### Call Your Confirmation Dialog

Imperatively trigger your custom UI from anywhere in your app:

```svelte
<script lang="ts">
  import { confirm } from '@/components/confirmer';

  async function handleDelete() {
    const confirmed = await confirm('Are you sure you want to delete this item?');
    if (confirmed) {
      deleteItem();
    }
  }
</script>

<button onclick={handleDelete}>Delete</button>
```
