<script setup lang="ts">
import { chunk } from 'es-toolkit'
import { computed } from 'vue'

import TileBlock from '@/components/TileBlock'
import { useBankFileStore } from '@/stores/bank'

const store = useBankFileStore()
const icons = computed(() => store.bank!.regions.icons)
Object.assign(window, { icons: icons.value })
</script>

<template>
  <h2>Icon graphics</h2>
  <div class="row">
    <div v-for="(group, i) in chunk(icons.actionMenu, 9)" :key="i">
      <TileBlock :tiles="group" :palette="icons.palette" :scale="3" :width="3" />
    </div>
  </div>
  <div class="row">
    <div v-for="(group, i) in chunk(icons.itemMenu, 9)" :key="i">
      <TileBlock :tiles="group" :palette="icons.palette" :scale="3" :width="3" />
    </div>
  </div>
  <div class="row">
    <div v-for="(group, i) in chunk(icons.battleMenu, 9)" :key="i">
      <TileBlock :tiles="group" :palette="icons.palette" :scale="3" :width="3" />
    </div>
  </div>
  <div class="row">
    <div v-for="(group, i) in chunk(icons.shopMenu, 9)" :key="i">
      <TileBlock :tiles="group" :palette="icons.palette" :scale="3" :width="3" />
    </div>
  </div>
  <div class="row">
    <div v-for="(group, i) in chunk(icons.hqMenu, 9)" :key="i">
      <TileBlock :tiles="group" :palette="icons.palette" :scale="3" :width="3" />
    </div>
  </div>
  <div class="row">
    <div v-for="(group, i) in chunk(icons.memberMenu, 9)" :key="i">
      <TileBlock :tiles="group" :palette="icons.palette" :scale="3" :width="3" />
    </div>
  </div>
  <div class="row">
    <div v-for="(group, i) in chunk(icons.items, 6)" :key="i">
      <TileBlock :tiles="group" :palette="icons.palette" :scale="3" :width="2" />
    </div>
  </div>
</template>

<style scoped></style>
