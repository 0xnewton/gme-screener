GME Token Screener Backend
==========================

This repo powers the backend services that track tokens deployed by the GME token
contract on Solana and keeps their on-chain + market metrics fresh. It includes:

- A real-time indexer that listens to Pump.fun create events, filters for mints
  ending in "GME", stores them in Firestore, and enqueues metric refresh tasks.
- Firebase Cloud Functions that backfill new tokens on a schedule and refresh
  price/volume/market-cap metrics via DexScreener.
- Firestore rules/indexes and a small hosting bundle (used by the frontend app).

Architecture
------------

1) Indexer (Cloud Run)
   - Listens to Pump.fun create events with `pumpdotfun-sdk`
   - Filters tokens whose mint address ends with `GME`
   - Writes a `Tokens/{mintAddress}` document
   - Enqueues a task for `refreshMetrics`

2) Scheduled token backfill (Cloud Functions)
   - Runs every 5 minutes
   - Queries Pump.fun REST API for recent `...GME` tokens
   - Creates any missing token docs
   - Enqueues a refresh task for each new token

3) Scheduled metric refresh (Cloud Functions)
   - Runs every 5 minutes
   - Loads all tokens ordered by market cap
   - Enqueues `refreshMetrics` tasks for each token

4) Metrics refresh task (Cloud Functions task queue)
   - Pulls top DexScreener pair for the token
   - Updates price, volume, txns, market cap, and other metrics

Repository Layout
-----------------

- `indexer/`: Cloud Run service that listens to Pump.fun events
- `functions/`: Firebase Cloud Functions (scheduler + task queue)
- `hosting/`: Frontend bundle + widgets (optional for backend deploys)
- `firestore.rules`, `firestore.indexes.json`: Firestore config

Data Model (Firestore)
----------------------

Collection: `Tokens` (document ID = mint address)

Key fields:
- `name`, `symbol`, `mintAddress`, `creator`, `createdAt`
- `pairAddress`, `quoteAddress`, `dexUrl`
- `priceUsd`, `marketCapUsd`, `fdvUsd`
- `priceChange5mPct`, `priceChange1hPct`, `priceChange6hPct`, `priceChange24hPct`
- `volume5mUsd`, `volume1hUsd`, `volume6hUsd`, `volume24hUsd`
- `txns5m`, `txns1h`, `txns6h`, `txns24h`
- `holdersCount`, `updatedAt`
- `imageURI`, `metadataURI`, `description`, `twitter`, `telegram`,
  `bonding_curve`, `associated_bonding_curve`

Local Development
-----------------

Prereqs:
- Node.js 20
- Firebase CLI (`npm i -g firebase-tools`)
- Google Cloud SDK (for Cloud Run deploys)
- Firestore + Cloud Functions enabled in your Firebase project

Auth / credentials:
- Most code uses Application Default Credentials.
- Set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON file when
  running locally.

Indexer (Cloud Run service)
---------------------------

The indexer listens to Pump.fun create events and stores tokens whose mint
addresses end with `GME`.

Environment variables:
- `SOLANA_RPC_URL`: Solana RPC endpoint
- `PORT`: health check port (default 8080)

Run locally:
```bash
cd indexer
npm install
npm run build
node dist/index.js
```

Deploy (Cloud Run):
```bash
cd indexer
npm install
npm run deploy
```

Firebase Functions
------------------

Functions live under `functions/`:
- `scheduleTokenIndexer`: backfill from Pump.fun every 5 min
- `scheduleMetricRefresh`: enqueue refresh tasks every 5 min
- `refreshMetrics`: task queue worker that updates Firestore metrics

Run emulator:
```bash
cd functions
npm install
npm run serve
```

Deploy:
```bash
cd functions
npm install
npm run deploy
```

Scripts
-------

These are helpful for one-off inspection/backfills:

- `indexer/scripts/getMoonshotTokens.ts`:
  lists SPL mints controlled by a given authority.
- `indexer/scripts/backfillTokens.ts`:
  scans Pump.fun for recent `...GME` tokens and inserts missing docs.

Notes and Assumptions
---------------------

- The indexer and functions both rely on external APIs:
  - Pump.fun (token discovery)
  - DexScreener (price/volume/market cap)
- The Firestore collection is named `Tokens`.
- The filter for GME tokens is `mintAddress.endsWith("GME")`.
