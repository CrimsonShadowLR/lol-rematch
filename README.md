# lol-rematch

Personal League of Legends companion app. Tracks live games and match history for a saved summoner, with a blacklist system for players you want to remember.

## Features

- **Live game** — shows current game participants with rank, KDA, and premade detection. Highlights blacklisted players and indicates whether they are on your team or against you.
- **Match history** — pulls recent matches from op.gg. Click any match to inspect its player list.
- **Last game players** — when not in a live game, displays the 10 players from the last non-remake match so you can quickly blacklist anyone.
- **Blacklist** — save players with their role and champion. Persisted to `localStorage`.

## Stack

Vue 3 + Pinia · Vite · Tailwind CSS v4 · TypeScript

Data sources: `porofessor.gg` (live game) · `op.gg` (match history)

## Setup

```sh
pnpm install
pnpm dev       # http://localhost:5173
pnpm build
pnpm lint
```

On first launch, enter your summoner name (`Name#TAG`) and region. Settings are saved to `localStorage`.

## op.gg action hash

Match history uses a Next.js Server Action. The hash in `src/stores/matchHistory.ts` (`GAMES_ACTION`) changes when op.gg redeploys. To update it: open op.gg in DevTools → Network → find a POST request with a `next-action` header → copy that value.
