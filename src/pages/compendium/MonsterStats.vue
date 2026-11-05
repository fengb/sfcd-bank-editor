<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import { decodeSpell } from '@/domain/Bank'
import { type CompendiumMonster } from '@/domain/Bank/Compendium'

const props = defineProps<{ monsters: CompendiumMonster[] }>()

function decodeInventory(value: number): string {
  if (value === 0x007f) return ' --'
  const equipped = (value & 0x80) !== 0
  const idx = value & 0x7f
  return `${formatHex(idx, 2)}${equipped ? '+' : ' '}`
}

const rows = computed(() => {
  return props.monsters.map((rec, i) => ({
    '#': i,
    index: rec.index,
    level: rec.level,
    hp: rec.hp,
    field0e: rec.field0e,
    mp: rec.mp,
    atk: rec.atk,
    def: rec.def,
    agi: rec.agi,
    mov: rec.mov,
    inventory: rec.inventory,
    spells: rec.spells,
    field1a: rec.field1a,
    field1e: rec.field1e,
    field2c: rec.field2c,
    field2e: rec.field2e,
    aiClass: rec.aiClass,
    field34: rec.field34,
  }))
})

const columns: QTableProps['columns'] = [
  { name: 'num', label: '#', field: '#' },
  { name: 'index', label: 'Idx', field: 'index' },
  { name: 'level', label: 'Lvl', field: 'level' },
  { name: 'hp', label: 'HP', field: 'hp' },
  { name: 'mp', label: 'MP', field: 'mp' },
  { name: 'atk', label: 'ATK', field: 'atk' },
  { name: 'def', label: 'DEF', field: 'def' },
  { name: 'agi', label: 'AGI', field: 'agi' },
  { name: 'mov', label: 'MOV', field: 'mov' },
  {
    name: 'inventory',
    label: 'Inventory',
    field: 'inventory',
    format: (inv) => inv.map(decodeInventory).join(''),
  },
  {
    name: 'spells',
    label: 'Spells',
    field: 'spells',
    format: (spells) => spells.map(decodeSpell).join(''),
  },
  { name: 'field1a', label: '+0x1A', field: 'field1a', format: (v: number) => formatHex(v, 4) },
  { name: 'field1e', label: '+0x1E', field: 'field1e', format: (v: number) => formatHex(v, 4) },
  { name: 'field0e', label: '+0x0E', field: 'field0e' },
  { name: 'field2c', label: '+0x2C', field: 'field2c', format: (v: number) => formatHex(v, 4) },
  { name: 'field2e', label: '+0x2E', field: 'field2e', format: (v: number) => formatHex(v, 4) },
  { name: 'aiClass', label: 'AI class', field: 'aiClass', format: (v: number) => formatHex(v, 4) },
  { name: 'field34', label: '+0x34', field: 'field34', format: (v: number) => formatHex(v, 4) },
]
</script>

<template>
  <div>
    <p>71 monster records × 56 bytes.</p>
    <QTable
      :rows="rows"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="num"
      dense
      hide-bottom
    />
  </div>
</template>

<style scoped></style>
