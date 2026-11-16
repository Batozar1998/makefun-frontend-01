# make.fun frontend — "Ledger Lite"

[![bounty](https://img.shields.io/badge/bounty-make.fun%20frontend-0b5fff)](https://make.fun/bounty/makefun-frontend-01)
[![live pot](https://img.shields.io/badge/pot-$663.50%20live-brightgreen)](https://make.fun/bounty/makefun-frontend-01)
[![deadline](https://img.shields.io/badge/closes-Nov%2017%2019%3A30%20WIB-orange)](https://make.fun/bounty/makefun-frontend-01)

A fast, read-only make.fun frontend made of static files — no build step, no
framework, no fonts, no images. It reads make.fun's public API only.

- **Board** — live bounties with reward / live pot, entry fee, time left, entries
- **Bounty page** — summary, rules, rewards table with the live pot, dates, status
- **Leaderboard** — a bounty's standings, paginated, handles link to profiles
- **Profile** — an account's public record and entries

Every surface is reachable by a link and by its own URL (`#/`, `#/bounty/<slug>`,
`#/bounty/<slug>/leaderboard`, `#/u/<handle>`).

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

## Build the submission bundle

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Entry

Competition: [Build the best make.fun frontend](https://make.fun/bounty/makefun-frontend-01) — $500 + entry fees, top 20 paid.
