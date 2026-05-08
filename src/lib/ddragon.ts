const BASE = 'https://ddragon.leagueoflegends.com'
const CDRAGON = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1'

let _version: string | null = null
let _spells: Map<number, string> | null = null
let _runes: Map<number, string> | null = null

async function getVersion(): Promise<string> {
  if (_version) return _version
  const r = await fetch(`${BASE}/api/versions.json`)
  const versions: string[] = await r.json()
  _version = versions[0] ?? '14.1.1'
  return _version
}

export async function loadSpellMap(): Promise<Map<number, string>> {
  if (_spells) return _spells
  const ver = await getVersion()
  const r = await fetch(`${BASE}/cdn/${ver}/data/en_US/summoner.json`)
  const data = await r.json()
  _spells = new Map()
  for (const key in data.data) {
    const spell = data.data[key]
    _spells.set(parseInt(spell.key), `${BASE}/cdn/${ver}/img/spell/${spell.image.full}`)
  }
  return _spells
}

export async function loadRuneMap(): Promise<Map<number, string>> {
  if (_runes) return _runes
  const ver = await getVersion()
  const r = await fetch(`${BASE}/cdn/${ver}/data/en_US/runesReforged.json`)
  const trees: any[] = await r.json()
  _runes = new Map()
  for (const tree of trees) {
    _runes.set(tree.id, `${BASE}/cdn/img/${tree.icon}`)
    for (const slot of tree.slots) {
      for (const rune of slot.runes) {
        _runes.set(rune.id, `${BASE}/cdn/img/${rune.icon}`)
      }
    }
  }
  return _runes
}

export function champIcon(id: number): string {
  return `${CDRAGON}/champion-icons/${id}.png`
}
