<script setup lang="ts">
import { QOptionGroup } from 'quasar'
import { computed, ref, watch } from 'vue'

import { type CompendiumNames } from '@/domain/Bank/Compendium'

const props = defineProps<{
  mask: number
  names: CompendiumNames
}>()

const emit = defineEmits<{ (e: 'update:mask', value: number): void }>()

const incomingMask = computed(() => props.mask)

const internalMask = ref(incomingMask.value)

watch(incomingMask, (value) => {
  internalMask.value = value
})

const options = computed(() =>
  props.names.classes.map((name, index) => ({ label: name, value: index })),
)

const selected = computed(() => {
  const result: number[] = []
  for (let bit = 0; bit < props.names.classes.length; bit++) {
    if ((internalMask.value >>> bit) & 1) result.push(bit)
  }
  return result
})

function update(value: number[]): void {
  let mask = 0
  for (const bit of value) mask |= 1 << bit
  internalMask.value = mask
  emit('update:mask', mask)
}
</script>

<template>
  <QOptionGroup
    :model-value="selected"
    type="checkbox"
    :options="options"
    dense
    size="xs"
    @update:model-value="update"
  />
</template>

<style scoped></style>
