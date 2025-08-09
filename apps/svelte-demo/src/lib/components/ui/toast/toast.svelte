<script lang="ts" module>
  import { CallStore } from '@ui-call/svelte';

  export type ToastVariant = 'default' | 'success' | 'destructive' | 'info';

  export interface ToastPayload {
    title?: string;
    description?: string;
    variant?: ToastVariant;
    duration?: number;
    action?: {
      label: string;
      onClick?: () => void;
    };
  }

  const DEFAULT_DURATION_MS = 3000;

  const toastStore = new CallStore<ToastPayload, void, void>({
    unmountingDelay: 150,
  });

  export function toast(payload: ToastPayload) {
    const { duration = DEFAULT_DURATION_MS, ...rest } = payload ?? {};
    const promise = toastStore.call(rest);
    if (duration > 0) {
      setTimeout(() => {
        toastStore.resolve(promise);
      }, duration);
    }
    return promise;
  }

  export function success(payload: Omit<ToastPayload, 'variant'>) {
    return toast({ variant: 'success', ...payload });
  }

  export function error(payload: Omit<ToastPayload, 'variant'>) {
    return toast({ variant: 'destructive', ...payload });
  }

  export function info(payload: Omit<ToastPayload, 'variant'>) {
    return toast({ variant: 'info', ...payload });
  }

  export function dismiss(promise: ReturnType<typeof toast>) {
    toastStore.resolve(promise);
  }

  export function update(promise: ReturnType<typeof toast>, payload: Partial<ToastPayload>) {
    return toastStore.update(promise, payload as ToastPayload);
  }

  export type ToastProps = {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
</script>

<script lang="ts">
  let { position = 'top-right' }: ToastProps = $props();

  function containerClass() {
    const base = 'pointer-events-none fixed z-50 flex gap-2 p-4';
    switch (position) {
      case 'top-right':
        return `${base} top-0 right-0 flex-col items-end`;
      case 'top-left':
        return `${base} top-0 left-0 flex-col items-start`;
      case 'bottom-right':
        return `${base} bottom-0 right-0 flex-col items-end`;
      case 'bottom-left':
        return `${base} bottom-0 left-0 flex-col items-start`;
    }
  }

  function variantClass(variant: ToastPayload['variant']) {
    switch (variant) {
      case 'success':
        return 'border-green-300 bg-green-50 text-green-900 dark:border-green-900/40 dark:bg-green-950 dark:text-green-100';
      case 'destructive':
        return 'border-red-300 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950 dark:text-red-100';
      case 'info':
        return 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950 dark:text-blue-100';
      default:
        return 'bg-background text-foreground';
    }
  }
</script>

<div class={containerClass()}>
  {#each toastStore.stack as call (call.id)}
    <div
      class={`pointer-events-auto w-80 overflow-hidden rounded-md border shadow ${variantClass(call.payload.variant)}`}
      data-state={call.pending ? 'open' : 'closed'}
      aria-live="polite"
      role="status"
    >
      <div class="flex items-start p-4">
        <div class="flex-1">
          {#if call.payload.title}
            <div class="text-sm font-semibold leading-none tracking-tight">
              {call.payload.title}
            </div>
          {/if}
          {#if call.payload.description}
            <div class="mt-1 text-sm text-muted-foreground">
              {call.payload.description}
            </div>
          {/if}
        </div>
        {#if call.payload.action}
          <button
            class="ml-3 inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none"
            onclick={() => {
              call.payload.action?.onClick?.();
              toastStore.resolve(call.promise);
            }}
          >
            {call.payload.action.label}
          </button>
        {/if}
        <button
          class="ml-2 inline-flex h-8 shrink-0 items-center justify-center rounded-md px-2 text-sm opacity-60 hover:opacity-100 focus:outline-none"
          aria-label="Close"
          onclick={() => toastStore.resolve(call.promise)}
        >
          ✕
        </button>
      </div>
    </div>
  {/each}
</div>
