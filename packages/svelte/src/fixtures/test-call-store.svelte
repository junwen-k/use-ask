<script lang="ts">
  import type { CallStore } from '../call-store';

  interface Props {
    store: CallStore;
  }

  const { store }: Props = $props();
</script>

{#each store.stack as call}
  <div data-testid="call">
    <p data-testid="payload">{call.payload}</p>
    <button data-testid="resolve" onclick={() => call.resolve(true)}>OK</button>
    <button data-testid="reject" onclick={() => call.reject('error')}>Cancel</button>
  </div>
{/each}
