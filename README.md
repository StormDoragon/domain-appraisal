# Domain Appraisal — NovaDomain AI Lab

A high-fidelity, explainable domain appraisal experience with a lightweight Node API and persistent appraisal history.

## What makes this unique

- Explainable scoring engine with weighted components (brandability, demand, longevity, semantic depth, TLD power)
- Deterministic synthetic comparable sales generation for reproducible outputs
- Liquidity and confidence signals for investor decision support
- Buyer persona matching by vertical
- Risk and opportunity radar
- Negotiation-ready outbound pricing narrative
- One-click JSON report copy for sharing or automation
- API-backed appraisal execution
- Persistent recent-appraisal history

## Quick start (recommended: API mode)

1. Run `npm start`.
2. Open `http://localhost:3000`.
3. Enter your domain and market assumptions.
4. Click **Run Deep Appraisal**.
5. Review the **Recent Appraisals** panel (saved on disk).

## Quick start (static mode)

1. Open `public.html` in your browser.
2. Enter your domain and market assumptions.
3. Click **Run Deep Appraisal**.
4. Use **Copy JSON Report** to export data.

In static mode, appraisals still work, but history persistence is disabled.

## API endpoints

- `GET /api/health` — service health check
- `POST /api/appraise` — run valuation using submitted input payload
- `GET /api/history?limit=6` — fetch latest saved appraisals
- `POST /api/history` — save an appraisal entry
- `GET /api/comps?limit=25` — list comparable sales pool summary
- `POST /api/comps/import` — import comparable sales data (CSV/JSON)
- `POST /api/comps/match` — run weighted comparable matching for an input payload

## Comparable import formats

### CSV

Header fields:

`domain,price,date,vertical,tld,source,traffic,cpc,age,keywords`

Example:

`neuralforge.ai,125000,2025-06-11,AI,.ai,NameBio,0,0,0,"neural, forge, ai"`

### JSON

Payload to `/api/comps/import` can include `data` as an array of objects:

`[{"domain":"neuralforge.ai","price":125000,"date":"2025-06-11","vertical":"AI","tld":".ai","source":"NameBio","keywords":"neural,forge,ai"}]`

The matcher uses weighted similarity across label structure, length proximity, TLD relevance, vertical fit, keyword overlap, and recency.

## Inputs supported

- Domain name
- Vertical
- TLD profile
- Monthly traffic
- Estimated CPC
- Domain age
- Buyer intent pressure
- Semantic keyword hints

## Output signals

- Estimated market value
- Listing corridor (low/high)
- Quality score
- Liquidity class
- Confidence estimate
- Component score bars
- Synthetic comparable sales list
- Risk/opportunity insight cards
- Outbound pricing strategy paragraph

## Tech stack

- Plain HTML, CSS, and JavaScript frontend
- Node.js built-in `http` server backend
- JSON file persistence at `data/history.json`
- No external runtime dependencies

## Notes

This is an appraisal aid, not financial advice. Use it as a decision-support layer together with real comparable sales and buyer conversations.