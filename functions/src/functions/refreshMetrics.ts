import { onTaskDispatched } from "firebase-functions/tasks";
import { RefreshMetricsData } from "../types";
import { updateToken } from "../api/db";
import { logger } from "firebase-functions/v2";
import { getDexData } from "../api/dex";

export const refreshMetrics = onTaskDispatched<RefreshMetricsData>(
  {
    retryConfig: {
      maxAttempts: 2,
    },
    rateLimits: {
      maxConcurrentDispatches: 6,
      maxDispatchesPerSecond: 4,
    },
  },
  async (event) => {
    const { mintAddress } = event.data;
    logger.info("Received refresh metrics request", {
      mintAddress: mintAddress,
    });

    try {
      await onRefreshMetrcis(mintAddress);
      logger.info("Metrics refreshed successfully", {
        mintAddress: mintAddress,
      });
    } catch (error) {
      logger.error("Failed to refresh metrics", {
        mintAddress: mintAddress,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error; // Re-throw to ensure the task is retried
    }
  },
);

const onRefreshMetrcis = async (mintAddress: string) => {
  const dexPair = await getDexData(mintAddress);

  // // 2) holder count from Solscan (or another indexer)
  // let holdersCount: number | undefined = undefined; // Default to 0 if the request fails
  // try {
  //   logger.info("Fetching holders count from Solscan", {
  //     mintAddress: mintAddress,
  //   });
  //   const solscan = await axios.get(
  //     `https://public-api.solscan.io/token/holders?tokenAddress=${mintAddress}&offset=0&limit=1`
  //   );
  //   logger.info("Fetched holders count from Solscan", {
  //     mintAddress: mintAddress,
  //     data: solscan.data,
  //   });
  //   holdersCount = solscan.data.total; // Solscan returns a "total" field
  // } catch (err) {
  //   logger.error("Failed to fetch holders count", {
  //     mintAddress,
  //     error: err,
  //   });
  // }

  await updateToken(mintAddress, {
    pairAddress: dexPair.pairAddress,
    quoteAddress: dexPair.quoteToken.address,
    marketCapUsd: dexPair.marketCap,
    fdvUsd: dexPair.fdv,
    priceUsd: Number(dexPair.priceUsd),
    priceChange5mPct: dexPair.priceChange.m5,
    priceChange1hPct: dexPair.priceChange.h1,
    priceChange6hPct: dexPair.priceChange.h6,
    priceChange24hPct: dexPair.priceChange.h24,
    volume24hUsd: dexPair.volume.h24,
    volume5mUsd: dexPair.volume.m5,
    volume1hUsd: dexPair.volume.h1,
    volume6hUsd: dexPair.volume.h6,
    // holdersCount: holdersCount,
    txns5m: dexPair.txns.m5,
    txns1h: dexPair.txns.h1,
    txns6h: dexPair.txns.h6,
    txns24h: dexPair.txns.h24,
    dexUrl: dexPair.url || "",
  });
};
