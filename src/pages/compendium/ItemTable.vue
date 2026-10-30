<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import { readU16be } from '@/domain/Bank/util'

const props = defineProps<{ region: Uint8Array; offset: number }>()

const RECORD_SIZE = 16
const RECORD_COUNT = 64

const rows = computed(() => {
  const result: Record<string, unknown>[] = []
  for (let i = 0; i < RECORD_COUNT; i++) {
    const base = props.offset + i * RECORD_SIZE
    if (base + RECORD_SIZE > props.region.length) break
    const rec: Record<string, unknown> = { '#': i }
    rec.mask = formatHex(readU16be(props.region, base + 0x02), 4)
    rec.category = formatHex(readU16be(props.region, base + 0x04), 4)
    rec.price = readU16be(props.region, base + 0x06)
    rec.flags = formatHex(props.region[base + 0x08]!, 2)
    rec.unknown09 = formatHex(props.region[base + 0x09]!, 2)
    rec.attackType = formatHex(props.region[base + 0x0a]!, 2)
    rec.attackPower = props.region[base + 0x0b]!
    rec.extra = [...props.region.subarray(base + 0x0c, base + 0x10)]
      .map((b) => formatHex(b, 2))
      .join(' ')
    result.push(rec)
  }
  return result
})

const columns: QTableProps['columns'] = [
  { name: 'num', label: '#', field: '#', align: 'center', style: 'width: 30px' },
  { name: 'mask', label: 'Class mask', field: 'mask', align: 'center' },
  { name: 'category', label: 'Weapon cat', field: 'category', align: 'center' },
  { name: 'price', label: 'Price', field: 'price', align: 'right' },
  { name: 'flags', label: 'Flags', field: 'flags', align: 'center' },
  { name: 'unknown09', label: '+0x09', field: 'unknown09', align: 'center' },
  { name: 'attackType', label: 'Atk type', field: 'attackType', align: 'center' },
  { name: 'attackPower', label: 'ATK power', field: 'attackPower', align: 'center' },
  { name: 'extra', label: 'Extra (+0x0C)', field: 'extra' },
]
</script>

<template>
  <div>
    <p>
      64 item/weapon records × 16 bytes. File offset: 0x{{
        props.offset.toString(16).toUpperCase().padStart(4, '0')
      }}
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
