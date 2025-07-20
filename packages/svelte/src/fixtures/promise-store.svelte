<script lang="ts">
  import type { PromiseStore } from "../promise-store";

  interface Props {
    store: PromiseStore;
  }

  const { store }: Props = $props();
</script>

{#each store.entries as entry}
  <div data-testid="entry">
    <p data-testid="payload">{entry.payload}</p>
    <button data-testid="resolve" onclick={() => entry.resolve(true)}>
      OK
    </button>
    <button data-testid="reject" onclick={() => entry.reject()}>
      Cancel
    </button>
  </div>
{/each}
