<script setup lang="ts">
import { confirm } from './components/confirmer.vue';
</script>

<template>
  <div>
    <Confirmer />
    <Button variant="danger"
      @click="confirm({ title: 'Delete', message: 'Are you sure you want to delete this?' })">Delete</Button>
  </div>
</template>
