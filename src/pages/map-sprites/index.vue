<script setup lang="ts">
import { computed } from 'vue'

import TileBlock from '@/components/TileBlock'
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
      <TileBlock
        :tiles="sprite.frames[0]"
        :palette="mapSprites.palette"
        :scale="2"
        flow="columns"
        :height="3"
      />
      <TileBlock
        :tiles="sprite.frames[1]"
        :palette="mapSprites.palette"
        :scale="2"
        flow="columns"
        :height="3"
      />
    </div>
  </div>
</template>

<style scoped></style>
