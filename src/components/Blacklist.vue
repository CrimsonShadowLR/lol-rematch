<script setup lang="ts">
import { ref } from 'vue'
import { useBlacklistStore } from '@/stores/blacklist'

const blacklist = useBlacklistStore()

const ROLES = ['Top', 'Jungle', 'Mid', 'Bottom', 'Support', 'Fill']

const newName = ref('')
const newRole = ref('Mid')
const newChampion = ref('')
const addError = ref('')

function submitAdd() {
  const name = newName.value.trim()
  if (!name) { addError.value = 'Enter a summoner name'; return }
  addError.value = ''
  blacklist.add(name, newRole.value, newChampion.value.trim())
  newName.value = ''
  newChampion.value = ''
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div>
    <!-- empty state -->
    <div v-if="!blacklist.entries.length" class="text-slate-500 text-sm italic mb-4">
      No blacklisted players yet. Add someone from the live game or manually below.
    </div>

    <!-- list -->
    <div v-else class="space-y-1.5 mb-5">
      <div
        v-for="entry in blacklist.entries"
        :key="entry.name"
        class="flex items-center gap-3 px-3 py-2 rounded bg-red-950/30 border border-red-800/30 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>

        <!-- name -->
        <div class="flex-1 min-w-0">
          <div class="font-medium text-red-200 truncate">{{ entry.name }}</div>
          <div class="text-slate-500 text-xs flex gap-2">
            <span v-if="entry.role">{{ entry.role }}</span>
            <span v-if="entry.role && entry.champion" class="text-slate-600">·</span>
            <span v-if="entry.champion" class="capitalize">{{ entry.champion }}</span>
          </div>
        </div>

        <!-- date -->
        <span class="text-slate-600 text-xs flex-shrink-0">{{ formatDate(entry.addedAt) }}</span>

        <!-- remove -->
        <button
          class="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 flex items-center justify-center w-6 h-6"
          title="Remove from blacklist"
          @click="blacklist.remove(entry.name)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
        </button>
      </div>
    </div>

    <!-- manual add form -->
    <form class="flex items-end gap-2 flex-wrap" @submit.prevent="submitAdd">
      <div class="flex flex-col gap-1">
        <label class="text-slate-500 text-xs uppercase tracking-wide">Name</label>
        <input
          v-model="newName"
          placeholder="SummonerName#TAG"
          class="bg-[#1a1f2e] border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-800/60 w-44"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-slate-500 text-xs uppercase tracking-wide">Role</label>
        <select
          v-model="newRole"
          class="bg-[#1a1f2e] border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-red-800/60"
        >
          <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-slate-500 text-xs uppercase tracking-wide">Champion</label>
        <input
          v-model="newChampion"
          placeholder="e.g. Brand"
          class="bg-[#1a1f2e] border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-800/60 w-32"
        />
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-transparent text-xs">x</span>
        <button
          type="submit"
          class="bg-red-900/20 border border-red-800/40 text-red-400 text-sm px-3 py-1.5 rounded hover:bg-red-900/40 transition-colors"
        >
          + Add
        </button>
      </div>
      <p v-if="addError" class="w-full text-red-400 text-xs">{{ addError }}</p>
    </form>
  </div>
</template>
