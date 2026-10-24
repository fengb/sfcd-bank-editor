<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'

import type { BankRegion } from '@/domain/bank'

import { formatHex } from '../BytesViewer/hex'

const props = defineProps<{ bytes?: BankRegion; region?: BankRegion; offset?: number }>()
const source = computed(() => props.region ?? props.bytes!)

const TABLE_SIZE = 576
const baseOffset = computed(() => props.offset ?? source.value.offset)

const rows = computed(() => {
  const result: Record<string, unknown>[] = []
  const end = Math.min(baseOffset.value + TABLE_SIZE, source.value.length)
  for (let off = baseOffset.value; off < end; off += 16) {
    const chunk = source.value.subarray(off, Math.min(off + 16, end))
    result.push({
      relOffset: formatHex(off - baseOffset.value, 4),
      hexes: [...chunk].map((b) => formatHex(b, 2)).join(' '),
      ascii: [...chunk]
        .map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'))
        .join(''),
    })
  }
  return result
})

const columns: QTableProps['columns'] = [
  { name: 'relOffset', label: 'Offset', field: 'relOffset', align: 'center' },
  { name: 'hexes', label: 'Hexes', field: 'hexes' },
  { name: 'ascii', label: 'ASCII', field: 'ascii' },
]
</script>

<template>
  <div>
    <p>
      Spell data table (576 bytes; internal structure undocumented). File offset: 0x{{
        baseOffset.toString(16).toUpperCase().padStart(4, '0')
      }}
    </p>
    <QTable
      :rows="rows"
      :columns="columns"
      :rows-per-page-options="[0]"
      row-key="relOffset"
      dense
      hide-bottom
      virtual-scroll
      style="height: 400px"
    />
  </div>
</template>

<style scoped></style>
