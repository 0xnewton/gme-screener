import axios from "axios";
import { logger } from "firebase-functions";
import { DexScreenerPair } from "./types";

const ENDPOINT = "https://api.dexscreener.com";

export const getDexData = async (mintAddress: string): Promise<DexScreenerPair> => {
  logger.info("Fetching DEX data for mint address", {
    mintAddress: mintAddress,
  });
  const { data: pairs } = await axios.get<unknown, { data: DexScreenerPair[] }>(
    `${ENDPOINT}/token-pairs/v1/solana/${mintAddress}`,
  );

  logger.info("Fetched DEX data", {
    mintAddress: mintAddress,
    data: pairs,
  });

  // find pair with largest volume
  pairs.sort((a, b) => {
    return (b?.volume?.h24 ?? 0) - (a?.volume?.h24 ?? 0);
  });

  const topPair = pairs[0];
  if (!topPair) {
    throw new Error(`No DEX pair found for ${mintAddress}`);
  }

  return topPair;
};
