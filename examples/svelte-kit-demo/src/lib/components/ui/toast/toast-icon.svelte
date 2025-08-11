<script lang="ts" module>
  import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
  import XCircle from '@lucide/svelte/icons/x-circle';
  import Info from '@lucide/svelte/icons/info';
  import Bell from '@lucide/svelte/icons/bell';
  import { cn } from '$lib/utils.js';
  import { tv } from 'tailwind-variants';

  export type ToastIconProps = {
    variant?: 'default' | 'success' | 'destructive' | 'info';
    class?: string;
  };

  const iconVariants = tv({
    base: 'h-5 w-5',
    variants: {
      variant: {
        default: 'text-foreground/80',
        success: 'text-green-600 dark:text-green-400',
        destructive: 'text-red-600 dark:text-red-400',
        info: 'text-blue-600 dark:text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  });
</script>

<script lang="ts">
  let { variant = 'default', class: className = '', ...restProps }: ToastIconProps = $props();
</script>

{#if variant === 'success'}
  <CheckCircle2Icon
    class={cn(iconVariants({ variant }), className)}
    aria-hidden="true"
    {...restProps}
  />
{:else if variant === 'destructive'}
  <XCircle class={cn(iconVariants({ variant }), className)} aria-hidden="true" {...restProps} />
{:else if variant === 'info'}
  <Info class={cn(iconVariants({ variant }), className)} aria-hidden="true" {...restProps} />
{:else}
  <Bell class={cn(iconVariants({ variant }), className)} aria-hidden="true" {...restProps} />
{/if}
