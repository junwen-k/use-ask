<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Confirmer, confirm } from '@/components/ui/confirmer';
import { Toast, toast } from '@/components/ui/toast';
import { ModeToggle } from '@/components/mode-toggle';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

function onUndo() {
  alert('Action clicked!');
}

function onDelete() {
  confirm({
    title: 'Are you absolutely sure?',
    message:
      'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
  }).then((result) => alert(`User ${result ? 'confirmed' : 'cancelled'} the action`));
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-4xl gap-8 p-6 min-h-screen">
    <Toast />

    <section>
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-2">
          <h1 class="text-2xl font-bold tracking-tight">@ui-call/vue Demo</h1>
          <p class="text-muted-foreground">Small examples showing how <code>@ui-call/vue</code> powers UI patterns.</p>
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
          <Button variant="destructive" @click="onDelete">Delete</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toast</CardTitle>
          <CardDescription>
            Sonner-like API implemented with <code>CallStore</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-2">
            <Button
              @click="toast({ title: 'Default Toast', description: 'This is a default toast notification' })">Default
              Toast</Button>

            <Button variant="secondary"
              @click="toast.success({ title: 'Success!', description: 'Your action was completed successfully' })">Success
              Toast</Button>

            <Button variant="destructive"
              @click="toast.error({ title: 'Error!', description: 'Something went wrong with your request' })">Error
              Toast</Button>

            <Button variant="outline"
              @click="toast.info({ title: 'Info', description: 'Here is some useful information' })">Info Toast</Button>

            <Button variant="ghost"
              @click="toast({ title: 'With Action', description: 'This toast has an action button', action: { label: 'Undo', onClick: onUndo } })">Toast
              with Action</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
