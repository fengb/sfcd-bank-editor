<script setup lang="ts">
import { mapValues } from 'es-toolkit'
import { computed } from 'vue'

import BytesViewer from '@/components/BytesViewer'
import { readU32be } from '@/domain/Bank/util'
import { useBankFileStore } from '@/stores/bank'

import ItemTable from './ItemTable.vue'
import MonsterStats from './MonsterStats.vue'
import NamesTable from './NamesTable.vue'

/** RAM base used by the pointer header; subtracting it yields file offsets. */
const RAM_BASE = 0x233200

const store = useBankFileStore()
const region = computed(() => store.bank!.toc.compendium.region())

function parseHeader(bytes: Uint8Array, headerNumber: number) {
  const pointer = readU32be(bytes, headerNumber * 4) ?? 0
  return { headerNumber, offset: pointer - RAM_BASE }
}

const names = computed(() => ({
  items: parseHeader(region.value, 0),
  classes: parseHeader(region.value, 1),
  spells: parseHeader(region.value, 2),
  characters: parseHeader(region.value, 3),
  monsters: parseHeader(region.value, 4),
}))

const stats = computed(() => ({
  items: parseHeader(region.value, 5),
  spells: parseHeader(region.value, 6),
  monsters: parseHeader(region.value, 7),
}))
</script>

<template>
  <h2>Compendium</h2>
  <MonsterStats :region="region" :offset="stats.monsters.offset" />
  <ItemTable :region="region" :offset="stats.items.offset" />
  <BytesViewer :bytes="region.subarray(stats.spells.offset, stats.spells.offset + 576)" />
  <NamesTable :region="region" :offsets="mapValues(names, (h) => h.offset)" />
</template>

<style scoped></style>
