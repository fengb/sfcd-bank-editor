<script setup lang="ts">
import { computed } from 'vue'
import { QTable, type QTableProps } from 'quasar'

import { formatHex } from '../BytesViewer/hex'

const props = defineProps<{ bytes: Uint8Array; offset: number }>()

const RECORD_SIZE = 0x38 // 56 bytes
const RECORD_COUNT = 71

function readU16be(data: Uint8Array, off: number): number {
  return ((data[off]! << 8) | data[off + 1]!) >>> 0
}

function decodeInventory(value: number): string {
  if (value === 0x007f) return 'empty'
  const equipped = (value & 0x80) !== 0
  const idx = value & 0x7f
  return `idx ${idx}${equipped ? ' (equipped)' : ''}`
}

function decodeSpell(value: number): string {
  if (value === 0x3f) return 'empty'
  const idx = value & 0x3f
  const flags = value & 0xc0
  return flags ? `idx ${idx} (flags 0x${formatHex(flags)})` : `idx ${idx}`
}

const rows = computed(() => {
  const result: Record<string, any>[] = []
  for (let i = 0; i < RECORD_COUNT; i++) {
    const base = props.offset + i * RECORD_SIZE
    if (base + RECORD_SIZE > props.bytes.length) break
    const rec: Record<string, any> = { '#': i }
    rec.index = readU16be(props.bytes, base + 0x00)
    rec.level = readU16be(props.bytes, base + 0x0a)
    rec.hp = readU16be(props.bytes, base + 0x0c)
    rec.field0e = readU16be(props.bytes, base + 0x0e)
    rec.mp = props.bytes[base + 0x10]!
    rec.atkBase = props.bytes[base + 0x12]!
    rec.def = props.bytes[base + 0x14]!
    rec.agi = props.bytes[base + 0x16]!
    rec.mov = props.bytes[base + 0x18]!
    rec.field1a = formatHex(readU16be(props.bytes, base + 0x1a), 4)
    rec.field1e = formatHex(readU16be(props.bytes, base + 0x1e), 4)

    const inv: string[] = []
    for (let s = 0; s < 4; s++) {
      inv.push(decodeInventory(readU16be(props.bytes, base + 0x20 + s * 2)))
    }
    rec.inventory = inv.join(', ')

    const spells: string[] = []
    for (let s = 0; s < 4; s++) {
      spells.push(decodeSpell(props.bytes[base + 0x28 + s]!))
    }
    rec.spells = spells.join(', ')

    rec.field2c = formatHex(readU16be(props.bytes, base + 0x2c), 4)
    rec.field2e = formatHex(readU16be(props.bytes, base + 0x2e), 4)
    rec.aiClass = formatHex(readU16be(props.bytes, base + 0x30), 4)
    rec.field34 = formatHex(readU16be(props.bytes, base + 0x34), 4)

    result.push(rec)
  }
  return result
})

const columns: QTableProps['columns'] = [
  { name: 'num', label: '#', field: '#', align: 'center', style: 'width: 30px' },
  { name: 'index', label: 'Idx', field: 'index', align: 'center', style: 'width: 40px' },
  { name: 'level', label: 'Lvl', field: 'level', align: 'center', style: 'width: 40px' },
  { name: 'hp', label: 'HP', field: 'hp', align: 'center', style: 'width: 40px' },
  { name: 'mp', label: 'MP', field: 'mp', align: 'center', style: 'width: 40px' },
  { name: 'atkBase', label: 'ATK(base)', field: 'atkBase', align: 'center', style: 'width: 50px' },
  { name: 'def', label: 'DEF', field: 'def', align: 'center', style: 'width: 40px' },
  { name: 'agi', label: 'AGI', field: 'agi', align: 'center', style: 'width: 40px' },
  { name: 'mov', label: 'MOV', field: 'mov', align: 'center', style: 'width: 40px' },
  { name: 'aiClass', label: 'AI class', field: 'aiClass', align: 'center', style: 'width: 50px' },
  { name: 'inventory', label: 'Inventory', field: 'inventory' },
  { name: 'spells', label: 'Spells', field: 'spells' },
  { name: 'field1a', label: '+0x1A', field: 'field1a', align: 'center' },
  { name: 'field1e', label: '+0x1E', field: 'field1e', align: 'center' },
  { name: 'field0e', label: '+0x0E', field: 'field0e', align: 'center', style: 'width: 50px' },
  { name: 'field2c', label: '+0x2C', field: 'field2c', align: 'center', style: 'width: 50px' },
  { name: 'field2e', label: '+0x2E', field: 'field2e', align: 'center', style: 'width: 50px' },
  { name: 'field34', label: '+0x34', field: 'field34', align: 'center', style: 'width: 50px' },
]
</script>

<template>
  <div>
    <p>
      71 monster records × 56 bytes. File offset: 0x{{
        offset.toString(16).toUpperCase().padStart(4, '0')
      }}
    </p>
    <QTable
      :rows="rows"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="num"
      dense
      hide-bottom
      virtual-scroll
      style="height: 400px"
    />
  </div>
</template>

<style scoped></style>
