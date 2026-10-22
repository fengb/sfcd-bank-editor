<script setup lang="ts">
import { computed } from 'vue'
import { QTable, type QTableProps } from 'quasar'

const props = defineProps<{ bytes: Uint8Array; offset: number; count?: number }>()

function* readString(data: Uint8Array): Generator<string> {
  let off = 0
  while (off < data.length) {
    const len = data[off++]!
    if (off + len > data.length) return null
    yield [...data.subarray(off, off + len)]
      .map((c) => (c === 0x0d ? ' ' : String.fromCharCode(c)))
      .join('')

    off += len
  }
}

const rows = computed(() => {
  const result: string[] = []
  for (const text of readString(props.bytes.slice(props.offset))) {
    if (props.count !== undefined && result.length >= props.count) break
    result.push(text)
  }
  return result
})

const columns: QTableProps['columns'] = [
  { name: 'text', label: 'String', field: (row) => row, align: 'left' },
]
</script>

<template>
  <div>
    <p>
      Length-prefixed name strings ([len byte][ASCII bytes]; 0x0D = space). File offset: 0x{{
        offset.toString(16).toUpperCase().padStart(4, '0')
      }}
      {{ count !== undefined ? ` (expecting ${count} strings)` : '' }}
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
