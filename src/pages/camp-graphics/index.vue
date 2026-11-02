<script setup lang="ts">
import { computed } from 'vue'

import Tile from '@/components/Tile'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const camp = computed(() => store.bank!.toc.campGraphics.region())
const graphic = computed(() => camp.value.graphic)
const palette = computed(() => camp.value.palette)
const tiles = computed(() => camp.value.tiles)
</script>

<template>
  <h2>Camp graphics</h2>
  <div v-if="graphic && palette">
    <div class="grid grid-cols-16" style="width: max-content">
      <Tile v-for="(tile, i) in tiles" :key="i" :tile="tile" :palette="palette" :scale="3" />
    </div>
  </div>
  <p v-else class="text-grey">No camp graphics in this bank.</p>
</template>

<style scoped></style>
