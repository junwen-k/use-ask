<script lang="ts">
  import type { CallStore } from '../call-store';

  interface Props {
    store: CallStore;
  }

  const { store }: Props = $props();
</script>

{#each store.callStacks as callStack}
  <div data-testid="callStack">
    <p data-testid="payload">{callStack.payload}</p>
    <button data-testid="resolve" onclick={() => callStack.resolve(true)}>OK</button>
    <button data-testid="reject" onclick={() => callStack.reject()}>Cancel</button>
  </div>
{/each}
