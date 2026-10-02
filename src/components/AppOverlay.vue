<script setup lang="ts">
/** Full-window overlay. Everything inside the card comes from the slot. */
defineProps<{ visible: boolean }>()
</script>

<template>
  <Transition name="overlay-fade">
    <div v-if="visible" class="overlay">
      <div class="overlay__card">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: color-mix(in srgb, var(--app-surface-deep) 82%, transparent);
  backdrop-filter: blur(2px);
  pointer-events: none;
}

.overlay__card {
  padding: 2rem 2.5rem;
  border: 2px dashed var(--q-primary);
  border-radius: var(--app-border-radius);
  background: var(--app-surface-raised);
  text-align: center;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 120ms ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>
