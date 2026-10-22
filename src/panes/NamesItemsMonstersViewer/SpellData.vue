<script setup lang="ts">
import { computed } from 'vue'
import { QTable, type QTableProps } from 'quasar'

import { formatHex } from '../BytesViewer/hex'

const props = defineProps<{ bytes: Uint8Array; offset: number }>()

const TABLE_SIZE = 576

const rows = computed(() => {
  const result: Record<string, any>[] = []
  const end = Math.min(props.offset + TABLE_SIZE, props.bytes.length)
  for (let off = props.offset; off < end; off += 16) {
    const chunk = props.bytes.subarray(off, Math.min(off + 16, end))
    result.push({
      relOffset: formatHex(off - props.offset, 4),
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
        offset.toString(16).toUpperCase().padStart(4, '0')
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
