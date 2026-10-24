<script setup lang="ts">
import { mapValues } from 'es-toolkit'

import type { BankRegion } from '@/domain/bank'
import { readU32be } from '@/domain/bank.ts'

import ItemTable from './ItemTable.vue'
import MonsterStats from './MonsterStats.vue'
import NamesTable from './NamesTable.vue'
import SpellData from './SpellData.vue'

/** RAM base used by the pointer header; subtracting it yields file offsets. */
const RAM_BASE = 0x233200

const props = defineProps<{ region: BankRegion }>()

function parseHeader(bytes: BankRegion, headerNumber: number) {
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
  <h2>Monster/Item/String</h2>
  <MonsterStats :region="region" :offset="stats.monsters.offset" />
  <ItemTable :region="region" :offset="stats.items.offset" />
  <SpellData :bytes="region" :offset="stats.spells.offset" />
  <NamesTable :region="region" :offsets="mapValues(names, (h) => h.offset)" />
</template>

<style scoped></style>
