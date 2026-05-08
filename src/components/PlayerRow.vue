<script setup lang="ts">
import { computed } from 'vue'
import type { Player } from '@/types'
import { useBlacklistStore } from '@/stores/blacklist'

const props = defineProps<{
  player: Player
  team: 'blue' | 'red'
  myTeam?: 'blue' | 'red' | null
  champIcon: (id: number) => string
  spellImg: (id: number) => string
  runeImg: (id: number) => string
  rankColor: (rank: string) => string
}>()

const blacklist = useBlacklistStore()
const isBlacklisted = computed(() => blacklist.has(props.player.summonerName))
const blacklistTooltip = computed(() => {
  if (!isBlacklisted.value) return ''
  if (!props.myTeam) return 'Blacklisted'
  return props.team === props.myTeam ? 'Blacklisted — playing WITH you' : 'Blacklisted — playing AGAINST you'
})

function toggleBlacklist() {
  if (isBlacklisted.value) {
    blacklist.remove(props.player.summonerName)
  } else {
    blacklist.add(props.player.summonerName, props.player.role, props.player.championSlug)
  }
}
</script>

<template>
  <div
    :title="blacklistTooltip || undefined"
    :class="[
      'flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors group',
      isBlacklisted
        ? 'bg-red-950/40 border border-red-800/40'
        : player.isTarget
          ? 'bg-[#c8aa6e]/10 border border-[#c8aa6e]/30'
          : 'bg-[#1a1f2e] hover:bg-[#1e2438]',
    ]"
  >
    <!-- champion icon -->
    <img
      :src="champIcon(player.championId)"
      :alt="player.championSlug"
      :title="player.championSlug"
      class="w-9 h-9 rounded-full border border-slate-700 flex-shrink-0 object-cover"
      onerror="this.style.visibility='hidden'"
    />

    <!-- spells + rune stacked -->
    <div class="flex flex-col gap-0.5 flex-shrink-0">
      <div class="flex gap-0.5">
        <img v-if="spellImg(player.spell1Id)" :src="spellImg(player.spell1Id)" class="w-4 h-4 rounded" />
        <img v-if="spellImg(player.spell2Id)" :src="spellImg(player.spell2Id)" class="w-4 h-4 rounded" />
      </div>
      <img v-if="runeImg(player.runeId)" :src="runeImg(player.runeId)" class="w-4 h-4 rounded-full" />
    </div>

    <!-- name + rank -->
    <div class="flex-1 min-w-0">
      <div class="truncate font-medium flex items-center gap-1" :class="isBlacklisted ? 'text-red-300' : 'text-slate-100'">
        {{ player.summonerName }}
        <svg v-if="isBlacklisted" :title="blacklistTooltip" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-400 inline-block"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        <span v-else-if="player.isTarget" class="text-[#c8aa6e] text-xs">★</span>
        <span v-if="player.premadeWith.length" class="text-blue-400 text-xs" :title="player.premadeWith.join(', ')">
          👥{{ player.premadeWith.length }}
        </span>
      </div>
      <div class="flex items-center gap-2 text-xs mt-0.5">
        <span :class="rankColor(player.rank)">{{ player.rank }}</span>
        <span v-if="player.role" class="text-slate-500">{{ player.role }}</span>
      </div>
    </div>

    <!-- winrate + kda -->
    <div class="text-right text-xs flex-shrink-0">
      <div class="text-slate-300">{{ player.winRate }}</div>
      <div class="text-slate-500">{{ player.kda }}</div>
    </div>

    <!-- blacklist toggle — visible on hover or when already blacklisted -->
    <button
      :title="isBlacklisted ? 'Remove from blacklist' : 'Add to blacklist'"
      :class="[
        'flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-all',
        isBlacklisted
          ? 'text-red-400 hover:text-red-300 opacity-100'
          : 'text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100',
      ]"
      @click.stop="toggleBlacklist"
    >
      <svg v-if="!isBlacklisted" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
    </button>
  </div>
</template>
