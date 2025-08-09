<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue';

interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  variant?: 'primary' | 'secondary' | 'danger';
}

const { variant = 'primary' } = defineProps<Props>();
</script>

<template>
  <button :class="[$attrs.class, 'btn', `btn-${variant}`]" v-bind="$attrs">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f3f4f6;
  color: #111827;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}
</style>
