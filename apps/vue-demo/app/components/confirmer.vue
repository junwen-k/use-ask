<script setup lang="ts">
import { useSingletonCallStore } from '@ui-call/vue';

const call = useSingletonCallStore(confirmStore);
</script>

<script lang="ts">
import { createSingletonCallStore } from '@ui-call/vue';

const confirmStore = createSingletonCallStore<{
  title: string;
  message: string;
}>({
  unmountingDelay: 200,
});

export const confirm = confirmStore.call.bind(confirmStore);
</script>

<template>
  <ConfirmationDialog v-if="call" :open="Boolean(call)" :closing="!call.pending" :title="call.payload.title"
    @confirm="call.resolve(true)" @cancel="call.resolve(false)">
    {{ call.payload.message }}
  </ConfirmationDialog>
</template>
