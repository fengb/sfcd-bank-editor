<script setup lang="ts">
import { chunk } from 'es-toolkit'
import { QBtnToggle } from 'quasar'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import PaletteDisplay from '@/components/PaletteDisplay'
import TileBlock from '@/components/TileBlock'
import type { Palette, PixelGrid, Tile } from '@/domain/Bank/BattleSprites/graphics'
import type { DecodedTile } from '@/domain/Bank/MapData/decodeBlocks'
import { useBankFileStore } from '@/stores/bank'
import { paletteRgb } from '@/utils/color'

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
      pixels = pixels.toReversed() as PixelGrid
    }
    if (desc.hFlip) {
      pixels = pixels.map((row) => row.toReversed()) as PixelGrid
    }
    return { pixels }
  })
  return chunk(tiles, 9)
})

const layout = computed(() => mapData.value.layout ?? [])

const blockCount = computed(() => Math.floor(mapData.value.blocks.length / 9))

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

const layoutCanvas = ref<HTMLCanvasElement | null>(null)

function drawTile(
  ctx: CanvasRenderingContext2D,
  desc: DecodedTile,
  x0: number,
  y0: number,
  palette: Palette,
): void {
  const tile = tilesets.value[desc.tileId]
  if (!tile || !palette) return
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const srcX = desc.hFlip ? 7 - px : px
      const srcY = desc.vFlip ? 7 - py : py
      const idx = tile.pixels[srcX]?.[srcY] ?? 0
      if (idx === 0) continue
      ctx.fillStyle = paletteRgb(palette[idx])
      ctx.fillRect(x0 + px, y0 + py, 1, 1)
    }
  }
}

function renderLayout(): void {
  const canvas = layoutCanvas.value
  if (!canvas) return
  const palette = mapData.value.palette
  if (!layout.value.length || !blocks.value.length || !palette) return

  const tileSize = 8
  const blockTiles = 3
  const blockPx = tileSize * blockTiles
  const blocksPerRow = 64
  canvas.width = 64 * blockPx
  canvas.height = 32 * blockPx
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  layout.value.forEach((entry, bi) => {
    const bx = bi % blocksPerRow
    const by = Math.floor(bi / blocksPerRow)
    const slice = blocks.value.slice(entry.block * 9, entry.block * 9 + 9)
    if (slice.length < 9) return
    slice.forEach((tileDesc, t) => {
      const tx = t % blockTiles
      const ty = Math.floor(t / blockTiles)
      const x0 = (bx * blockTiles + tx) * tileSize
      const y0 = (by * blockTiles + ty) * tileSize
      drawTile(ctx, tileDesc, x0, y0, palette)
    })
  })
}

onMounted(() => {
  renderLayout()
})
watch([blocks, layout, () => mapData.value.palette, tilesets], () => renderLayout(), {
  flush: 'post',
})
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

  <h3>Blocks ({{ blockCount }})</h3>
  <div class="row q-gutter-xs">
    <TileBlock
      v-for="(tiles, i) in tileBlocks"
      :key="i"
      :tiles="tiles"
      :palette="mapData.palette"
      :scale="1"
      :width="3"
    />
  </div>

  <h3>Layout ({{ layout.length }} blocks)</h3>
  <canvas ref="layoutCanvas" style="image-rendering: pixelated; border: 1px solid #555" />

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
