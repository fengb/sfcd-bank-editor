<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'

import { decodeSpell } from '@/domain/bank'
import type { BankRegion } from '@/domain/bank'

import { formatHex } from '../BytesViewer/hex'

const props = defineProps<{ region: BankRegion; offset?: number }>()

const RECORD_SIZE = 0x38 // 56 bytes
const RECORD_COUNT = 71
const baseOffset = computed(() => props.offset ?? props.region.offset)

function readU16be(data: Uint8Array, off: number): number {
  return ((data[off]! << 8) | data[off + 1]!) >>> 0
}

function decodeInventory(value: number): string {
  if (value === 0x007f) return ' --'
  const equipped = (value & 0x80) !== 0
  const idx = value & 0x7f
  return `${formatHex(idx, 2)}${equipped ? '+' : ' '}`
}

const rows = computed(() => {
  const result: Record<string, unknown>[] = []
  for (let i = 0; i < RECORD_COUNT; i++) {
    const base = baseOffset.value + i * RECORD_SIZE
    if (base + RECORD_SIZE > props.region.length) break
    const rec: Record<string, unknown> = { '#': i }
    rec.index = readU16be(props.region, base + 0x00)
    rec.level = readU16be(props.region, base + 0x0a)
    rec.hp = readU16be(props.region, base + 0x0c)
    rec.field0e = readU16be(props.region, base + 0x0e)
    rec.mp = props.region[base + 0x10]!
    rec.atk = props.region[base + 0x12]!
    rec.def = props.region[base + 0x14]!
    rec.agi = props.region[base + 0x16]!
    rec.mov = props.region[base + 0x18]!
    rec.field1a = formatHex(readU16be(props.region, base + 0x1a), 4)
    rec.field1e = formatHex(readU16be(props.region, base + 0x1e), 4)

    rec.inventory = Array.from({ length: 4 }).map((_, s) =>
      readU16be(props.region, base + 0x20 + s * 2),
    )
    rec.spells = Array.from({ length: 4 }).map((_, s) => props.region[base + 0x28 + s]!)

    rec.field2c = formatHex(readU16be(props.region, base + 0x2c), 4)
    rec.field2e = formatHex(readU16be(props.region, base + 0x2e), 4)
    rec.aiClass = formatHex(readU16be(props.region, base + 0x30), 4)
    rec.field34 = formatHex(readU16be(props.region, base + 0x34), 4)

    result.push(rec)
  }
  return result
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
  { name: 'field1a', label: '+0x1A', field: 'field1a' },
  { name: 'field1e', label: '+0x1E', field: 'field1e' },
  { name: 'field0e', label: '+0x0E', field: 'field0e' },
  { name: 'field2c', label: '+0x2C', field: 'field2c' },
  { name: 'field2e', label: '+0x2E', field: 'field2e' },
  { name: 'aiClass', label: 'AI class', field: 'aiClass' },
  { name: 'field34', label: '+0x34', field: 'field34' },
]
</script>

<template>
  <div>
    <p>
      71 monster records × 56 bytes. File offset: 0x{{
        baseOffset.toString(16).toUpperCase().padStart(4, '0')
      }}
    </p>
    <QTable
      :rows="rows"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="num"
      dense
      hide-bottom
      style="height: 400px"
    />
  </div>
</template>

<style scoped></style>
