<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Confirmer, confirm } from '$lib/components/ui/confirmer/index.js';

  import Toast, { toast } from '$lib/components/ui/toast/toast.svelte';
</script>

<Confirmer />
<Button
  variant="destructive"
  onclick={() =>
    confirm({
      title: 'Are you absolutely sure?',
      message:
        'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
    }).then((result) => alert(`User ${result ? 'confirmed' : 'cancelled'} the action`))}
>
  Delete
</Button>

<Toast />
<div class="flex gap-2 flex-wrap">
  <Button
    onclick={() =>
      toast({ title: 'Default Toast', description: 'This is a default toast notification' })}
  >
    Default Toast
  </Button>

  <Button
    variant="secondary"
    onclick={() =>
      toast.success({ title: 'Success!', description: 'Your action was completed successfully' })}
  >
    Success Toast
  </Button>

  <Button
    variant="destructive"
    onclick={() =>
      toast.error({ title: 'Error!', description: 'Something went wrong with your request' })}
  >
    Error Toast
  </Button>

  <Button
    variant="outline"
    onclick={() => toast.info({ title: 'Info', description: 'Here is some useful information' })}
  >
    Info Toast
  </Button>

  <Button
    variant="ghost"
    onclick={() =>
      toast({
        title: 'With Action',
        description: 'This toast has an action button',
        action: {
          label: 'Undo',
          onClick: () => alert('Action clicked!'),
        },
      })}
  >
    Toast with Action
  </Button>
</div>
