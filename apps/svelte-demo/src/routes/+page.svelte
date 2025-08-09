<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Confirmer, confirm } from '$lib/components/ui/confirmer/index.js';

  import { Toast, toast } from '$lib/components/ui/toast/index.js';
</script>

<Toast />

<div class="mx-auto grid w-full max-w-4xl gap-8 p-6">
  <section class="space-y-3">
    <h1 class="text-2xl font-bold tracking-tight">CallStore Demo</h1>
    <p class="text-muted-foreground">Small examples showing how `CallStore` powers UI patterns.</p>
  </section>

  <section class="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
    <div class="flex items-center justify-between border-b p-4">
      <div>
        <h2 class="text-lg font-semibold">Confirmer</h2>
        <p class="text-sm text-muted-foreground">
          Imperative confirm dialog built with `SingletonCallStore`.
        </p>
      </div>
    </div>
    <div class="p-4">
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
    </div>
  </section>

  <section class="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
    <div class="flex items-center justify-between border-b p-4">
      <div>
        <h2 class="text-lg font-semibold">Toast</h2>
        <p class="text-sm text-muted-foreground">Sonner-like API implemented with `CallStore`.</p>
      </div>
    </div>
    <div class="p-4">
      <div class="flex flex-wrap gap-2">
        <Button
          onclick={() =>
            toast({ title: 'Default Toast', description: 'This is a default toast notification' })}
        >
          Default Toast
        </Button>

        <Button
          variant="secondary"
          onclick={() =>
            toast.success({
              title: 'Success!',
              description: 'Your action was completed successfully',
            })}
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
          onclick={() =>
            toast.info({ title: 'Info', description: 'Here is some useful information' })}
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
    </div>
  </section>
</div>
