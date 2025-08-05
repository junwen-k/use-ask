<script lang="ts">
  import type { SingletonCallStore } from '../call-store';

  interface Props {
    store: SingletonCallStore;
  }

  const { store }: Props = $props();
</script>

{#if store.current}
  <div data-testid="current">{store.current.payload}</div>
  <button data-testid="resolve" onclick={() => store.resolve(true)}>OK</button>
  <button data-testid="reject" onclick={() => store.reject('error')}>Cancel</button>
{:else}
  <div data-testid="current">null</div>
{/if}
