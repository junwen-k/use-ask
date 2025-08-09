<script lang="ts" module>
  import { cn, type WithElementRef } from '$lib/utils.js';

  import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

  export type ToastCloseProps = WithElementRef<HTMLButtonAttributes> &
    WithElementRef<HTMLAnchorAttributes>;
</script>

<script lang="ts">
  let {
    ref = $bindable(null),
    'aria-label': ariaLabel = 'Close',
    onclick = () => {},
    class: className = '',
    ...restProps
  }: ToastCloseProps = $props();
</script>

<button
  bind:this={ref}
  class={cn(
    'ml-2 inline-flex h-8 shrink-0 items-center justify-center rounded-md px-2 text-sm opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
    className
  )}
  aria-label={ariaLabel}
  {onclick}
  {...restProps}
>
  ✕
  <span class="sr-only">{ariaLabel}</span>
</button>
