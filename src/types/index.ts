export interface Player {
  summonerName: string
  summonerId: string
  championSlug: string
  championId: number
  spell1Id: number
  spell2Id: number
  runeId: number
  rank: string
  winRate: string
  kda: string
  role: string
  logUrl: string
  premadeWith: string[]
  isTarget: boolean
}

export interface Ban {
  name: string
  championId: number
}

export interface LiveGame {
  gameMode: string
  gameDuration: string
  bans: Ban[]
  blue: Player[]
  red: Player[]
}

export type MatchResult = 'victory' | 'defeat' | 'remade'

export interface MatchRow {
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
  spell1Id: number
  spell2Id: number
  runeId: number
}
