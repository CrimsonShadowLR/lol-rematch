import { ref } from 'vue'
import { defineStore } from 'pinia'
import { parsePoroRecentGames } from '@/lib/logParser'
import type { LogMatch } from '@/lib/logParser'

const POLL_MS = 60 * 60 * 1000

export const useMatchHistoryStore = defineStore('matchHistory', () => {
  const matches = ref<LogMatch[]>([])
  const selectedMatch = ref<LogMatch | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const summoner = ref('')
  const server = ref('lan')

  let timer: ReturnType<typeof setInterval> | null = null

  async function load() {
    if (!summoner.value) return
    loading.value = true
    error.value = null
    try {
      const slug = summoner.value.replace('#', '-')
      const region = server.value || 'lan'

      const res = await fetch(`/proxy/poro/partial/live-partial/${region}/${encodeURIComponent(slug)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const html = await res.text()
      const parsed = parsePoroRecentGames(html, summoner.value)
      if (!parsed.length) throw new Error('Player not in a live game or no recent matches found')
      matches.value = parsed
      lastUpdated.value = new Date()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fetch failed'
    } finally {
      loading.value = false
    }
  }

  function selectMatch(match: LogMatch | null) {
    selectedMatch.value = match
  }

  function start(name: string, region = 'lan') {
    summoner.value = name
    server.value = region
    matches.value = []
    selectedMatch.value = null
    if (timer) clearInterval(timer)
    load()
    timer = setInterval(load, POLL_MS)
  }

  function stop() {
    if (timer) clearInterval(timer)
    timer = null
  }

  return { matches, selectedMatch, loading, error, lastUpdated, summoner, server, load, start, stop, selectMatch }
})
