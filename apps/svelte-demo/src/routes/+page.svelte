<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Confirmer, confirm } from '$lib/components/ui/confirmer/index.js';
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
