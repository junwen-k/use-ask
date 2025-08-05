<script setup lang="ts">
import { CallStore } from '@ui-call/core';
import { useCallStore } from '../use-store';

const props = defineProps<{
  store: CallStore;
}>();

const stack = useCallStore(props.store);
</script>

<template>
  <div data-testid="stack">{{ stack.length }}</div>
</template>
