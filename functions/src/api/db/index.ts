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
  creator: string | null;
  imageURI: string | null;
  metadataURI: string | null;
  description: string | null;
  twitter: string | null;
  telegram: string | null;
  bonding_curve: string | null;
  associated_bonding_curve: string | null;
}

const NULL_TXNS: DexTransactions = {
  buys: 0,
  sells: 0,
};

export const createToken = async (payload: CreateTokenPayload): Promise<Token> => {
  logger.info("Creating new token", {
    mintAddress: payload.mintAddress,
    payload,
  });
  const tokenRef = getTokenCollectionRef().doc(payload.mintAddress);

  const newToken: Token = {
    ...payload,
    pairAddress: null,
    quoteAddress: null,
    dexUrl: null,
    marketCapUsd: 0,
    fdvUsd: 0,
    priceUsd: 0,
    priceChange1hPct: 0,
    priceChange6hPct: 0,
    priceChange5mPct: 0,
    priceChange24hPct: 0,
    volume24hUsd: 0,
    volume5mUsd: 0,
    volume1hUsd: 0,
    volume6hUsd: 0,
    holdersCount: 0,
    txns5m: NULL_TXNS,
    txns1h: NULL_TXNS,
    txns6h: NULL_TXNS,
    txns24h: NULL_TXNS,
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
