<script setup lang="ts">
import { usePromiseStore } from "../use-promise-store";

const store = usePromiseStore();
</script>

<template>
  <button data-testid="add" @click="store.add('test')">Add</button>
  <button data-testid="addSafe" @click="store.addSafe('test')">Add Safe</button>
  <button data-testid="clear" @click="store.clear()">Clear</button>
  <div v-for="entry in store.entries" :key="entry.id" data-testid="entry">
    <p data-testid="payload">{{ entry.payload }}</p>
    <button data-testid="resolve" @click="() => entry.resolve(true)">
      OK
    </button>
    <button data-testid="reject" @click="() => entry.reject()">
      Cancel
    </button>
  </div>
</template>
