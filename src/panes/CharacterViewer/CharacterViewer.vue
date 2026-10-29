<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'

import { formatHex } from '@/components/BytesViewer/hex'
import { decodeSpell } from '@/domain/Bank'
import { type default as Character, type CharacterRecord } from '@/domain/Bank/Character'

const props = defineProps<{ character: Character }>()

const STAT_KEYS = ['hp', 'mp', 'att', 'def', 'agi'] as const

const recordColumns: QTableProps['columns'] = [
  { name: 'class', label: 'Class', align: 'left', field: (row) => formatHex(row.classId) },
  ...STAT_KEYS.map((key) => ({
    name: key,
    label: `${key.toUpperCase()} / growth`,
    field: (row: CharacterRecord) => `${row.stats[key].value} / ${row.stats[key].growth}`,
  })),
  {
    name: 'spells',
    label: 'Spells',
    align: 'left',
    field: (row: CharacterRecord) =>
      row.spells.map((s) => `L${s.level}:${decodeSpell(s.spell)}`).join(' '),
  },
  { name: 'term', label: 'Term', field: (row) => formatHex(row.terminator) },
]

const secondaryColumns: QTableProps['columns'] = [
  { name: 'class', label: 'Class', align: 'left', field: (row) => formatHex(row.classId) },
  { name: 'level', label: 'Level', field: 'level' },
  ...[0, 1, 2, 3].map((i) => ({
    name: `b${i + 2}`,
    label: `b${i + 2}`,
    field: (row: { unknown: number[] }) => formatHex(row.unknown[i]!),
  })),
]

const classColumns: QTableProps['columns'] = [
  { name: 'class', label: 'Class', align: 'left', field: (row) => formatHex(row.classId) },
  { name: 'mov', label: 'MOV', field: 'mov' },
  ...[0, 1, 2, 3].map((i) => ({
    name: `b${i + 1}`,
    label: `b${i + 1}`,
    field: (row: { unknown: number[] }) => formatHex(row.unknown[i]!),
  })),
]
</script>

<template>
  <h3>Character records</h3>
  <QTable
    :rows="props.character.records"
    :columns="recordColumns"
    :rows-per-page-options="[0]"
    row-key="offset"
    dense
    hide-bottom
  />

  <h3>Secondary</h3>
  <QTable
    :rows="props.character.secondary"
    :columns="secondaryColumns"
    :rows-per-page-options="[0]"
    row-key="index"
    dense
    hide-bottom
  />

  <h3>Classes</h3>
  <QTable
    :rows="props.character.classes"
    :columns="classColumns"
    :rows-per-page-options="[0]"
    row-key="classId"
    dense
    hide-bottom
  />
</template>

<style scoped></style>
