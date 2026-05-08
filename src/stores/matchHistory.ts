import { ref } from 'vue'
import { defineStore } from 'pinia'
import { parseOpggRSC } from '@/lib/opggParser'
import type { OpggMatch } from '@/lib/opggParser'

// Next.js Server Action ID for "load games" on the op.gg summoner page.
// This hash is derived from the server action source code and changes when
// op.gg deploys a new build. To update: open op.gg in DevTools → Network →
// filter for POST requests with a "next-action" header → copy that header value.
const GAMES_ACTION = '409a2b9ca50d15e50a4dace93552e3a40113dc2753'

const POLL_MS = 60 * 60 * 1000

function buildRouterTree(region: string, slug: string): string {
  const tree = [
    '',
    {
      children: [
        ['locale', 'en', 'd'],
        {
          children: [
            'lol',
            {
              children: [
                'summoners',
                {
                  children: [
                    ['region', region, 'd'],
                    {
                      children: [
                        ['summoner', slug, 'd'],
                        { children: ['__PAGE__', {}, null, null] },
                        null,
                        null,
                      ],
                    },
                    null,
                    null,
                  ],
                },
                null,
                null,
              ],
            },
            null,
            null,
          ],
        },
        null,
        null,
      ],
    },
    null,
    null,
    true,
  ]
  return encodeURIComponent(JSON.stringify(tree))
}

async function fetchPuuid(region: string, slug: string): Promise<string> {
  const res = await fetch(`/proxy/opgg/lol/summoners/${region}/${encodeURIComponent(slug)}`, {
    headers: { RSC: '1', Accept: 'text/x-component' },
  })
  const text = await res.text()
  const m = text.match(/"puuid":"([^"]+)"/)
  return m?.[1] ?? ''
}

export const useMatchHistoryStore = defineStore('matchHistory', () => {
  const matches = ref<OpggMatch[]>([])
  const selectedMatch = ref<OpggMatch | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const summoner = ref('')
  const server = ref('lan')

  let puuidCache = ''
  let timer: ReturnType<typeof setInterval> | null = null

  async function load() {
    if (!summoner.value) return
    loading.value = true
    error.value = null
    try {
      const slug = summoner.value.replace('#', '-')
      const region = server.value || 'lan'

      if (!puuidCache) {
        puuidCache = await fetchPuuid(region, slug)
        if (!puuidCache) throw new Error('Summoner not found on op.gg')
      }

      const res = await fetch(`/proxy/opgg/lol/summoners/${region}/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: {
          Accept: 'text/x-component',
          'Content-Type': 'text/plain;charset=UTF-8',
          'Next-Action': GAMES_ACTION,
          'Next-Router-State-Tree': buildRouterTree(region, slug),
        },
        body: JSON.stringify([
          { locale: 'en', region, puuid: puuidCache, gameType: 'TOTAL', endedAt: '', champion: '' },
        ]),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const rscText = await res.text()
      const parsed = parseOpggRSC(rscText)
      if (!parsed.length) throw new Error('No matches parsed — op.gg action hash may have changed')
      matches.value = parsed
      lastUpdated.value = new Date()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Fetch failed'
    } finally {
      loading.value = false
    }
  }

  function selectMatch(match: OpggMatch | null) {
    selectedMatch.value = match
  }

  function start(name: string, region = 'lan') {
    summoner.value = name
    server.value = region
    puuidCache = ''
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
