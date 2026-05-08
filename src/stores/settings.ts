import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'lol-rematch-settings'

export const SERVERS = [
  { label: 'LAN — Latin America North', value: 'lan' },
  { label: 'LAS — Latin America South', value: 'las' },
  { label: 'NA — North America', value: 'na' },
  { label: 'EUW — Europe West', value: 'euw' },
  { label: 'EUNE — Europe Nordic & East', value: 'eune' },
  { label: 'BR — Brazil', value: 'br' },
  { label: 'KR — Korea', value: 'kr' },
  { label: 'JP — Japan', value: 'jp' },
  { label: 'OCE — Oceania', value: 'oce' },
  { label: 'TR — Turkey', value: 'tr' },
  { label: 'RU — Russia', value: 'ru' },
] as const

export type ServerValue = (typeof SERVERS)[number]['value']

export const useSettingsStore = defineStore('settings', () => {
  const summoner = ref('')
  const server = ref('')   // e.g. "lan"

  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) {
    try {
      const data = JSON.parse(raw) as { summoner?: string; server?: string }
      summoner.value = data.summoner ?? ''
      server.value = data.server ?? ''
    } catch {
      // ignore corrupt storage
    }
  }

  const isConfigured = computed(() => !!summoner.value && !!server.value)

  function save(newSummoner: string, newServer: string) {
    summoner.value = newSummoner.trim()
    server.value = newServer.toLowerCase()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ summoner: summoner.value, server: server.value }))
  }

  function clear() {
    summoner.value = ''
    server.value = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  return { summoner, server, isConfigured, save, clear }
})
