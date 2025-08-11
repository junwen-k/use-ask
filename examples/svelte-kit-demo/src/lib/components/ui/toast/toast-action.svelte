<script lang="ts" module>
  import { cn, type WithElementRef } from '$lib/utils.js';

  import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

  export type ToastActionProps = WithElementRef<HTMLButtonAttributes> &
    WithElementRef<HTMLAnchorAttributes>;
</script>

<script lang="ts">
  let {
    ref = $bindable(null),
    onclick = () => {},
    class: className = '',
    children,
    ...restProps
  }: ToastActionProps = $props();
</script>

<button
  bind:this={ref}
  class={cn(
    'ml-3 inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
    className
  )}
  {onclick}
  {...restProps}
>
  {@render children?.()}
</button>
