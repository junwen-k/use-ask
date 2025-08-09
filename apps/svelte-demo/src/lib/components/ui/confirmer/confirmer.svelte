<script lang="ts" module>
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

  import { SingletonCallStore } from '@ui-call/svelte';

  const confirmStore = new SingletonCallStore<{
    title: string;
    message: string;
  }>({
    unmountingDelay: 150,
  });

  export const confirm = confirmStore.call.bind(confirmStore);
</script>

{#if confirmStore.current}
  <AlertDialog.Root open={confirmStore.current.pending}>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>{confirmStore.current.payload.title}</AlertDialog.Title>
        <AlertDialog.Description>
          {confirmStore.current.payload.message}
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel onclick={() => confirmStore.resolve(false)}>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action onclick={() => confirmStore.resolve(true)}>Continue</AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}
