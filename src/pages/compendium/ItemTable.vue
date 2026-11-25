<script setup lang="ts">
import { QMenu, QTable, QTooltip, QTd, type QTableProps } from 'quasar'

import { formatHex } from '@/components/BytesViewer/hex'
import { type CompendiumItem, type CompendiumNames } from '@/domain/Bank/Compendium/Compendium'
import { splitBits } from '@/utils/bits'

import ClassMask from './ClassMask.vue'

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

const ITEM_FLAG_BITS = [
  { bit: 7, icon: '⚒', label: 'breakable' },
  { bit: 6, icon: '☠', label: 'cursed' },
  { bit: 5, icon: '⚕', label: 'consumable' },
  { bit: 4, icon: '⊘', label: 'unsellable' },
  { bit: 3, icon: '✦', label: 'rare' },
  { bit: 2, icon: '◯', label: 'ring' },
  { bit: 1, icon: '⚔', label: 'weapon' },
  { bit: 0, icon: '·', label: 'unused' },
] as const

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
      <QTd>
        <div class="row q-gutter-xs">
          <span
            v-for="flag in ITEM_FLAG_BITS"
            :key="flag.bit"
            :class="{
              'item-flag-box': true,
              'item-flag-on': (cellProps.row.flags >> flag.bit) & 1,
            }"
          >
            {{ flag.icon }}
            <QTooltip>{{ flag.label }}</QTooltip>
          </span>
        </div>
      </QTd>
    </template>
  </QTable>
</template>

<style scoped>
.cell-trigger {
  text-decoration: underline dotted;
  cursor: pointer;
}

.item-flag-box {
  width: 1.2em;
  text-align: center;
}

.item-flag-on {
  background: #4caf50;
  color: #111;
}
</style>
