<script setup lang="ts">
interface Props {
  title: string;
  loading?: boolean;
  error?: Error | null;
  open?: boolean;
  closing?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const onConfirm = () => emit('confirm');
const onCancel = () => emit('cancel');
</script>

<template>
  <dialog v-bind="$attrs" :open="open" :class="{ closing }" @cancel="onCancel" @close="onCancel">
    <header class="dialog-header">
      <h2>{{ title }}</h2>
    </header>

    <div class="dialog-body">
      <slot />
      <p v-if="error" class="error" role="alert">{{ error.message }}</p>
    </div>

    <footer class="dialog-footer">
      <Button variant="secondary" @click="onCancel" :disabled="loading">
        Cancel
      </Button>
      <Button variant="primary" @click="onConfirm" :disabled="loading">
        {{ loading ? 'Loading...' : 'OK' }}
      </Button>
    </footer>
  </dialog>
</template>

<style scoped>
dialog {
  border: none;
  border-radius: 12px;
  padding: 0;
  max-width: 420px;
  width: 100%;
  background: #fff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  animation: fadeIn 200ms ease-out forwards;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

dialog.closing {
  animation: fadeOut 200ms ease-in forwards;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.dialog-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.dialog-body {
  padding: 1.25rem 1.5rem;
  font-size: 0.95rem;
  color: #374151;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Error text */
.error {
  margin-top: 0.75rem;
  color: #dc2626;
  font-size: 0.875rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(0.98);
  }
}
</style>
