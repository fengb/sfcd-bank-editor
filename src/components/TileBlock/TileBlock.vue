<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Palette, Tile } from '@/domain/Bank/BattleSprites/graphics'

import { computeTileBlockLayout, renderTileBlockImage } from './renderTileBlock'

const props = defineProps<{
  tiles: Tile[]
  palette: Palette
  scale?: number
  flow?: 'columns' | 'rows'
  width?: number
  height?: number
}>()

const scale = computed(() => props.scale ?? 4)

const layout = computed(() =>
  computeTileBlockLayout(props.tiles, props.flow ?? 'rows', props.width, props.height),
)

const imgSrc = ref<string>('')

async function render(): Promise<void> {
  imgSrc.value = await renderTileBlockImage(
    props.tiles,
    props.palette,
    props.flow ?? 'rows',
    props.width,
    props.height,
  )
}

watch(() => props, render, { deep: true, flush: 'post', immediate: true })
</script>

<template>
  <img
    :src="imgSrc"
    :width="layout.pixelWidth * scale"
    :height="layout.pixelHeight * scale"
    style="image-rendering: pixelated"
  />
</template>

<style scoped></style>
