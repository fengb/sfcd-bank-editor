<script setup lang="ts">
import { chunk } from 'es-toolkit'
import { QBtnToggle } from 'quasar'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import PaletteDisplay from '@/components/PaletteDisplay'
import TileBlock from '@/components/TileBlock'
import type { PixelGrid, Tile } from '@/domain/Bank/BattleSprites/graphics'
import type { DecodedTile } from '@/domain/Bank/MapData/decodeBlocks'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const route = useRoute()

const selected = ref(route.query.mapset === 'extra' ? 'extra' : 'base')

const mapData = computed(() =>
  selected.value === 'extra' ? store.bank!.regions.map2Data : store.bank!.regions.mapData,
)

const tilesets = computed(() =>
  selected.value === 'extra'
    ? store.bank!.regions.map2Tilesets.tiles
    : store.bank!.regions.mapTilesets.tiles,
)

const blocks = computed<DecodedTile[]>(() => mapData.value.blocks ?? [])

const tileBlocks = computed<Tile[][]>(() => {
  const tiles = blocks.value.map((desc) => {
    const tile = tilesets.value[desc.tileId]
    if (!tile) return { pixels: Array.from({ length: 8 }, () => Array(8).fill(0)) as PixelGrid }

    let { pixels } = tile
    if (desc.vFlip) {
      pixels = pixels.map((row) => row.toReversed()) as PixelGrid
    }
    if (desc.hFlip) {
      pixels = pixels.toReversed() as PixelGrid
    }
    return { pixels }
  })
  return chunk(tiles, 9)
})

const layoutBlocks = computed<Tile[][]>(() =>
  mapData.value.layout.map((entry) => tileBlocks.value[entry.block]!),
)

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
  <QBtnToggle
    v-model="selected"
    :options="[
      { label: 'Base', value: 'base' },
      { label: 'Extra', value: 'extra' },
    ]"
    toggle-color="primary"
    dense
  />

  <div v-if="mapData.palette">
    <h3>Palette</h3>
    <PaletteDisplay :palette="mapData.palette" />
  </div>

  <h3>Blocks ({{ tileBlocks.length }})</h3>
  <div class="row q-gutter-xs">
    <TileBlock
      v-for="(tiles, i) in tileBlocks"
      :key="i"
      :tiles="tiles"
      :palette="mapData.palette"
      :scale="1"
      layout="0 1 2,3 4 5,6 7 8"
    />
  </div>

  <h3>Layout ({{ layoutBlocks.length }} blocks)</h3>
  <div class="grid" style="grid-template-columns: repeat(64, 1fr); overflow: scroll">
    <TileBlock
      v-for="(tiles, i) in layoutBlocks"
      :key="i"
      :tiles="tiles"
      :palette="mapData.palette"
      :scale="1"
      layout="0 1 2,3 4 5,6 7 8"
    />
  </div>

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
