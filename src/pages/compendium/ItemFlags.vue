<script setup lang="ts">
import { QOptionGroup } from 'quasar'
import { computed, ref, watch } from 'vue'

const props = defineProps<{ flags: number }>()

const emit = defineEmits<{ (e: 'update:flags', value: number): void }>()

const FLAG_BITS: { bit: number; label: string }[] = [
  { bit: 7, label: 'breakable' },
  { bit: 6, label: 'cursed' },
  { bit: 5, label: 'consumable' },
  { bit: 4, label: 'unsellable' },
  { bit: 3, label: 'rare' },
  { bit: 2, label: 'ring' },
  { bit: 1, label: 'weapon' },
  { bit: 0, label: 'unused' },
]

const incoming = computed(() => props.flags)

const internal = ref(incoming.value)

watch(incoming, (value) => {
  internal.value = value
})

const options = computed(() => FLAG_BITS.map(({ bit, label }) => ({ label, value: 1 << bit })))

const selected = computed(() => {
  const result: number[] = []
  for (const { bit } of FLAG_BITS) {
    if ((internal.value >>> bit) & 1) result.push(1 << bit)
  }
  return result
})

function update(value: number[]): void {
  let flags = 0
  for (const bit of value) flags |= bit
  internal.value = flags
  emit('update:flags', flags)
}
</script>

<template>
  <QOptionGroup
    :model-value="selected"
    type="checkbox"
    :options="options"
    size="xs"
    dense
    @update:model-value="update"
  />
</template>

<style scoped></style>
