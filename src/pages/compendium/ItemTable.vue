<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import { decodeSpell } from '@/domain/Bank'
import { readU16be, readU32be } from '@/domain/Bank/util'

const props = defineProps<{ region: Uint8Array; offset: number }>()

const RECORD_SIZE = 16
const RECORD_COUNT = 64

const rows = computed(() => {
  const result: Record<string, unknown>[] = []
  for (let i = 0; i < RECORD_COUNT; i++) {
    const base = props.offset + i * RECORD_SIZE
    if (base + RECORD_SIZE > props.region.length) break
    const rec: Record<string, unknown> = { '#': i }
    rec.mask = readU32be(props.region, base)
    rec.range = [props.region[base + 0x05]!, props.region[base + 0x04]!]
    rec.price = readU16be(props.region, base + 0x06)
    rec.flags = props.region[base + 0x08]!
    rec.useSpell = decodeSpell(props.region[base + 0x09]!)
    rec.equip = [...props.region.subarray(base + 0x0a, base + 0x10)]
    result.push(rec)
  }
  return result
})

const columns: QTableProps['columns'] = [
  { name: 'num', label: '#', field: '#', align: 'center', style: 'width: 30px' },
  { name: 'mask', label: 'Class mask', field: 'mask', format: (v) => formatHex(v, 8) },
  {
    name: 'range',
    label: 'Range',
    field: 'range',
    align: 'left',
    format: ([min, max]) => (min === max ? String(max) : `${min}-${max}`),
  },
  { name: 'price', label: 'Price', field: 'price', align: 'right' },
  {
    name: 'flags',
    label: 'Flags',
    field: 'flags',
    align: 'center',
    format: (v: number) => {
      const bits: [number, string][] = [
        [0x80, '💥'],
        [0x40, '💀'],
        [0x20, '🧪'],
        [0x10, '🔒'],
        [0x08, '✨'],
        [0x04, '💍'],
        [0x02, '🗡️'],
        [0x01, '❓'],
      ]
      return bits.map(([mask, emoji]) => ((v & mask) !== 0 ? emoji : '⬜')).join('')
    },
  },
  { name: 'useSpell', label: 'Use spell', field: 'useSpell' },
  {
    name: 'equip',
    label: 'Equip',
    field: 'equip',
    format: (equip: number[]) => equip.map((v) => formatHex(v, 2)).join(' '),
  },
]
</script>

<template>
  <div>
    <p>
      64 item/weapon records × 16 bytes. File offset: 0x{{
        props.offset.toString(16).toUpperCase().padStart(4, '0')
      }}
    </p>
    <p class="text-caption q-mb-sm">
      Flags bits: 💥 breakable, 💀 cursed, 🧪 consumable, 🔒 unsellable, ✨ rare, 💍 ring, 🗡️
      weapon, ❓ unused (⬜ = unset)
    </p>
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
