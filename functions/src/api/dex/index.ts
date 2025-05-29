import axios from "axios";
import { logger } from "firebase-functions";
import { DexScreenerPair } from "./types";

export const getDexData = async (
  mintAddress: string
): Promise<DexScreenerPair> => {
  logger.info("Fetching DEX data for mint address", {
    mintAddress: mintAddress,
  });
  const pairs = await axios.get<any, DexScreenerPair[]>(
    `https://api.dexscreener.com/solana/${mintAddress}`
  );

  logger.info("Fetched DEX data", {
    mintAddress: mintAddress,
    data: pairs,
  });

  // find pair with largest volume
  pairs.sort((a, b) => {
    return b.volume.h24 - a.volume.h24;
  });

  const topPair = pairs[0];
  if (!topPair) {
    throw new Error(`No DEX pair found for ${mintAddress}`);
  }

  return topPair;
};
