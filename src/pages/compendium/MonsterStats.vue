<script setup lang="ts">
import { QMenu, QTable, QTd, type QTableProps } from 'quasar'

import { formatHex } from '@/components/BytesViewer/hex'
import { decodeSpell } from '@/domain/Bank'
import { type CompendiumMonster, type CompendiumNames } from '@/domain/Bank/Compendium/Compendium'
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

const SPELL_RESIST_ICONS = ['♨︎', '❄︎', '⚡︎', '≋'] as const

const SPELL_RESIST_CLASSES: Record<number, string> = {
  0: 'spell-resist-neutral',
  1: 'spell-resist-high',
  2: 'spell-resist-resistant',
  3: 'spell-resist-vulnerable',
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
  { name: 'spellResist', label: 'Spell Res', field: 'spellResist' },
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
    >
      <template #body-cell-spells="cellProps">
        <QTd class="cell-trigger">
          {{ cellProps.row.spells.map(decodeSpell).join('') }}
          <QMenu class="q-pa-sm">
            <div v-for="(spell, i) in cellProps.row.spells" :key="i">
              {{ decodeSpell(spell) }}
              {{ props.names.spells[splitBits(spell, [2, 6])[1]] }}
            </div>
          </QMenu>
        </QTd>
      </template>
      <template #body-cell-spellResist="cellProps">
        <QTd>
          <div class="row no-wrap q-gutter-xs">
            <span
              v-for="(value, index) in splitBits(cellProps.row.spellResist, [2, 2, 2, 2])"
              :key="index"
              :class="['spell-resist-symbol', SPELL_RESIST_CLASSES[value] ?? '']"
            >
              {{ SPELL_RESIST_ICONS[index] }}
            </span>
          </div>
        </QTd>
      </template>
    </QTable>
  </div>
</template>

<style scoped>
.cell-trigger {
  text-decoration: underline dotted;
  cursor: pointer;
}

.spell-resist-symbol {
  width: 16px;
  text-align: center;
}

.spell-resist-neutral {
  opacity: 0.35;
}

.spell-resist-high {
  background: #daa520;
}

.spell-resist-resistant {
  background: #1e88e5;
  color: #fff;
}

.spell-resist-vulnerable {
  background: #e53935;
  color: #fff;
}
</style>
