<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Confirmer, confirm } from '@/components/ui/confirmer';
import { Toast, toast } from '@/components/ui/toast';
import { ModeToggle } from '@/components/mode-toggle';

function onUndo() {
  alert('Action clicked!');
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-4xl gap-8 p-6">
    <section class="space-y-3">
      <h1 class="text-2xl font-bold tracking-tight">@ui-call/vue Demo</h1>
      <p class="text-muted-foreground">Small examples showing how @ui-call/vue powers UI patterns.</p>
      <ModeToggle />
    </section>

    <Confirmer />
    <section class="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-4 space-y-3">
      <h2 class="text-lg font-semibold">Confirmer</h2>
      <p class="text-sm text-muted-foreground">Imperative confirm dialog built with SingletonCallStore.</p>
      <Button @click="confirm({ title: 'Delete', message: 'Are you sure you want to delete this?' })">Delete</Button>
    </section>

    <Toast />
    <section class="rounded-lg border border-border bg-card text-card-foreground shadow-sm p-4 space-y-3">
      <h2 class="text-lg font-semibold">Toast</h2>
      <p class="text-sm text-muted-foreground">Sonner-like API implemented with CallStore.</p>
      <div class="flex flex-wrap gap-2">
        <Button @click="toast({ title: 'Default Toast', description: 'This is a default toast notification' })">Default
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
    </section>
  </div>
</template>
