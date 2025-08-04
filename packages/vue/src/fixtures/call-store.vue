<script lang="ts" setup>
import type { CallStore } from '@ui-call/core';
import { useCallStore } from '../use-call-store';

const { store } = defineProps<{
  store: CallStore;
}>();

const stack = useCallStore(store);
</script>

<template>
  <div v-for="call in stack" :key="call.id" data-testid="call">
    <p data-testid="payload">{{ call.payload }}</p>
    <button data-testid="resolve" @click="() => call.resolve(true)">
      OK
    </button>
    <button data-testid="reject" @click="() => call.reject()">
      Cancel
    </button>
  </div>
</template>
