<script setup lang="ts">
import { computed } from 'vue'

import BytesViewer from '@/components/BytesViewer'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const mapData = computed(() => store.bank!.toc.mapData.region())

const sections = computed(() => [
  { name: 'Areas', count: mapData.value.areas.length, data: mapData.value.areas },
  { name: 'Flag copies', count: mapData.value.flagCopies.length, data: mapData.value.flagCopies },
  { name: 'Step copies', count: mapData.value.stepCopies.length, data: mapData.value.stepCopies },
  {
    name: 'Layer 2 copies',
    count: mapData.value.layer2Copies.length,
    data: mapData.value.layer2Copies,
  },
  { name: 'Warps', count: mapData.value.warps.length, data: mapData.value.warps },
  { name: 'Chest items', count: mapData.value.chestItems.length, data: mapData.value.chestItems },
  { name: 'Other items', count: mapData.value.otherItems.length, data: mapData.value.otherItems },
])
</script>

<template>
  <h2>Per-map data</h2>

  <div v-if="mapData.palette">
    <h3>Palette</h3>
    <div class="row q-gutter-xs">
      <div
        v-for="(color, i) in mapData.palette"
        :key="i"
        :style="{ background: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }"
        style="width: 24px; height: 24px; border: 1px solid #555"
        :title="`#${i}`"
      />
    </div>
  </div>

  <BytesViewer :bytes="mapData.blocks" title="Blocks" />
  <BytesViewer :bytes="mapData.layout" title="Layout" />

  <div v-for="section in sections" :key="section.name">
    <h3>{{ section.name }} ({{ section.count }})</h3>
    <pre>{{ JSON.stringify(section.data, null, 2) }}</pre>
  </div>

  <div v-if="mapData.animation">
    <h3>Animation</h3>
    <pre>{{ JSON.stringify(mapData.animation, null, 2) }}</pre>
  </div>
</template>

<style scoped></style>
