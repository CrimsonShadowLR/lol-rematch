import { champIcon } from '@/lib/ddragon'
import type { MatchResult } from '@/types'

export interface LogPlayer {
  name: string
  position: string
  championName: string
  championImg: string
  rank: string
  kda: string
  team: 'blue' | 'red'
}

export interface LogMatch {
  matchUrl: string
  result: MatchResult
  queue: string
  timeAgo: string
  duration: string
  lpChange: string
  kda: string
  cs: string
  championId: number
  championName: string
  championImg: string
  spell1Img: string
  spell2Img: string
  runeImg: string
  kp: string
  players: LogPlayer[]
}

function extractId(className: string, prefix: string): number {
  const m = className.match(new RegExp(`${prefix}-(\\d+)-`))
  return m && m[1] ? parseInt(m[1]) : 0
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[#\s]/g, '-')
}

export function parsePoroRecentGames(html: string, targetSummoner: string): LogMatch[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Find the target player's card by matching normalized summoner name
  const cards = doc.querySelectorAll<HTMLElement>('.card[data-summonername]')
  let targetId: string | null = null
  for (const card of cards) {
    const name = card.dataset.summonername ?? ''
    if (normalize(name) === normalize(targetSummoner)) {
      targetId = card.dataset.summonerid ?? null
      break
    }
  }
  if (!targetId) return []

  const expansion = doc.querySelector(`#recents_expand_${targetId}`)
  if (!expansion) return []

  const rows = expansion.querySelectorAll('.recentGames tr')
  if (!rows.length) return []

  return Array.from(rows).map((row): LogMatch => {
    const champImg = row.querySelector<HTMLImageElement>('[class*="champion-"]')
    const champId = champImg ? extractId(champImg.className, 'champion') : 0
    const championName = champImg?.getAttribute('alt') ?? ''

    const isVictory = !!row.querySelector('.winIndicator.victory')
    const isDefeat = !!row.querySelector('.winIndicator.defeat')
    const result: MatchResult = isVictory ? 'victory' : isDefeat ? 'defeat' : 'remade'

    const queue = row.querySelector('.gameMode')?.textContent?.trim() ?? ''

    const kills = row.querySelector('.kills')?.textContent?.trim() ?? '0'
    const deaths = row.querySelector('.deaths')?.textContent?.trim() ?? '0'
    const assists = row.querySelector('.assists')?.textContent?.trim() ?? '0'
    const kda = `${kills} / ${deaths} / ${assists}`

    const matchUrl =
      row.querySelector<HTMLAnchorElement>('a[href*="leagueofgraphs"]')?.getAttribute('href') ?? ''

    return {
      matchUrl,
      result,
      queue,
      timeAgo: '',
      duration: '',
      lpChange: '',
      kda,
      cs: '',
      championId: champId,
      championName,
      championImg: champId ? champIcon(champId) : '',
      spell1Img: '',
      spell2Img: '',
      runeImg: '',
      kp: '',
      players: [],
    }
  })
}
