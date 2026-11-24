<script setup lang="ts">
import { chunk } from 'es-toolkit'
import { computed } from 'vue'

import TileBlock from '@/components/TileBlock'
import { MAP_SPRITE_PALETTE } from '@/domain/Bank/MapSprites/decode'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const mapSprites = computed(() => store.bank!.regions.mapSprites)
</script>

<template>
  <h2>Map sprites</h2>
  <p class="text-grey">{{ mapSprites.sprites.length }} sprites</p>
  <div
    v-for="(group, i) in chunk(mapSprites.sprites, 3)"
    :key="i"
    class="row flex-wrap q-gutter-md"
  >
    <div v-for="(sprite, j) in group" :key="j">
      <TileBlock
        :tiles="sprite.frames[0]"
        :palette="MAP_SPRITE_PALETTE"
        :scale="2"
        layout="0 3 6,1 4 7,2 5 8"
      />
      <TileBlock
        :tiles="sprite.frames[1]"
        :palette="MAP_SPRITE_PALETTE"
        :scale="2"
        layout="0 3 6,1 4 7,2 5 8"
      />
    </div>
  </div>
</template>

<style scoped></style>
