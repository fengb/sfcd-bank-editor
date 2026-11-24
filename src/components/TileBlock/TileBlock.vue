<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Palette, Tile } from '@/domain/Bank/BattleSprites/graphics'

import { computeTileBlockLayout, renderTileBlockImage } from './renderTileBlock'

const props = defineProps<{
  tiles: Tile[]
  palette: Palette
  scale?: number
  layout: string
}>()

const scale = computed(() => props.scale ?? 4)

const tileLayout = computed(() => computeTileBlockLayout(props.layout))

const imgSrc = ref<string>('')

async function render(): Promise<void> {
  imgSrc.value = await renderTileBlockImage(props.tiles, props.palette, props.layout)
}

watch(() => props, render, { deep: true, flush: 'post', immediate: true })
</script>

<template>
  <img
    :src="imgSrc"
    :width="tileLayout.pixelWidth * scale"
    :height="tileLayout.pixelHeight * scale"
    style="image-rendering: pixelated"
  />
</template>

<style scoped></style>
