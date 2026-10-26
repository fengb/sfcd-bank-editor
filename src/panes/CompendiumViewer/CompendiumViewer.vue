<script setup lang="ts">
import { mapValues } from 'es-toolkit'

import BytesViewer from '@/components/BytesViewer'
import { readU32be } from '@/domain/Bank/util'

import ItemTable from './ItemTable.vue'
import MonsterStats from './MonsterStats.vue'
import NamesTable from './NamesTable.vue'

/** RAM base used by the pointer header; subtracting it yields file offsets. */
const RAM_BASE = 0x233200

const props = defineProps<{ region: Uint8Array }>()

function parseHeader(bytes: Uint8Array, headerNumber: number) {
  const pointer = readU32be(bytes, headerNumber * 4) ?? 0
  return { headerNumber, offset: pointer - RAM_BASE }
}

const names = {
  items: parseHeader(props.region, 0),
  classes: parseHeader(props.region, 1),
  spells: parseHeader(props.region, 2),
  characters: parseHeader(props.region, 3),
  monsters: parseHeader(props.region, 4),
}

const stats = {
  items: parseHeader(props.region, 5),
  spells: parseHeader(props.region, 6),
  monsters: parseHeader(props.region, 7),
}
</script>

<template>
  <h2>Compendium</h2>
  <MonsterStats :region="region" :offset="stats.monsters.offset" />
  <ItemTable :region="region" :offset="stats.items.offset" />
  <BytesViewer :bytes="region.subarray(stats.spells.offset, stats.spells.offset + 576)" />
  <NamesTable :region="region" :offsets="mapValues(names, (h) => h.offset)" />
</template>

<style scoped></style>
