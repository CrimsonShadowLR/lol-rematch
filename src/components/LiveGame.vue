<script setup lang="ts">
import { computed } from 'vue'
import { useLiveGameStore } from '@/stores/liveGame'
import { useMatchHistoryStore } from '@/stores/matchHistory'
import { useBlacklistStore } from '@/stores/blacklist'
import { useImages } from '@/composables/useImages'
import PlayerRow from './PlayerRow.vue'

const store = useLiveGameStore()
const historyStore = useMatchHistoryStore()
const blacklist = useBlacklistStore()
const { champIcon, spellImg, runeImg } = useImages()

const displayedMatch = computed(
  () => historyStore.selectedMatch ?? historyStore.matches.find(m => m.result !== 'remade') ?? null
)
const lastGamePlayers = computed(() => displayedMatch.value?.players ?? [])

const blueBans = computed(() => store.game?.bans.slice(0, 5) ?? [])
const redBans = computed(() => store.game?.bans.slice(5) ?? [])

const myTeam = computed<'blue' | 'red' | null>(() => {
  if (store.game?.blue.some(p => p.isTarget)) return 'blue'
  if (store.game?.red.some(p => p.isTarget)) return 'red'
  return null
})

function rankColor(rank: string): string {
  if (/challenger/i.test(rank)) return 'text-yellow-300'
  if (/grandmaster/i.test(rank)) return 'text-red-400'
  if (/master/i.test(rank)) return 'text-purple-400'
  if (/diamond/i.test(rank)) return 'text-blue-400'
  if (/emerald/i.test(rank)) return 'text-emerald-400'
  if (/platinum/i.test(rank)) return 'text-teal-400'
  if (/gold/i.test(rank)) return 'text-yellow-500'
  if (/silver/i.test(rank)) return 'text-slate-300'
  if (/bronze/i.test(rank)) return 'text-orange-800'
  if (/iron/i.test(rank)) return 'text-stone-400'
  return 'text-slate-400'
}
</script>

<template>
  <div class="space-y-4">
    <!-- loading skeleton -->
    <div v-if="store.loading && !store.game" class="flex items-center gap-2 text-slate-400 text-sm">
      <span class="animate-spin inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full"></span>
      Fetching live game…
    </div>

    <!-- not in game — show last game players -->
    <div v-else-if="store.notInGame">
      <p class="text-slate-500 text-sm italic mb-4">
        {{ store.summoner }} is not in a live game.
        <span v-if="historyStore.selectedMatch" class="text-[#c8aa6e]/70">
          {{ historyStore.selectedMatch.championName }} · {{ historyStore.selectedMatch.timeAgo }}
        </span>
        <span v-else>Last game:</span>
      </p>

      <div v-if="lastGamePlayers.length" class="grid grid-cols-2 gap-3">
        <!-- blue team -->
        <div class="space-y-1">
          <span class="text-blue-400 font-semibold text-xs uppercase tracking-wide block mb-2">Blue</span>
          <div
            v-for="p in lastGamePlayers.filter(p => p.team === 'blue')"
            :key="p.name"
            class="flex items-center gap-2 px-2 py-1.5 rounded text-sm bg-[#1a1f2e] group"
          >
            <img :src="p.championImg" :alt="p.championName" class="w-8 h-8 rounded-full border border-slate-700 flex-shrink-0 object-cover" onerror="this.style.visibility='hidden'" />
            <div class="flex-1 min-w-0">
              <div class="truncate font-medium text-slate-100 text-xs">{{ p.name }}</div>
              <div class="text-slate-500 text-xs flex gap-1.5">
                <span v-if="p.rank">{{ p.rank }}</span>
                <span v-if="p.position" class="text-slate-600">{{ p.position }}</span>
              </div>
            </div>
            <span class="text-slate-400 text-xs flex-shrink-0">{{ p.kda }}</span>
            <button
              :title="blacklist.has(p.name) ? 'Remove from blacklist' : 'Add to blacklist'"
              :class="[
                'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-all',
                blacklist.has(p.name)
                  ? 'text-red-400 opacity-100'
                  : 'text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100',
              ]"
              @click="blacklist.has(p.name) ? blacklist.remove(p.name) : blacklist.add(p.name, p.position, p.championName)"
            >
              <!-- ban-circle when not blacklisted, x-circle when blacklisted -->
              <svg v-if="!blacklist.has(p.name)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            </button>
          </div>
        </div>

        <!-- red team -->
        <div class="space-y-1">
          <span class="text-red-400 font-semibold text-xs uppercase tracking-wide block mb-2">Red</span>
          <div
            v-for="p in lastGamePlayers.filter(p => p.team === 'red')"
            :key="p.name"
            class="flex items-center gap-2 px-2 py-1.5 rounded text-sm bg-[#1a1f2e] group"
          >
            <img :src="p.championImg" :alt="p.championName" class="w-8 h-8 rounded-full border border-slate-700 flex-shrink-0 object-cover" onerror="this.style.visibility='hidden'" />
            <div class="flex-1 min-w-0">
              <div class="truncate font-medium text-slate-100 text-xs">{{ p.name }}</div>
              <div class="text-slate-500 text-xs flex gap-1.5">
                <span v-if="p.rank">{{ p.rank }}</span>
                <span v-if="p.position" class="text-slate-600">{{ p.position }}</span>
              </div>
            </div>
            <span class="text-slate-400 text-xs flex-shrink-0">{{ p.kda }}</span>
            <button
              :title="blacklist.has(p.name) ? 'Remove from blacklist' : 'Add to blacklist'"
              :class="[
                'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-all',
                blacklist.has(p.name)
                  ? 'text-red-400 opacity-100'
                  : 'text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100',
              ]"
              @click="blacklist.has(p.name) ? blacklist.remove(p.name) : blacklist.add(p.name, p.position, p.championName)"
            >
              <svg v-if="!blacklist.has(p.name)" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <p v-else class="text-slate-600 text-xs italic">No match history loaded yet.</p>
    </div>

    <!-- error -->
    <div v-else-if="store.error && !store.game" class="text-red-400 text-sm">
      {{ store.error }}
    </div>

    <!-- game data -->
    <div v-else-if="store.game">
      <!-- game header -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <span class="text-[#c8aa6e] font-semibold">{{ store.game.gameMode }}</span>
          <span class="text-slate-400 text-sm">{{ store.game.gameDuration }}</span>
          <span v-if="store.loading" class="text-slate-500 text-xs animate-pulse">refreshing…</span>
        </div>
        <span v-if="store.lastUpdated" class="text-slate-500 text-xs">
          updated {{ store.lastUpdated.toLocaleTimeString() }}
        </span>
      </div>

      <!-- two teams -->
      <div class="grid grid-cols-2 gap-3">
        <!-- blue team -->
        <div class="space-y-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-blue-400 font-semibold text-xs uppercase tracking-wide">Blue</span>
            <div class="flex gap-1">
              <img
                v-for="ban in blueBans"
                :key="ban.championId"
                :src="champIcon(ban.championId)"
                :alt="ban.name"
                :title="`Ban: ${ban.name}`"
                class="w-5 h-5 rounded opacity-50 grayscale"
              />
            </div>
          </div>
          <PlayerRow
            v-for="p in store.game.blue"
            :key="p.summonerId"
            :player="p"
            team="blue"
            :myTeam="myTeam"
            :champIcon="champIcon"
            :spellImg="spellImg"
            :runeImg="runeImg"
            :rankColor="rankColor"
          />
        </div>

        <!-- red team -->
        <div class="space-y-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-red-400 font-semibold text-xs uppercase tracking-wide">Red</span>
            <div class="flex gap-1">
              <img
                v-for="ban in redBans"
                :key="ban.championId"
                :src="champIcon(ban.championId)"
                :alt="ban.name"
                :title="`Ban: ${ban.name}`"
                class="w-5 h-5 rounded opacity-50 grayscale"
              />
            </div>
          </div>
          <PlayerRow
            v-for="p in store.game.red"
            :key="p.summonerId"
            :player="p"
            team="red"
            :myTeam="myTeam"
            :champIcon="champIcon"
            :spellImg="spellImg"
            :runeImg="runeImg"
            :rankColor="rankColor"
          />
        </div>
      </div>
    </div>
  </div>
</template>
