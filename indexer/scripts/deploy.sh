#!/usr/bin/env bash
set -euo pipefail

# 1) Load your .env into the current shell
set -a
source "$(dirname "$0")/../.env"
set +a

# 3) Deploy, passing the env var into Cloud Run’s runtime config
gcloud run deploy gme-indexer \
  --source . \
  --project=gme-screener-461314 \
  --region=us-east1 \
  --no-allow-unauthenticated \
  --min-instances=1 --max-instances=1 \
  --concurrency=1 --cpu=1 \
  --set-env-vars SOLANA_RPC_URL="$SOLANA_RPC_URL"
