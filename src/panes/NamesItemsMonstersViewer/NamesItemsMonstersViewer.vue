<script setup lang="ts">
import { readU32be } from '@/domain/bank.ts'
import MonsterStats from './MonsterStats.vue'
import ItemTable from './ItemTable.vue'
import SpellData from './SpellData.vue'
import NamesTable from './NamesTable.vue'
import { mapValues } from 'es-toolkit'

/** RAM base used by the pointer header; subtracting it yields file offsets. */
const RAM_BASE = 0x233200

const props = defineProps<{ bytes: Uint8Array }>()

function parseHeader(bytes: Uint8Array, headerNumber: number) {
  const pointer = readU32be(bytes, headerNumber * 4) ?? 0
  return { headerNumber, offset: pointer - RAM_BASE }
}

const names = {
  items: parseHeader(props.bytes, 0),
  classes: parseHeader(props.bytes, 1),
  spells: parseHeader(props.bytes, 2),
  characters: parseHeader(props.bytes, 3),
  monsters: parseHeader(props.bytes, 4),
}

const stats = {
  items: parseHeader(props.bytes, 5),
  spells: parseHeader(props.bytes, 6),
  monsters: parseHeader(props.bytes, 7),
}
</script>

<template>
  <h2>Monster/Item/String</h2>
  <MonsterStats :bytes="props.bytes" :offset="stats.monsters.offset" />
  <ItemTable :bytes="props.bytes" :offset="stats.items.offset" />
  <SpellData :bytes="props.bytes" :offset="stats.spells.offset" />
  <NamesTable :bytes="props.bytes" :offsets="mapValues(names, h => h.offset)" />
</template>

<style scoped></style>
