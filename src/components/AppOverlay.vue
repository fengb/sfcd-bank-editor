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
  background: color-mix(in srgb, var(--p-surface-950) 82%, transparent);
  backdrop-filter: blur(2px);
  pointer-events: none;
}

.overlay__card {
  padding: 2rem 2.5rem;
  border: 2px dashed var(--p-primary-color);
  border-radius: var(--p-content-border-radius);
  background: var(--p-surface-900);
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
