import type { LiveGame, Player, Ban } from '@/types'

function extractId(className: string, prefix: string): number {
  const m = className.match(new RegExp(`${prefix}-(\\d+)-`))
  return m && m[1] ? parseInt(m[1]) : 0
}

function parseCard(card: Element, targetName: string): Player {
  const el = card as HTMLElement
  const summonerName = el.dataset.summonername ?? ''
  const summonerId = el.dataset.summonerid ?? ''

  const logAnchor = card.querySelector<HTMLAnchorElement>('.cardHeader a')
  const logUrl = logAnchor?.getAttribute('href') ?? ''

  const champImg = card.querySelector('[class*="champion-"][class*="-48"]')
  const championId = extractId(champImg?.className ?? '', 'champion')
  const champSlugEl = card.querySelector<HTMLElement>('[data-champion-slug]')
  const championSlug = champSlugEl?.dataset.championSlug ?? ''

  const perkImg = card.querySelector('[class*="perk-"][class*="-16"]')
  const runeId = extractId(perkImg?.className ?? '', 'perk')

  const spellImgs = Array.from(card.querySelectorAll('[class*="spell-"][class*="-16"]'))
  const spell1Id = extractId(spellImgs[0]?.className ?? '', 'spell')
  const spell2Id = extractId(spellImgs[1]?.className ?? '', 'spell')

  const text = card.querySelector('.cardBody')?.textContent ?? ''

  const rankM = text.match(
    /(Iron|Bronze|Silver|Gold|Platinum|Emerald|Diamond|Master|Grandmaster|Challenger)\s+[IVX]+\s+\d+\s+LP/,
  )
  const rank = rankM ? rankM[0] : 'Unranked'

  const wrM = text.match(/(\d+)%\s+Win\s+\((\d+)\s+Played\)/)
  const winRate = wrM ? `${wrM[1]}% (${wrM[2]}g)` : '–'

  const kdaM = text.match(/(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)\s*\/\s*(\d+\.?\d*)/)
  const kda = kdaM ? `${kdaM[1]} / ${kdaM[2]} / ${kdaM[3]}` : '–'

  const roleM = text.match(/(Top|Jungle|Mid|Bottom|Support|ADC|Bot)\s+\(Current game\)/i)
  const role = roleM?.[1] ?? ''

  const premadeWith = Array.from(card.querySelectorAll('.premadeTag')).flatMap((tag) => {
    const tooltip = tag.getAttribute('tooltip') ?? ''
    return Array.from(tooltip.matchAll(/<li>([^<]+)<\/li>/g)).map((m) => m[1] ?? '')
  })

  const normalized = (s: string) => s.toLowerCase().replace(/[#\s]/g, '-')
  const isTarget = normalized(summonerName) === normalized(targetName)

  return {
    summonerName,
    summonerId,
    championSlug,
    championId,
    spell1Id,
    spell2Id,
    runeId,
    rank,
    winRate,
    kda,
    role,
    logUrl,
    premadeWith,
    isTarget,
  }
}

export function parsePoro(html: string, targetSummoner: string): LiveGame | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const cards = doc.querySelectorAll('.card')
  if (!cards.length) return null

  const gameMode = doc.querySelector('h2.left')?.firstChild?.textContent?.trim() ?? 'Live Game'
  const gameDuration = doc.querySelector('#gameDuration')?.textContent?.trim() ?? ''

  const bans: Ban[] = Array.from(doc.querySelectorAll('.bans img[alt]')).map((img) => ({
    name: img.getAttribute('alt') ?? '',
    championId: extractId(img.className, 'champion'),
  }))

  const blue: Player[] = []
  const red: Player[] = []

  cards.forEach((card) => {
    const el = card as HTMLElement
    if (!el.dataset.summonername) return  // skip non-player cards
    const header = card.querySelector('.cardHeader')
    const player = parseCard(card, targetSummoner)
    if (header?.classList.contains('blue')) blue.push(player)
    else red.push(player)
  })

  return { gameMode, gameDuration, bans, blue, red }
}
