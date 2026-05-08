<script setup lang="ts">
import { useMatchHistoryStore } from '@/stores/matchHistory'
import type { LogMatch } from '@/lib/logParser'

const store = useMatchHistoryStore()

function toggleSelect(match: LogMatch) {
  store.selectMatch(store.selectedMatch === match ? null : match)
}

function resultBorder(r: string) {
  if (r === 'victory') return 'border-l-blue-500 bg-blue-900/10'
  if (r === 'remade') return 'border-l-slate-500 bg-slate-800/30'
  return 'border-l-red-500 bg-red-900/10'
}

function resultBadge(r: string) {
  if (r === 'victory') return { text: 'W', cls: 'text-blue-400 font-bold' }
  if (r === 'remade') return { text: 'R', cls: 'text-slate-400 font-bold' }
  return { text: 'L', cls: 'text-red-400 font-bold' }
}
</script>

<template>
  <div>
    <!-- header -->
    <div class="flex items-center justify-between mb-3">
      <span class="text-[#c8aa6e] font-semibold">Recent Matches</span>
      <div class="flex items-center gap-2">
        <span v-if="store.loading" class="text-slate-500 text-xs animate-pulse">refreshing…</span>
        <span v-if="store.lastUpdated" class="text-slate-500 text-xs">
          updated {{ store.lastUpdated.toLocaleTimeString() }}
        </span>
      </div>
    </div>

    <!-- loading -->
    <div v-if="store.loading && !store.matches.length" class="flex items-center gap-2 text-slate-400 text-sm">
      <span class="animate-spin inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full"></span>
      Loading match history…
    </div>

    <!-- error -->
    <div v-else-if="store.error && !store.matches.length" class="text-red-400 text-sm">
      {{ store.error }}
    </div>

    <!-- matches -->
    <div v-else-if="store.matches.length" class="space-y-1.5">
      <div
        v-for="(match, i) in store.matches"
        :key="i"
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded border-l-4 text-sm cursor-pointer transition-all',
          resultBorder(match.result),
          store.selectedMatch === match ? 'ring-1 ring-[#c8aa6e]/50 brightness-125' : 'hover:brightness-110',
        ]"
        @click="toggleSelect(match)"
      >
        <!-- result badge -->
        <div class="w-4 text-center flex-shrink-0" :class="resultBadge(match.result).cls">
          {{ resultBadge(match.result).text }}
        </div>

        <!-- champion icon -->
        <img
          v-if="match.championImg"
          :src="match.championImg"
          :alt="match.championName"
          :title="match.championName"
          class="w-9 h-9 rounded-full border border-slate-700 flex-shrink-0 object-cover"
          onerror="this.style.visibility='hidden'"
        />

        <!-- spells + rune -->
        <div class="flex flex-col gap-0.5 flex-shrink-0">
          <div class="flex gap-0.5">
            <img v-if="match.spell1Img" :src="match.spell1Img" class="w-4 h-4 rounded" />
            <img v-if="match.spell2Img" :src="match.spell2Img" class="w-4 h-4 rounded" />
          </div>
          <img v-if="match.runeImg" :src="match.runeImg" class="w-4 h-4 rounded-full" />
        </div>

        <!-- champion name + queue -->
        <div class="flex-shrink-0 w-28">
          <div class="font-medium text-slate-100 truncate">{{ match.championName }}</div>
          <div class="text-slate-500 text-xs truncate">{{ match.queue }}</div>
        </div>

        <!-- KDA + KP -->
        <div class="flex-shrink-0 w-28 text-center">
          <div class="text-slate-200">{{ match.kda }}</div>
          <div class="text-slate-500 text-xs">
            <span v-if="match.cs">{{ match.cs }}</span>
            <span v-if="match.cs && match.kp" class="mx-1 text-slate-600">·</span>
            <span v-if="match.kp">{{ match.kp }} KP</span>
          </div>
        </div>

        <!-- LP + duration -->
        <div class="flex-shrink-0 w-20 text-right">
          <div
            v-if="match.lpChange"
            :class="match.lpChange.startsWith('+') ? 'text-blue-400' : 'text-red-400'"
          >
            {{ match.lpChange }}
          </div>
          <div class="text-slate-500 text-xs">{{ match.duration }}</div>
        </div>

        <!-- time ago -->
        <div class="text-slate-500 text-xs ml-auto">{{ match.timeAgo }}</div>
      </div>
    </div>

    <div v-else class="text-slate-500 text-sm italic">No recent matches found.</div>
  </div>
</template>
