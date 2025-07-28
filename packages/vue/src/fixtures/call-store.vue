<script lang="ts" setup>
import type { CallStore } from '@ui-call/core';
import { useCallStore } from '../use-call-store';

const { store } = defineProps<{
  store: CallStore;
}>();

const callStacks = useCallStore(store);
</script>

<template>
  <div v-for="callStack in callStacks" :key="callStack.id" data-testid="callStack">
    <p data-testid="payload">{{ callStack.payload }}</p>
    <button data-testid="resolve" @click="() => callStack.resolve(true)">
      OK
    </button>
    <button data-testid="reject" @click="() => callStack.reject()">
      Cancel
    </button>
  </div>
</template>
