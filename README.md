# Domain Appraisal — Instant Domain Value Estimates

A GoDaddy-style domain appraisal tool. Type any domain name and get an instant
estimated value, a value range, an explainable breakdown of what drives the
price, and **comparable sales of similar domains** — all from the name alone.

No API keys, no manual data entry, no external dependencies.

## How it works

Unlike a manual scoring sheet, the estimator derives every signal from the
domain string itself, the way GoDaddy's GoValue does:

1. **Name analysis** — length, real-word detection (dictionary segmentation),
   pronounceability, premium keyword tier, hyphen/number penalties, and TLD.
2. **Structural value model** — a calibrated curve that maps name quality to a
   baseline `.com` dollar value, then applies premiums for short length, real
   words, and high-demand keywords, and a multiplier for the extension.
3. **Comparable-sales anchoring** — the name is matched against a built-in set
   of public aftermarket sales. When similar domains are found, the estimate is
   blended toward their (similarity-weighted) median, and the matched sales are
   shown as evidence.
4. **Confidence + range** — confidence rises with comp support; the value range
   widens when evidence is thin.

## Quick start

```bash
npm start
# open http://localhost:3000
```

Type a domain (e.g. `brightpath.com`, `voice.com`, `payflow.ai`) and click
**Get Value**. Recent appraisals are saved on disk and shown below the result.

You can also open `public.html` directly in a browser for an offline estimate
(comparable-sales matching requires the backend).

## API

- `GET  /api/health` — service health check
- `POST /api/appraise` — body `{ "domain": "example.com" }` → full appraisal
- `GET  /api/history?limit=10` — recent appraisals (persisted to disk)
- `GET  /api/comps?limit=25` — comparable-sales pool (built-in + imported)
- `POST /api/comps/import` — add your own comps (CSV or JSON)

### Example

```bash
curl -s -X POST localhost:3000/api/appraise \
  -H 'Content-Type: application/json' \
  -d '{"domain":"brightpath.com"}'
```

## Adding your own comparable sales

The estimator ships with a built-in set of public aftermarket sales. To sharpen
valuations for a specific niche, import your own verified comps.

**CSV** (`POST /api/comps/import`, `format: "csv"`):

```
domain,price,date,vertical,venue
neuralforge.ai,18500,2024-01-01,AI,NameBio
synthflow.ai,14000,2024-03-01,AI,Dan
```

**JSON** (`format: "json"`, `data` as an array of objects):

```json
[{ "domain": "neuralforge.ai", "price": 18500, "date": "2024-01-01", "vertical": "AI", "venue": "NameBio" }]
```

Imported comps are merged into the matching pool and used on the next appraisal.

## Project layout

- `appraisal.js` — name analysis, value model, comparable matching (engine)
- `market-data.js` — word dictionary, keyword tiers, built-in comparable sales
- `server.js` — zero-dependency Node `http` API + static hosting
- `public.html` — single-page GoDaddy-style frontend
- `data/` — JSON persistence for history and imported comps (gitignored)

## Tech stack

- Node.js built-in `http` server — no runtime dependencies
- Plain HTML / CSS / JavaScript frontend
- JSON file persistence

## Notes

Estimates are a heuristic, comp-anchored decision aid — **not** a guaranteed
sale price or financial advice. The built-in comparable sales reflect public
aftermarket data and are illustrative. Always validate with live market
listings and real buyer conversations.
