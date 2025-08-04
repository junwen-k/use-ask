<script lang="ts" setup>
import type { CallStore } from '@ui-call/core';
import { useCallStore } from '../use-call-store';

const { store } = defineProps<{
  store: CallStore;
}>();

const stack = useCallStore(store);
</script>

<template>
  <div v-for="(call, index) in stack" :key="call.id" :data-testid="`call-${index}`">
    <p :data-testid="`payload-${index}`">{{ call.payload }}</p>
    <button :data-testid="`resolve-${index}`" @click="() => call.resolve(true)">
      OK
    </button>
    <button :data-testid="`reject-${index}`" @click="() => call.reject()">
      Cancel
    </button>
  </div>
</template>
