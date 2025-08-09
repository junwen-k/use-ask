<script lang="ts" module>
  import { cn, type WithElementRef } from '$lib/utils.js';
  import type { HTMLAttributes } from 'svelte/elements';

  export type ToastTitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>>;
</script>

<script lang="ts">
  let {
    ref = $bindable(null),
    class: className = '',
    children,
    ...restProps
  }: ToastTitleProps = $props();
</script>

<div
  bind:this={ref}
  class={cn('text-sm font-semibold leading-none tracking-tight', className)}
  {...restProps}
>
  {@render children?.()}
</div>
