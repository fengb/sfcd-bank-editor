<script setup lang="ts">
import { computed } from 'vue'

import TileBlock from '@/components/TileBlock'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const chapter = computed(() => store.bank!.toc.chapterGraphics.region())
const graphic = computed(() => chapter.value.graphic)
const palette = computed(() => chapter.value.palette)
const tiles = computed(() => chapter.value.tiles)
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
      <div class="row q-gutter-xs">
        <div
          v-for="(color, i) in palette"
          :key="i"
          :style="{ background: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }"
          style="width: 24px; height: 24px; border: 1px solid #555"
          :title="`#${i}`"
        />
      </div>
    </div>
  </div>
  <p v-else class="text-grey">No chapter screen graphics in this bank.</p>
</template>

<style scoped></style>
