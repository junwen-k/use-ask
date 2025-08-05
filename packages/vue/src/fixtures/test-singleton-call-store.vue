<script setup lang="ts">
import { SingletonCallStore } from '@ui-call/core';
import { useSingletonCallStore } from '../use-store';

const props = defineProps<{
  store: SingletonCallStore;
}>();

const current = useSingletonCallStore(props.store);
</script>

<template>
  <div data-testid="current">{{ current ? current.payload : 'null' }}</div>
</template>
