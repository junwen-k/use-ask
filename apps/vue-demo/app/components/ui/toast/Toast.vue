<script setup lang="ts">
import { createCallStore, useCallStore } from '@ui-call/vue';
import { computed } from 'vue';

export type ToastVariant = 'default' | 'success' | 'destructive' | 'info';

export interface ToastPayload {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onClick?: () => void };
}

const props = withDefaults(defineProps<{ position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' }>(), {
  position: 'top-right',
});

const containerClass = computed(() => {
  const base = 'pointer-events-none fixed z-50 flex gap-2 p-4';
  switch (props.position) {
    case 'top-right':
      return `${base} top-0 right-0 flex-col items-end`;
    case 'top-left':
      return `${base} top-0 left-0 flex-col items-start`;
    case 'bottom-right':
      return `${base} bottom-0 right-0 flex-col items-end`;
    case 'bottom-left':
      return `${base} bottom-0 left-0 flex-col items-start`;
  }
});

function variantClass(variant?: ToastVariant) {
  switch (variant) {
    case 'success':
      return 'border-green-300 bg-green-50 text-green-900 dark:border-green-900/40 dark:bg-green-950 dark:text-green-100';
    case 'destructive':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'info':
      return 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950 dark:text-blue-100';
    default:
      return 'bg-background text-foreground border-border';
  }
}

const stack = useCallStore(store);
</script>

<script lang="ts">
const store = createCallStore<ToastPayload, void, void>({ unmountingDelay: 150 });

const DEFAULT_DURATION_MS = 3000;

function baseToast(payload: ToastPayload) {
  const { duration = DEFAULT_DURATION_MS, ...rest } = payload ?? {};
  const promise = store.call(rest);
  if (duration > 0) {
    setTimeout(() => store.resolve(promise), duration);
  }
  return promise;
}

function success(payload: Omit<ToastPayload, 'variant'>) {
  return baseToast({ variant: 'success', ...payload });
}

function error(payload: Omit<ToastPayload, 'variant'>) {
  return baseToast({ variant: 'destructive', ...payload });
}

function info(payload: Omit<ToastPayload, 'variant'>) {
  return baseToast({ variant: 'info', ...payload });
}

function dismiss(promise: ReturnType<typeof baseToast>) {
  store.resolve(promise);
}

function update(promise: ReturnType<typeof baseToast>, payload: Partial<ToastPayload>) {
  return store.update(promise, payload as ToastPayload);
}

export const toast = Object.assign(baseToast, { success, error, info, dismiss, update });
</script>

<template>
  <div :class="containerClass">
    <div v-for="call in stack" :key="call.id"
      :class="['toast pointer-events-auto w-80 max-w-sm overflow-hidden rounded-md border shadow-lg', variantClass(call.payload.variant)]"
      :data-state="call.pending ? 'open' : 'closed'" aria-live="polite" role="status">
      <div class="flex items-start p-4">
        <div class="flex-1">
          <div v-if="call.payload.title" class="text-sm font-semibold leading-none tracking-tight">
            {{ call.payload.title }}
          </div>
          <div v-if="call.payload.description" class="text-muted-foreground mt-1 text-sm">
            {{ call.payload.description }}
          </div>
        </div>
        <button v-if="call.payload.action"
          class="border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring ring-offset-background ml-3 inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          @click="() => { call.payload.action?.onClick?.(); store.resolve(call.promise); }">
          {{ call.payload.action!.label }}
        </button>
        <button
          class="focus-visible:ring-ring ring-offset-background ml-2 inline-flex h-8 shrink-0 items-center justify-center rounded-md px-2 text-sm opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="Close" @click="() => store.resolve(call.promise)">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.toast {
  will-change: opacity, transform;
}

[data-state='open'] {
  animation: toast-in 160ms ease-out;
}

[data-state='closed'] {
  animation: toast-out 160ms ease-in forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(6px);
  }
}
</style>
