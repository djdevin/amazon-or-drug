# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built `dist/` locally

There is no test runner, linter, or formatter configured. `wrangler` is a runtime dependency, suggesting the built `dist/` is intended to be deployed to Cloudflare (Pages or Workers static assets), but no `wrangler.toml` is checked in yet.

## Architecture

A single-page Vite + React 19 game ("Amazon seller or prescription drug?"). The whole app is three files:

- `src/App.jsx` — the entire game: deck construction, round/score/streak state, keyboard handling (←/a/1 = amazon, →/d/2 = drug), and the two render branches (`playing` vs. `ended`). `TOTAL_ROUNDS` is hard-coded at the top. `buildDeck()` shuffles `AMAZON_SELLERS` and `PRESCRIPTION_DRUGS`, takes a near-even slice from each, and reshuffles. `endingFor(score, total)` maps a final percentage to a flavor-text title/blurb.
- `src/data.js` — two flat arrays of strings (`AMAZON_SELLERS`, `PRESCRIPTION_DRUGS`) that are the only source of game content. The game's premise depends on names being **non-obvious**: avoid adding sellers whose names contain genre tells like "tech", "audio", "home", "cam", etc., since those give the answer away. Drugs should be brand names (capitalized, no suffix giveaways).
- `src/styles.css` — all styling; no CSS framework, no CSS modules.

`src/main.jsx` is just the React 19 `createRoot` entry point and is unlikely to need changes.
