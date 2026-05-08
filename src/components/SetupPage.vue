<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore, SERVERS } from '@/stores/settings'

const settings = useSettingsStore()
const emit = defineEmits<{ done: [] }>()

const summonerInput = ref('')
const serverInput = ref('lan')
const error = ref('')

function submit() {
  const s = summonerInput.value.trim()
  if (!s) { error.value = 'Enter your summoner name'; return }
  if (!s.includes('#')) { error.value = 'Use format: Name#TAG  (e.g. PlayerName#TAG)'; return }
  error.value = ''
  settings.save(s, serverInput.value)
  emit('done')
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- logo -->
      <div class="text-center mb-8">
        <div class="text-[#c8aa6e] font-bold text-3xl tracking-widest mb-1">LoL Rematch</div>
        <div class="text-slate-500 text-sm">Live game tracker &amp; match history</div>
      </div>

      <!-- card -->
      <div class="bg-[#0d1117] border border-[#c8aa6e]/20 rounded-lg p-8">
        <h1 class="text-slate-200 font-semibold text-lg mb-6">Set up your account</h1>

        <form class="space-y-5" @submit.prevent="submit">
          <!-- summoner name -->
          <div>
            <label class="block text-slate-400 text-xs mb-1.5 uppercase tracking-wider">
              Summoner Name
            </label>
            <input
              v-model="summonerInput"
              placeholder="PlayerName#TAG"
              autofocus
              class="w-full bg-[#1a1f2e] border border-slate-700 rounded px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#c8aa6e]/60 transition-colors"
            />
            <p class="text-slate-500 text-xs mt-1">Include the # tag exactly as shown in-game</p>
          </div>

          <!-- server -->
          <div>
            <label class="block text-slate-400 text-xs mb-1.5 uppercase tracking-wider">
              Server
            </label>
            <select
              v-model="serverInput"
              class="w-full bg-[#1a1f2e] border border-slate-700 rounded px-3 py-2.5 text-slate-200 focus:outline-none focus:border-[#c8aa6e]/60 transition-colors"
            >
              <option v-for="s in SERVERS" :key="s.value" :value="s.value">
                {{ s.label }}
              </option>
            </select>
          </div>

          <!-- error -->
          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

          <!-- submit -->
          <button
            type="submit"
            class="w-full bg-[#c8aa6e]/10 border border-[#c8aa6e]/40 text-[#c8aa6e] font-semibold py-2.5 rounded hover:bg-[#c8aa6e]/20 transition-colors"
          >
            Save &amp; Continue
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
