<script setup lang="ts">
import type { Palette } from '@/domain/Bank/BattleSprites/graphics'
import { paletteRgb } from '@/utils/color'

const props = defineProps<{
  palette: Palette
}>()
</script>

<template>
  <div class="row q-gutter-xs">
    <div
      v-for="(color, i) in props.palette"
      :key="i"
      :style="{
        background: paletteRgb(color),
      }"
      style="width: 24px; height: 24px; border: 1px solid #555"
      :title="`#${i}`"
    />
  </div>
</template>

<style scoped></style>
