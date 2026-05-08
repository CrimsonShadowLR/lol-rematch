import { ref } from 'vue'
import { loadSpellMap, loadRuneMap, champIcon } from '@/lib/ddragon'

const spellMap = ref<Map<number, string>>(new Map())
const runeMap = ref<Map<number, string>>(new Map())
let _init = false

export function useImages() {
  if (!_init) {
    _init = true
    loadSpellMap().then((m) => {
      spellMap.value = m
    })
    loadRuneMap().then((m) => {
      runeMap.value = m
    })
  }

  const spellImg = (id: number) => spellMap.value.get(id) ?? ''
  const runeImg = (id: number) => runeMap.value.get(id) ?? ''

  return { champIcon, spellImg, runeImg }
}
