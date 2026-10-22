<script setup lang="ts">
import { readU32be } from '@/domain/bank.ts'
import MonsterStats from './MonsterStats.vue'
import ItemTable from './ItemTable.vue'
import SpellData from './SpellData.vue'
import StringTable from './StringTable.vue'

/** RAM base used by the pointer header; subtracting it yields file offsets. */
const RAM_BASE = 0x233200

const props = defineProps<{ bytes: Uint8Array }>()

function parseHeader(bytes: Uint8Array, headerNumber: number) {
  const headerOffset = headerNumber * 4
  const pointer = readU32be(bytes, headerOffset) ?? 0
  return { headerNumber, headerOffset, fileOffset: pointer - RAM_BASE }
}

const sections = {
  itemNames: parseHeader(props.bytes, 0),
  classNames: parseHeader(props.bytes, 1),
  spellNames: parseHeader(props.bytes, 2),
  characterNames: parseHeader(props.bytes, 3),
  monsterNames: parseHeader(props.bytes, 4),

  itemStats: parseHeader(props.bytes, 5),
  spells: parseHeader(props.bytes, 6),
  monsterStats: parseHeader(props.bytes, 7),
}
</script>

<template>
  <h2>Monster/Item/String</h2>
  <MonsterStats :bytes="props.bytes" :offset="sections.monsterStats.fileOffset" />
  <ItemTable :bytes="props.bytes" :offset="sections.itemStats.fileOffset" />
  <SpellData :bytes="props.bytes" :offset="sections.spells.fileOffset" />
  <div class="row no-wrap">
    <StringTable :bytes="props.bytes" :offset="sections.itemNames.fileOffset" :count="64" />
    <StringTable :bytes="props.bytes" :offset="sections.classNames.fileOffset" :count="28" />
    <StringTable :bytes="props.bytes" :offset="sections.spellNames.fileOffset" :count="34" />
    <StringTable :bytes="props.bytes" :offset="sections.characterNames.fileOffset" :count="19" />
    <StringTable :bytes="props.bytes" :offset="sections.monsterNames.fileOffset" :count="71" />
  </div>
</template>

<style scoped></style>
