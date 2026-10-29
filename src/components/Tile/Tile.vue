<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import type { Palette, Tile } from '@/domain/Bank/BattleSprites/graphics'

const props = defineProps<{
  tile: Tile
  palette: Palette
  scale?: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

const canvasStyle = computed(() => {
  const scale = props.scale ?? 4
  const size = 8 * scale
  return {
    width: `${size}px`,
    height: `${size}px`,
    imageRendering: 'pixelated' as const,
  }
})

function render(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = 8
  canvas.height = 8
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, 8, 8)
  for (let py = 0; py < 8; py++) {
    for (let px = 0; px < 8; px++) {
      const colorIndex = props.tile.pixels[px]?.[py] ?? 0
      if (colorIndex === 0) continue
      const color = props.palette?.[colorIndex] ?? [0, 0, 0]
      ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
      ctx.fillRect(px, py, 1, 1)
    }
  }
}

onMounted(render)
watch([() => props.tile, () => props.palette], render, { flush: 'post' })
</script>

<template>
  <canvas ref="canvasRef" :style="canvasStyle" />
</template>

<style scoped></style>
