import { FieldValue } from "firebase-admin/firestore";
import { DexTransactions, Token } from "../../types";
import { pumpFunTokenConverter } from "./converters";
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
  const tokenCollectionRef = getTokenCollectionRef().withConverter(
    pumpFunTokenConverter
  );
  const mcField: keyof Token = "marketCapUsd";
  const q = tokenCollectionRef.orderBy(mcField, "desc");
  const snapshot = await q.get();
  return snapshot.docs.map((doc) => doc.data());
};

export const updateToken = async (
  mintAddress: string,
  payload: UpdateTokenPayload
): Promise<void> => {
  logger.info("Updating token", {
    mintAddress,
    payload,
  });
  if (payload.holdersCount === undefined) {
    delete payload.holdersCount;
  }
  const tokenRef = getTokenCollectionRef()
    .doc(mintAddress)
    .withConverter(pumpFunTokenConverter);

  await tokenRef.update({
    ...payload,
    updatedAt: FieldValue.serverTimestamp(),
  } as Partial<Token>);
};
