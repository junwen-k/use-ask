<script setup lang="ts">
import { useCallStore } from "../use-call-store";

const store = useCallStore();
</script>

<template>
  <button data-testid="call" @click="store.call('test')">Call</button>
  <button data-testid="callSafe" @click="store.callSafe('test')">Call Safe</button>
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
