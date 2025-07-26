<script lang="ts" setup>
import type { CallStore } from '@ui-call/core';
import { useCallStore } from '../use-call-store';

const { store } = defineProps<{
  store: CallStore;
}>();

const entries = useCallStore(store);
</script>

<template>
  <div v-for="entry in entries" :key="entry.id" data-testid="entry">
    <p data-testid="payload">{{ entry.payload }}</p>
    <button data-testid="resolve" @click="() => entry.resolve(true)">
      OK
    </button>
    <button data-testid="reject" @click="() => entry.reject()">
      Cancel
    </button>
  </div>
</template>
