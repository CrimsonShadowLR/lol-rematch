<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useLiveGameStore } from '@/stores/liveGame'
import { useMatchHistoryStore } from '@/stores/matchHistory'
import SetupPage from '@/components/SetupPage.vue'
import LiveGame from '@/components/LiveGame.vue'
import MatchHistory from '@/components/MatchHistory.vue'
import Blacklist from '@/components/Blacklist.vue'

const settings = useSettingsStore()
const liveStore = useLiveGameStore()
const historyStore = useMatchHistoryStore()

function startPolling() {
  liveStore.start(settings.summoner, settings.server)
  historyStore.start(settings.summoner, settings.server)
}

function onSetupDone() {
  startPolling()
}

function resetSettings() {
  liveStore.stop()
  historyStore.stop()
  settings.clear()
}

onMounted(() => {
  if (settings.isConfigured) startPolling()
})

onUnmounted(() => {
  liveStore.stop()
  historyStore.stop()
})
</script>

<template>
  <!-- setup page — shown when no account saved -->
  <SetupPage v-if="!settings.isConfigured" @done="onSetupDone" />

  <!-- main app -->
  <div v-else class="min-h-screen bg-[#0a0e1a] text-slate-100 font-sans">
    <!-- top bar -->
    <header class="border-b border-[#c8aa6e]/20 bg-[#0d1117] px-6 py-3 flex items-center gap-4">
      <span class="text-[#c8aa6e] font-bold text-lg tracking-wide">LoL Rematch</span>
      <span class="text-slate-600 text-sm">|</span>
      <span class="text-slate-500 text-xs">polls every 15 min</span>
      <div class="ml-auto flex items-center gap-3">
        <span class="text-slate-400 text-sm">{{ settings.summoner }}</span>
        <span class="text-slate-600 text-xs uppercase">{{ settings.server }}</span>
        <button
          class="text-slate-500 text-xs hover:text-slate-300 transition-colors border border-slate-700 rounded px-2 py-1"
          @click="resetSettings"
        >
          Change
        </button>
      </div>
    </header>

    <main class="max-w-[1400px] mx-auto px-4 py-6 space-y-8">

      <!-- live game section -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-[#c8aa6e] font-semibold uppercase tracking-widest text-xs">Live Game</h2>
          <div class="flex-1 h-px bg-[#c8aa6e]/20"></div>
        </div>
        <LiveGame />
      </section>

      <!-- match history section -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-[#c8aa6e] font-semibold uppercase tracking-widest text-xs">Match History</h2>
          <div class="flex-1 h-px bg-[#c8aa6e]/20"></div>
        </div>
        <MatchHistory />
      </section>

      <!-- blacklist section -->
      <section>
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-red-800 font-semibold uppercase tracking-widest text-xs">Blacklist</h2>
          <div class="flex-1 h-px bg-red-900/30"></div>
        </div>
        <Blacklist />
      </section>

    </main>
  </div>
</template>
