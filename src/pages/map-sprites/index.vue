<script setup lang="ts">
import { computed } from 'vue'

import Tile from '@/components/Tile'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const mapSprites = computed(() => store.bank!.toc.mapSprites.region())
</script>

<template>
  <h2>Map sprites</h2>
  <p class="text-grey">{{ mapSprites.count }} sprites</p>
  <div class="row flex-wrap">
    <div
      v-for="(sprite, i) in mapSprites.sprites"
      :key="i"
      style="border: 1px solid #444; padding: 2px"
    >
      <div class="grid grid-flow-col grid-rows-3" style="width: max-content">
        <Tile
          v-for="(tile, j) in sprite.frames[0]"
          :key="j"
          :tile="tile"
          :palette="mapSprites.palette"
          :scale="2"
        />
      </div>
      <div class="grid grid-flow-col grid-rows-3" style="width: max-content">
        <Tile
          v-for="(tile, j) in sprite.frames[1]"
          :key="j"
          :tile="tile"
          :palette="mapSprites.palette"
          :scale="2"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
