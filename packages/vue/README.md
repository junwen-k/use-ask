![@ui-call's Logo](../../docs/@ui-call.svg) ![Vue's Logo](./docs/vue.svg)

# @ui-call/vue

Idiomatic Vue bindings for `@ui-call/core` with lightweight `shallowRef`-based subscriptions.

## 📦 Installation

```bash
npm install @ui-call/vue
```

## 🚀 Getting Started

This example demonstrates the most common use case: a confirmation dialog using a singleton call store.

### Create a `<Confirmer />` Component

Build your own callable confirmation dialog using the singleton call store:

```vue
<script setup lang="ts">
import { useSingletonCallStore } from '@ui-call/vue';

const call = useSingletonCallStore(store);
</script>

<script lang="ts">
import { createSingletonCallStore } from '@ui-call/vue';

const store = createSingletonCallStore<string, boolean>();

export const confirm = store.call.bind(store);
</script>

<template>
  <!-- Using a basic <dialog> for brevity—customize the UI as needed -->
  <dialog :open="call?.pending" @cancel="call?.resolve(false)">
    <p>{{ call?.payload }}</p>
    <button @click="call?.resolve(false)">Cancel</button>
    <button @click="call?.resolve(true)">OK</button>
  </dialog>
</template>
```

### Add `<Confirmer />` to Your App

Place it anywhere in your component tree:

```vue
<template>
  <Confirmer />
</template>
```

### Call Your Confirmation Dialog

Imperatively trigger your custom UI from anywhere in your app:

```vue
<script setup lang="ts">
import { confirm } from '@/components/ui/confirmer';

function onDelete() {
  confirm({
    title: 'Are you absolutely sure?',
    message:
      'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
  }).then((result) => alert(`User ${result ? 'confirmed' : 'cancelled'} the action`));
}
</script>

<button @click="handleDelete">Delete</button>
```
