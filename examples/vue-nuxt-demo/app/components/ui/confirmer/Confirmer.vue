<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  <AlertDialog v-if="call" :open="call.pending">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ call.payload.title }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ call.payload.message }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="call.resolve(false)">Cancel</AlertDialogCancel>
        <AlertDialogAction @click="call.resolve(true)">Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
