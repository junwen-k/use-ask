<script lang="ts" setup>
import type { SingletonCallStore } from '@ui-call/core';
import { useSingletonCallStore } from '../use-singleton-call-store';

const { store } = defineProps<{
  store: SingletonCallStore;
}>();

const current = useSingletonCallStore(store);
</script>

<template>
  <div v-if="current" data-testid="call">
    <p data-testid="payload">{{ current.payload }}</p>
    <p data-testid="pending">{{ current.pending }}</p>
    <button data-testid="resolve" @click="() => current?.resolve(true)">
      OK
    </button>
    <button data-testid="reject" @click="() => current?.reject()">
      Cancel
    </button>
  </div>
  <div v-else data-testid="no-call">
    No current call
  </div>
</template>
