import type { MatchRow, MatchResult } from '@/types'

export interface OpggMatch extends MatchRow {
  championImg: string
  spell1Img: string
  spell2Img: string
  runeImg: string
  kp: string
  players: LastGamePlayer[]
}

export interface LastGamePlayer {
  name: string        // "GameName#Tag"
  position: string    // "TOP" | "JUNGLE" | "MID" | "BOTTOM" | "SUPPORT"
  championName: string
  championImg: string
  rank: string        // "GOLD 2" or ""
  kda: string         // "7/5/13"
  team: 'blue' | 'red'
}

interface GameType {
  game_type: string
  game_translate: string
}

interface RawTeamPlayer {
  position: string
  champion: { name: string; image_url: string }
  summoner: { game_name: string; tagline: string }
  tier_info: { tier: string; division: number } | null
  stats: { kill: number; death: number; assist: number }
}

interface RawMatch {
  game_result: 'WIN' | 'LOSE' | 'REMAKE'
  game_type: GameType | string
  game_length: number
  created_at: string
  champion: { name: string; image_url: string }
  spells: Array<{ image_url: string }>
  runes: Array<{ image_url: string }>
  stats: {
    kda: { kill: number; death: number; assist: number }
    cs: { totalCs: number; csPerMin: number }
    killParticipation: number
  }
  summoner_team: 'RED' | 'BLUE' | string
  team_blue: RawTeamPlayer[] | null
  team_red: RawTeamPlayer[] | null
}

function formatTimeAgo(createdAt: string): string {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

function formatRank(info: RawTeamPlayer['tier_info']): string {
  if (!info?.tier) return ''
  const div = info.division ? ` ${info.division}` : ''
  return `${info.tier}${div}`
}

// RSC wire format uses "$1:data:N:field" references to deduplicate repeated objects.
function resolveGameType(raw: GameType | string, data: RawMatch[]): string {
  if (typeof raw === 'object' && raw !== null) return raw.game_translate
  if (typeof raw === 'string') {
    const m = raw.match(/^\$\d+:data:(\d+):\w+$/)
    if (m) {
      const src = data[parseInt(m[1])]?.game_type
      if (typeof src === 'object' && src !== null) return src.game_translate
    }
  }
  return ''
}

function extractPlayers(m: RawMatch): LastGamePlayer[] {
  const map = (arr: RawTeamPlayer[] | null, team: 'blue' | 'red'): LastGamePlayer[] =>
    (arr ?? []).map((p) => ({
      name: `${p.summoner.game_name}#${p.summoner.tagline}`,
      position: p.position,
      championName: p.champion.name,
      championImg: p.champion.image_url,
      rank: formatRank(p.tier_info),
      kda: `${p.stats.kill}/${p.stats.death}/${p.stats.assist}`,
      team,
    }))
  return [...map(m.team_blue, 'blue'), ...map(m.team_red, 'red')]
}

// Parse the RSC wire-format response from the op.gg Server Action.
// Each line is "{hexId}:{json_payload}". The match list is the line whose
// value is {"data": [{game_result, champion, ...}, ...]}.
export function parseOpggRSC(rscText: string): OpggMatch[] {
  for (const line of rscText.split('\n')) {
    const colon = line.indexOf(':')
    if (colon < 0) continue
    let parsed: { data?: RawMatch[] } | null = null
    try {
      parsed = JSON.parse(line.slice(colon + 1))
    } catch {
      continue
    }
    if (!parsed?.data || !Array.isArray(parsed.data) || !parsed.data[0]?.game_result) continue

    const { data } = parsed
    return data.map((m): OpggMatch => {
      const result: MatchResult =
        m.game_result === 'WIN' ? 'victory' : m.game_result === 'REMAKE' ? 'remade' : 'defeat'

      return {
        matchUrl: '',
        result,
        queue: resolveGameType(m.game_type, data),
        timeAgo: formatTimeAgo(m.created_at),
        duration: formatDuration(m.game_length),
        lpChange: '',
        kda: `${m.stats.kda.kill} / ${m.stats.kda.death} / ${m.stats.kda.assist}`,
        cs: m.stats.cs.totalCs ? `${m.stats.cs.totalCs} CS` : '',
        championId: 0,
        championName: m.champion.name,
        spell1Id: 0,
        spell2Id: 0,
        runeId: 0,
        championImg: m.champion.image_url,
        spell1Img: m.spells[0]?.image_url ?? '',
        spell2Img: m.spells[1]?.image_url ?? '',
        runeImg: m.runes[0]?.image_url ?? '',
        kp: m.stats.killParticipation ? `${m.stats.killParticipation}%` : '',
        players: extractPlayers(m),
      }
    })
  }
  return []
}
