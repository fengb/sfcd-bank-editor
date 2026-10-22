<script setup lang="ts">
import { capitalize, computed } from 'vue'
import { QTable, type QTableProps } from 'quasar'
import { mapValues, zip } from 'es-toolkit'

const props = defineProps<{ bytes: Uint8Array; offsets: Record<string, number> }>()

const columns = computed<QTableProps['columns']>(() =>
  Object.keys(props.offsets).map((name, i) => ({
    name,
    label: capitalize(name),
    field: String(i),
    align: 'left',
  })),
)

function* readString(data: Uint8Array, offset: number): Generator<[string, number]> {
  while (offset < data.length) {
    const len = data[offset++]!
    if (offset + len > data.length) return null
    const name = [...data.subarray(offset, offset + len)]
      .map((c) => (c === 0x0d ? ' ' : String.fromCharCode(c)))
      .join('')

    yield [name, offset]

    offset += len
  }
}

const rows = computed(() => {
  const names: Record<keyof typeof props.offsets, string[]> = mapValues(props.offsets, () => [])
  const sortedOffsets = Object.entries(props.offsets).map(([key, offset]) => ({ key, offset }))

  let current = sortedOffsets.shift()!
  const startingOffset = current.offset
  for (const [name, offset] of readString(props.bytes, startingOffset)) {
    const next = sortedOffsets[0]
    if (next && next.offset <= offset) {
      current = sortedOffsets.shift()!
    }
    names[current.key]!.push(name)
  }

  return zip(...Object.values(names))
})
</script>

<template>
  <div>
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
