import { Timestamp } from "firebase-admin/firestore";

export enum Topics {
  REFRESH_METRICS = "refresh-metrics",
}

export interface RefreshMetricsData {
  mintAddress: string; // Token mint address
}

export interface DexTransactions {
  buys: number; // Number of buy transactions
  sells: number; // Number of sell transactions
}

export interface Token {
  /** On-chain metadata */
  name: string;
  symbol: string;
  mintAddress: string;
  createdAt: Timestamp;

  creator: string | null;
  pairAddress: string | null;
  quoteAddress: string | null;

  /** Live metrics */
  marketCapUsd: number; // total liquidity in USD
  fdvUsd: number; // fully diluted valuation in USD

  priceUsd: number; // current price
  priceChange1hPct: number;
  priceChange6hPct: number; // 1m % change
  priceChange5mPct: number; // 30m % change
  priceChange24hPct: number; // 24h % change

  volume24hUsd: number; // 24h volume in USD
  volume5mUsd: number; // 5m volume in USD
  volume1hUsd: number; // 1h volume in USD
  volume6hUsd: number; // 6h volume in USD

  holdersCount?: number; // number of token holders

  txns5m: DexTransactions;
  txns1h: DexTransactions;
  txns6h: DexTransactions;
  txns24h: DexTransactions;

  dexUrl: string | null; // URL to the DEX pair (e.g. Raydium, Orca)

  /** Last time any metric was updated */
  updatedAt?: Timestamp;

  imageURI: string | null; // URL to the token image
  metadataURI: string | null;
  description: string | null;
  twitter: string | null;
  telegram: string | null;
  bonding_curve: string | null;
  associated_bonding_curve: string | null;
}
