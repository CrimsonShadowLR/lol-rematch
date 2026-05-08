import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'lol-rematch-blacklist'

export interface BlacklistEntry {
  name: string
  role: string
  champion: string
  addedAt: number
}

export const useBlacklistStore = defineStore('blacklist', () => {
  const entries = ref<BlacklistEntry[]>([])

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) entries.value = JSON.parse(raw) as BlacklistEntry[]
  } catch {}

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
  }

  function add(name: string, role: string, champion: string) {
    if (has(name)) return
    entries.value.push({ name, role, champion, addedAt: Date.now() })
    persist()
  }

  function remove(name: string) {
    entries.value = entries.value.filter((e) => e.name !== name)
    persist()
  }

  function has(name: string): boolean {
    return entries.value.some((e) => e.name.toLowerCase() === name.toLowerCase())
  }

  return { entries, add, remove, has }
})
