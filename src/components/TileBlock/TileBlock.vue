<script setup lang="ts">
import Tile from '@/components/Tile'
import type { Palette, Tile as TileModel } from '@/domain/Bank/BattleSprites/graphics'

const props = defineProps<{
  tiles: TileModel[]
  palette: Palette
  scale?: number
  flow?: 'columns' | 'rows'
  width?: number
  height?: number
}>()

const containerClass = () => {
  if (props.flow === 'columns') {
    return `grid grid-flow-col grid-rows-${props.height}`
  }
  return `grid grid-flow-row grid-cols-${props.width}`
}
</script>

<template>
  <div :class="containerClass()" style="width: max-content">
    <Tile v-for="(tile, j) in tiles" :key="j" :tile="tile" :palette="palette" :scale="scale" />
  </div>
</template>

<style scoped></style>
