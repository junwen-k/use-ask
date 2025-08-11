<script lang="ts" module>
  import { CallStore } from '@ui-call/svelte';
  import { tv } from 'tailwind-variants';

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

  const containerVariants = tv({
    base: 'pointer-events-none fixed z-50 flex gap-2 p-4',
    variants: {
      position: {
        'top-right': 'top-0 right-0 flex-col items-end',
        'top-left': 'top-0 left-0 flex-col items-start',
        'bottom-right': 'bottom-0 right-0 flex-col items-end',
        'bottom-left': 'bottom-0 left-0 flex-col items-start',
      },
    },
    defaultVariants: {
      position: 'top-right',
    },
  });

  const toastVariants = tv({
    base: 'toast pointer-events-auto w-80 max-w-sm overflow-hidden rounded-md border shadow-lg',
    variants: {
      variant: {
        success:
          'border-green-300 bg-green-50 text-green-900 dark:border-green-900/40 dark:bg-green-950 dark:text-green-100',
        destructive:
          'border-red-300 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950 dark:text-red-100',
        info: 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950 dark:text-blue-100',
        default: 'bg-background text-foreground border-border',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  });

  function t(payload: ToastPayload) {
    const { duration = DEFAULT_DURATION_MS, ...rest } = payload ?? {};
    const promise = toastStore.call(rest);
    if (duration > 0) {
      setTimeout(() => {
        toastStore.resolve(promise);
      }, duration);
    }
    return promise;
  }

  function success(payload: Omit<ToastPayload, 'variant'>) {
    return t({ variant: 'success', ...payload });
  }

  function error(payload: Omit<ToastPayload, 'variant'>) {
    return t({ variant: 'destructive', ...payload });
  }

  function info(payload: Omit<ToastPayload, 'variant'>) {
    return t({ variant: 'info', ...payload });
  }

  function dismiss(promise: ReturnType<typeof t>) {
    toastStore.resolve(promise);
  }

  function update(promise: ReturnType<typeof t>, payload: Partial<ToastPayload>) {
    return toastStore.update(promise, payload as ToastPayload);
  }

  export const toast = Object.assign(t, {
    success,
    error,
    info,
    dismiss,
    update,
  });

  export type ToastProps = {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
</script>

<script lang="ts">
  import { cn } from '$lib/utils.js';
  import ToastIcon from './toast-icon.svelte';
  import ToastTitle from './toast-title.svelte';
  import ToastDescription from './toast-description.svelte';
  import ToastAction from './toast-action.svelte';
  import ToastClose from './toast-close.svelte';

  let { position = 'top-right' }: ToastProps = $props();
</script>

<div class={containerVariants({ position })}>
  {#each toastStore.stack as call (call.id)}
    <div
      class={cn(toastVariants({ variant: call.payload.variant }))}
      data-state={call.pending ? 'open' : 'closed'}
      aria-live="polite"
      role="status"
    >
      <div class="flex items-start p-4">
        <ToastIcon variant={call.payload.variant} class="mr-3 mt-0.5" />
        <div class="flex-1">
          {#if call.payload.title}
            <ToastTitle>{call.payload.title}</ToastTitle>
          {/if}
          {#if call.payload.description}
            <ToastDescription>{call.payload.description}</ToastDescription>
          {/if}
        </div>
        {#if call.payload.action}
          <ToastAction
            onclick={() => {
              call.payload.action?.onClick?.();
              toastStore.resolve(call.promise);
            }}
          >
            {call.payload.action.label}
          </ToastAction>
        {/if}
        <ToastClose aria-label="Close" onclick={() => toastStore.resolve(call.promise)} />
      </div>
    </div>
  {/each}
</div>

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
