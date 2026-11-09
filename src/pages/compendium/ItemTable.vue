<script setup lang="ts">
import { QMenu, QTable, QTd, type QTableProps } from 'quasar'

import { formatHex } from '@/components/BytesViewer/hex'
import { type CompendiumItem, type CompendiumNames } from '@/domain/Bank/Compendium'
import { splitBits } from '@/utils/bits'

import ClassMask from './ClassMask.vue'
import ItemFlags from './ItemFlags.vue'

const props = defineProps<{ items: CompendiumItem[]; names: CompendiumNames }>()

function formatSpell(value: number, names: CompendiumNames): string | null {
  if (value === 0x3f) return null
  const [flags, idx] = splitBits(value, [2, 6])
  const flagsDisplay: Record<number, string> = {
    0: '¹',
    1: '²',
    2: '³',
    3: '⁴',
  }
  return `${formatHex(idx, 2)}${flagsDisplay[flags]} ${names.spells[idx]}`
}

const columns: QTableProps['columns'] = [
  {
    name: 'item',
    label: 'Item',
    field: 'itemId',
    format: (id) => `${formatHex(id, 2)} - ${props.names.items[id]}`,
    align: 'left',
  },
  { name: 'mask', label: 'Class mask', field: 'mask' },
  {
    name: 'range',
    label: 'Range',
    field: 'range',
    align: 'left',
    format: ([min, max]) => (min === max ? String(max) : `${min}-${max}`),
  },
  { name: 'price', label: 'Price', field: 'price', align: 'right' },
  { name: 'flags', label: 'Flags', field: 'flags' },
  {
    name: 'useSpell',
    label: 'Use spell',
    field: 'useSpell',
    align: 'left',
    format: (spell) => formatSpell(spell, props.names),
  },
  {
    name: 'equip',
    label: 'Equip',
    field: 'equip',
    format: (equip: number[]) => equip.map((v) => formatHex(v, 2)).join(' '),
  },
]
</script>

<template>
  <QTable
    :rows="props.items"
    :columns="columns"
    :rows-per-page-options="[0]"
    row-key="num"
    dense
    hide-bottom
  >
    <template #body-cell-mask="cellProps">
      <QTd class="cell-trigger">
        {{ formatHex(cellProps.row.mask, 8) }}
        <QMenu class="q-pa-sm">
          <ClassMask :mask="cellProps.row.mask" :names="props.names" />
        </QMenu>
      </QTd>
    </template>
    <template #body-cell-flags="cellProps">
      <QTd class="cell-trigger">
        {{ formatHex(cellProps.row.flags, 2) }}
        <QMenu class="q-pa-sm">
          <ItemFlags :flags="cellProps.row.flags" />
        </QMenu>
      </QTd>
    </template>
  </QTable>
</template>

<style scoped>
.cell-trigger {
  text-decoration: underline dotted;
  cursor: pointer;
}
</style>
