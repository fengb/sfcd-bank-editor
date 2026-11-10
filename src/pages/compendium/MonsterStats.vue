<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'

import { formatHex } from '@/components/BytesViewer/hex'
import { decodeSpell } from '@/domain/Bank'
import { type CompendiumMonster, type CompendiumNames } from '@/domain/Bank/Compendium'
import { splitBits } from '@/utils/bits'

const props = defineProps<{ monsters: CompendiumMonster[]; names: CompendiumNames }>()

function decodeInventory(value: number): string {
  if (value === 0x007f) return ' --'
  const [equippedBit, idx] = splitBits(value, [1, 7])
  const equipped = equippedBit !== 0
  return `${formatHex(idx, 2)}${equipped ? '+' : ' '}`
}

function formatHexes(array: number[]): string {
  return array.map((n) => formatHex(n, 2)).join(' ')
}

function formatSpellResist(raw: number): string {
  if (!raw) return ''
  const values = splitBits(raw, [2, 2, 2, 2])
  return values.map((val) => val.toString(2).padStart(2, '0')).join(' ')
}

const columns: QTableProps['columns'] = [
  {
    name: 'monster',
    label: 'Monster',
    field: 'monsterId',
    format: (id) => `${formatHex(id, 2)} - ${props.names.monsters[id]}`,
    align: 'left',
  },
  { name: 'index', label: 'Index', field: 'index' },
  { name: 'level', label: 'Level', field: 'level' },
  { name: 'hp', label: 'HP', field: 'hp' },
  { name: 'mp', label: 'MP', field: 'mp' },
  { name: 'atk', label: 'ATK', field: 'atk' },
  { name: 'def', label: 'DEF', field: 'def' },
  { name: 'agi', label: 'AGI', field: 'agi' },
  { name: 'mov', label: 'MOV', field: 'mov' },
  { name: 'unknown1a', label: '0x1A', field: 'unknown1a', format: (v) => formatHex(v, 2) },
  { name: 'spellResist', label: 'Spell Res', field: 'spellResist', format: formatSpellResist },
  { name: 'unknown1c', label: 'Unknown 0x1C', field: 'unknown1c', format: formatHexes },
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
  { name: 'unitClass', label: 'Unit Class', field: 'unitClass', format: formatHex },
  { name: 'unknown32', label: 'Unknown 0x32', field: 'unknown32', format: formatHexes },
]
</script>

<template>
  <div>
    <QTable
      :rows="props.monsters"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="num"
      dense
      hide-bottom
    />
  </div>
</template>

<style scoped></style>
