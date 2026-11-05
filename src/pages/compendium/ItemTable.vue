<script setup lang="ts">
import { QTable, type QTableProps } from 'quasar'
import { computed } from 'vue'

import { formatHex } from '@/components/BytesViewer/hex'
import { decodeSpell } from '@/domain/Bank'
import { type CompendiumItem } from '@/domain/Bank/Compendium'

const props = defineProps<{ items: CompendiumItem[] }>()

const rows = computed(() => {
  return props.items.map((rec, i) => ({
    '#': i,
    mask: rec.mask,
    range: rec.range,
    price: rec.price,
    flags: rec.flags,
    useSpell: decodeSpell(rec.useSpell),
    equip: rec.equip,
  }))
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
    <p>64 item/weapon records × 16 bytes.</p>
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
