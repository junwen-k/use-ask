<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from '$lib/components/ui/card/index.js';
  import { Confirmer, confirm } from '$lib/components/ui/confirmer/index.js';
  import { ModeToggle } from '$lib/components/mode-toggle/index.js';
  import { Toast, toast } from '$lib/components/ui/toast/index.js';
</script>

<Toast />

<div class="mx-auto grid w-full max-w-4xl gap-8 p-6 min-h-screen">
  <section>
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold tracking-tight">@ui-call/svelte Demo</h1>
        <p class="text-muted-foreground">
          Small examples showing how <code>@ui-call/svelte</code> powers UI patterns.
        </p>
      </div>
      <ModeToggle />
    </div>
  </section>

  <div class="flex flex-col gap-8 flex-1">
    <Card>
      <CardHeader>
        <CardTitle>Confirmer</CardTitle>
        <CardDescription>
          Imperative confirm dialog built with <code>SingletonCallStore</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Toast</CardTitle>
        <CardDescription>Sonner-like API implemented with <code>CallStore</code>.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-wrap gap-2">
          <Button
            onclick={() =>
              toast({
                title: 'Default Toast',
                description: 'This is a default toast notification',
              })}
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
              toast.error({
                title: 'Error!',
                description: 'Something went wrong with your request',
              })}
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
      </CardContent>
    </Card>
  </div>
</div>
