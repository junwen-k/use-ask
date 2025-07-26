<script lang="ts">
  import type { CallStore } from "../call-store";

  interface Props {
    store: CallStore;
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
