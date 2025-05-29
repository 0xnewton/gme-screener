import { Timestamp } from "firebase-admin/firestore";
import { DexTransactions, Token } from "../../types";
import { getTokenCollectionRef } from "./refs";
import { logger } from "firebase-functions";

interface UpdateTokenPayload {
  pairAddress: string;
  quoteAddress: string;
  marketCapUsd: number;
  fdvUsd: number;
  priceUsd: number;
  priceChange1hPct: number;
  priceChange6hPct: number;
  priceChange5mPct: number;
  priceChange24hPct: number;
  volume24hUsd: number;
  volume5mUsd: number;
  volume1hUsd: number;
  volume6hUsd: number;
  holdersCount?: number;
  txns5m: DexTransactions;
  txns1h: DexTransactions;
  txns6h: DexTransactions;
  txns24h: DexTransactions;
  dexUrl: string;
}

export const getAllTokens = async (): Promise<Token[]> => {
  const tokenCollectionRef = getTokenCollectionRef();
  const mcField: keyof Token = "marketCapUsd";
  const q = tokenCollectionRef.orderBy(mcField, "desc");
  const snapshot = await q.get();
  return snapshot.docs.map((doc) => doc.data());
};

export const updateToken = async (
  mintAddress: string,
  payload: UpdateTokenPayload,
): Promise<void> => {
  logger.info("Updating token", {
    mintAddress,
    payload,
  });
  if (payload.holdersCount === undefined) {
    delete payload.holdersCount;
  }
  const tokenRef = getTokenCollectionRef().doc(mintAddress);

  await tokenRef.update({
    ...payload,
    updatedAt: Timestamp.now(),
  } as Partial<Token>);
};

interface CreateTokenPayload {
  name: string;
  symbol: string;
  mintAddress: string;
}

export const createToken = async (payload: CreateTokenPayload): Promise<Token> => {
  logger.info("Creating new token", {
    mintAddress: payload.mintAddress,
    payload,
  });
  const tokenRef = getTokenCollectionRef().doc(payload.mintAddress);

  const newToken: Token = {
    ...payload,
    createdAt: Timestamp.now(),
  };

  await tokenRef.create(newToken);

  logger.info("Created new token", {
    mintAddress: payload.mintAddress,
    token: newToken,
  });

  return newToken as Token;
};

export const getToken = async (mintAddress: string): Promise<Token | undefined> => {
  logger.info("Fetching token by mint address", {
    mintAddress: mintAddress,
  });
  const tokenRef = getTokenCollectionRef().doc(mintAddress);
  const doc = await tokenRef.get();
  if (!doc.exists) {
    logger.warn("Token not found", {
      mintAddress: mintAddress,
    });
    return undefined;
  }
  const token = doc.data();
  logger.info("Fetched token", {
    mintAddress: mintAddress,
    token,
  });
  return token;
};
