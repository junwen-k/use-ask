<script lang="ts" module>
  import { cn, type WithElementRef } from '$lib/utils.js';

  import type { HTMLAttributes } from 'svelte/elements';

  export type ToastDescriptionProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
  let {
    ref = $bindable(null),
    class: className = '',
    children,
    ...restProps
  }: ToastDescriptionProps = $props();
</script>

<div bind:this={ref} class={cn('mt-1 text-sm text-muted-foreground', className)} {...restProps}>
  {@render children?.()}
</div>
