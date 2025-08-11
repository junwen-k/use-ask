import { For, Show } from 'solid-js';
import { createCallStore, createCallStoreSignal } from '@ui-call/solid';
import { cn } from '@/libs/cn';

export type ToastVariant = 'default' | 'success' | 'destructive' | 'info';

export interface ToastPayload {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: { label: string; onClick?: () => void };
}

const DEFAULT_DURATION_MS = 3000;

const toastStore = createCallStore<ToastPayload, void, void>({ unmountingDelay: 150 });

function baseToast(payload: ToastPayload) {
  const { duration = DEFAULT_DURATION_MS, ...rest } = payload ?? {};
  const promise = toastStore.call(rest);
  if (duration > 0) {
    setTimeout(() => toastStore.resolve(promise), duration);
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
  toastStore.resolve(promise);
}

function update(promise: ReturnType<typeof baseToast>, payload: Partial<ToastPayload>) {
  return toastStore.update(promise, payload as ToastPayload);
}

export const toast = Object.assign(baseToast, { success, error, info, dismiss, update });

export function Toast(props: {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}) {
  const position = () => props.position ?? 'top-right';
  const stack = createCallStoreSignal(toastStore);

  const containerClass = () => {
    const base = 'pointer-events-none fixed z-50 flex gap-2 p-4';
    switch (position()) {
      case 'top-right':
        return `${base} top-0 right-0 flex-col items-end`;
      case 'top-left':
        return `${base} top-0 left-0 flex-col items-start`;
      case 'bottom-right':
        return `${base} bottom-0 right-0 flex-col items-end`;
      case 'bottom-left':
        return `${base} bottom-0 left-0 flex-col items-start`;
    }
  };

  const variantClass = (variant?: ToastVariant) => {
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
  };

  return (
    <div class={containerClass()}>
      <For each={stack()}>
        {(call) => (
          <div
            class={cn(
              'toast pointer-events-auto w-80 max-w-sm overflow-hidden rounded-md border shadow-lg',
              variantClass(call.payload.variant)
            )}
            data-state={call.pending ? 'open' : 'closed'}
            aria-live="polite"
            role="status"
          >
            <div class="flex items-start p-4">
              <div class="flex-1">
                <Show when={call.payload.title}>
                  <div class="text-sm font-semibold leading-none tracking-tight">
                    {call.payload.title}
                  </div>
                </Show>
                <Show when={call.payload.description}>
                  <div class="text-muted-foreground mt-1 text-sm">{call.payload.description}</div>
                </Show>
              </div>
              <Show when={call.payload.action}>
                <button
                  class="border-border hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring ring-offset-background ml-3 inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  onClick={() => {
                    call.payload.action?.onClick?.();
                    toastStore.resolve(call.promise);
                  }}
                >
                  {call.payload.action!.label}
                </button>
              </Show>
              <button
                class="focus-visible:ring-ring ring-offset-background ml-2 inline-flex h-8 shrink-0 items-center justify-center rounded-md px-2 text-sm opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Close"
                onClick={() => toastStore.resolve(call.promise)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </For>

      <style>
        {`
        .toast { will-change: opacity, transform; }
        [data-state='open'] { animation: toast-in 160ms ease-out; }
        [data-state='closed'] { animation: toast-out 160ms ease-in forwards; }
        @keyframes toast-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toast-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(6px); } }
        `}
      </style>
    </div>
  );
}
