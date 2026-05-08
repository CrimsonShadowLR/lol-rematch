import { ref } from 'vue'
import { defineStore } from 'pinia'
import { parsePoro } from '@/lib/poroParser'
import type { LiveGame } from '@/types'

const POLL_MS = 15 * 60 * 1000

export const useLiveGameStore = defineStore('liveGame', () => {
  const game = ref<LiveGame | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const summoner = ref('')
  const server = ref('lan')
  const notInGame = ref(false)

  let timer: ReturnType<typeof setInterval> | null = null

  async function load() {
    if (!summoner.value) return
    loading.value = true
    error.value = null
    notInGame.value = false
    try {
      const name = summoner.value.replace('#', '-')
      const res = await fetch(`/proxy/poro/partial/live-partial/${server.value}/${encodeURIComponent(name)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const html = await res.text()
      const parsed = parsePoro(html, name)
      if (!parsed) {
        notInGame.value = true
        game.value = null
      } else {
        game.value = parsed
        lastUpdated.value = new Date()
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fetch failed'
      game.value = null
    } finally {
      loading.value = false
    }
  }

  function start(name: string, region = 'lan') {
    summoner.value = name
    server.value = region
    game.value = null
    notInGame.value = false
    if (timer) clearInterval(timer)
    load()
    timer = setInterval(load, POLL_MS)
  }

  function stop() {
    if (timer) clearInterval(timer)
    timer = null
  }

  return { game, loading, error, lastUpdated, summoner, server, notInGame, load, start, stop }
})
