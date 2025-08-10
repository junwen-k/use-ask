<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Confirmer, confirm } from '@/components/ui/confirmer';
</script>

<template>
  <Confirmer />
  <Button @click="confirm({ title: 'Delete', message: 'Are you sure you want to delete this?' })">Click me</Button>
</template>
