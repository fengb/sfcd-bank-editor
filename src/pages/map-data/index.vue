<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import BytesViewer from '@/components/BytesViewer'
import type { DecodedTile } from '@/domain/Bank/MapData/decodeBlocks'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const mapData = computed(() => store.bank!.toc.mapData.region())

const tilesets = computed(() => store.bank!.toc.mapTilesets.region().tiles ?? [])

const decodedBlocks = computed<DecodedTile[]>(() => mapData.value.decodedBlocks ?? [])

const decodedLayout = computed<number[]>(() => mapData.value.decodedLayout ?? [])

const blockCount = computed(() => Math.floor(mapData.value.decodedBlocks.length / 9))

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
const blocksCanvas = ref<HTMLCanvasElement | null>(null)

function tileAt(desc: DecodedTile): { pixels: number[][] } | null {
  const base = tilesets.value[desc.tileId]
  if (!base) return null
  return base
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  desc: DecodedTile,
  x0: number,
  y0: number,
  palette: (readonly [number, number, number])[] | null,
): void {
  const base = tileAt(desc)
  if (!base || !palette) return
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const srcX = desc.hFlip ? 7 - px : px
      const srcY = desc.vFlip ? 7 - py : py
      const idx = base.pixels[srcX]?.[srcY] ?? 0
      if (idx === 0) continue
      const color = palette[idx] ?? [0, 0, 0]
      ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
      ctx.fillRect(x0 + px, y0 + py, 1, 1)
    }
  }
}

function renderBlocks(): void {
  const canvas = blocksCanvas.value
  if (!canvas) return
  const blocks = decodedBlocks.value
  const palette = mapData.value.palette
  if (!blocks.length || !palette) return

  const tileSize = 8
  const blockTiles = 3
  const blockPx = tileSize * blockTiles
  const columns = 8
  const rows = Math.ceil(blockCount.value / columns)
  const gap = 4
  canvas.width = columns * (blockPx + gap) - gap
  canvas.height = Math.max(1, rows) * (blockPx + gap) - gap
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < blockCount.value; i++) {
    const col = i % columns
    const row = Math.floor(i / columns)
    const ox = col * (blockPx + gap)
    const oy = row * (blockPx + gap)
    const slice = blocks.slice(i * 9, i * 9 + 9)
    slice.forEach((tileDesc, t) => {
      const tx = t % blockTiles
      const ty = Math.floor(t / blockTiles)
      const x0 = ox + tx * tileSize
      const y0 = oy + ty * tileSize
      drawTile(ctx, tileDesc, x0, y0, palette)
    })
  }
}

function renderLayout(): void {
  const canvas = layoutCanvas.value
  if (!canvas) return
  const layout = decodedLayout.value
  const blocks = decodedBlocks.value
  const palette = mapData.value.palette
  if (!layout.length || !blocks.length || !palette) return

  const tileSize = 8
  const blockTiles = 3
  const blockPx = tileSize * blockTiles
  const blocksPerRow = 64
  const size = blocksPerRow * blockPx
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#111'
  ctx.fillRect(0, 0, size, size)

  layout.forEach((blockNumber, bi) => {
    const bx = bi % blocksPerRow
    const by = Math.floor(bi / blocksPerRow)
    const slice = blocks.slice(blockNumber * 9, blockNumber * 9 + 9)
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
  renderBlocks()
  renderLayout()
})
watch(
  [decodedBlocks, decodedLayout, () => mapData.value.palette, tilesets],
  () => {
    renderBlocks()
    renderLayout()
  },
  { flush: 'post' },
)
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

  <h3>Decoded blocks ({{ blockCount }})</h3>
  <canvas ref="blocksCanvas" style="image-rendering: pixelated; border: 1px solid #555" />

  <h3>Decoded layout ({{ decodedLayout.length }} blocks)</h3>
  <div style="overflow: auto; max-height: 70vh">
    <canvas ref="layoutCanvas" style="image-rendering: pixelated; border: 1px solid #555" />
  </div>

  <BytesViewer :bytes="mapData.blocks" title="Blocks (raw)" />
  <BytesViewer :bytes="mapData.layout" title="Layout (raw)" />

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
