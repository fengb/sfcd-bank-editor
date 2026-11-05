<script setup lang="ts">
import { chunk } from 'es-toolkit'
import { computed } from 'vue'

import Tile from '@/components/Tile'
import TileBlock from '@/components/TileBlock'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const icons = computed(() => store.bank!.toc.icons.region())

const menu = computed(() => icons.value.tiles.slice(1, 1 + 90))
const misc = computed(() => icons.value.tiles.slice(91, 276))
const items = computed(() => chunk(icons.value.tiles.slice(276), 6))
</script>

<template>
  <h2>Icon graphics</h2>
  <div v-if="icons.tiles[0]">
    <Tile :tile="icons.tiles[0]" :palette="icons.palette" :scale="3" />
    <TileBlock :tiles="menu" :palette="icons.palette" :scale="3" :width="3" />
    <TileBlock :tiles="misc" :palette="icons.palette" :scale="3" :width="16" />
    <div class="row">
      <div v-for="(group, i) in items" :key="i" class="grid grid-cols-2">
        <TileBlock :tiles="group" :palette="icons.palette" :scale="3" :width="2" />
      </div>
    </div>
  </div>
  <p v-else class="text-grey">No icon graphics in this bank.</p>
</template>

<style scoped></style>
