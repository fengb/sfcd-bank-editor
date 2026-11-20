<script setup lang="ts">
import { computed } from 'vue'

import PaletteDisplay from '@/components/PaletteDisplay'
import TileBlock from '@/components/TileBlock'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const chapter = computed(() => store.bank!.regions.chapterGraphics)
const graphic = computed(() => chapter.value)
const palette = computed(() => chapter.value?.palette ?? null)
const tiles = computed(() => chapter.value?.tiles ?? [])
</script>

<template>
  <h2>Chapter screen graphics</h2>
  <div v-if="graphic && palette">
    <div class="row">
      <TileBlock :tiles="tiles.slice(0, 128)" :width="16" :palette="palette" :scale="3" />
      <TileBlock :tiles="tiles.slice(128)" :width="16" :palette="palette" :scale="3" />
    </div>
    <div>
      <h3>Palette</h3>
      <PaletteDisplay :palette="palette" />
    </div>
  </div>
  <p v-else class="text-grey">No chapter screen graphics in this bank.</p>
</template>

<style scoped></style>
