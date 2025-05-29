import { logger } from "firebase-functions/v2";

const ENDPOINT = "https://frontend-api-v3.pump.fun/coins";

export interface PumpFunCoin {
  mint: string;
  name: string;
  symbol: string;
  created_timestamp: number; // ms since epoch
}

export const getGMETokens = async (hours = 24, pageSize = 48): Promise<PumpFunCoin[]> => {
  logger.info(`🔍 Looking for …GME tokens minted in the last ${hours}h`, { hours, pageSize });
  const cutoff = Date.now() - hours * 3600 * 1000;
  let offset = 0;
  const found: PumpFunCoin[] = [];

  while (true) {
    logger.info(`  → fetching offset=${pageSize}`);
    const res = await fetch(
      `${ENDPOINT}?offset=${offset}&limit=${pageSize}` +
        `&sort=created_timestamp&order=DESC&includeNsfw=true&searchTerm=GME&type=hybrid`,
    );
    if (!res.ok) {
      logger.error("HTTP error", res.status, await res.text());
      break;
    }

    const page = (await res.json()) as PumpFunCoin[];
    logger.info(`    • got ${page.length} items`);

    if (page.length === 0) break;

    // collect any …GME mints in our time window
    for (const coin of page) {
      if (coin.mint.endsWith("GME")) {
        found.push(coin);
      }
    }

    // if the oldest item on this page is already older than our cutoff,
    // we can stop paginating completely
    const oldestTs = page[page.length - 1].created_timestamp;
    if (oldestTs < cutoff) {
      logger.info("    ⏹ reached items older than cutoff, stopping");
      break;
    }

    offset += pageSize;
  }

  logger.info(`\n✅ Found ${found.length} …GME tokens in the last ${hours}h:`);
  console.table(
    found.map((c) => ({
      mint: c.mint,
      symbol: c.symbol,
      name: c.name,
      created: new Date(c.created_timestamp).toLocaleString(),
    })),
  );

  return found;
};
