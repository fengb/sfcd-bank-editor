<script setup lang="ts">
import { computed } from 'vue'

import BytesViewer from '@/components/BytesViewer'
import { useBankFileStore } from '@/stores/bank'

import ItemTable from './ItemTable.vue'
import MonsterStats from './MonsterStats.vue'
import NamesTable from './NamesTable.vue'

const store = useBankFileStore()
const compendium = computed(() => store.bank!.toc.compendium.region())
</script>

<template>
  <h2>Compendium</h2>
  <MonsterStats :monsters="compendium.monsters" />
  <ItemTable :items="compendium.items" />
  <BytesViewer :bytes="compendium.spells" />
  <NamesTable :names="compendium.names" />
</template>

<style scoped></style>
