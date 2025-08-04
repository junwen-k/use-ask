<script lang="ts">
  import type { SingletonCallStore } from '../singleton-call-store';

  interface Props {
    store: SingletonCallStore;
  }

  const { store }: Props = $props();
</script>

{#if store.current}
  <div data-testid="call">
    <p data-testid="payload">{store.current.payload}</p>
    <p data-testid="pending">{store.current.pending}</p>
    <button data-testid="resolve" onclick={() => store.current?.resolve(true)}>OK</button>
    <button data-testid="reject" onclick={() => store.current?.reject()}>Cancel</button>
  </div>
{:else}
  <div data-testid="no-call">No current call</div>
{/if}
