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
  creator: string;
  createdAt: Timestamp;

  pairAddress: string;
  quoteAddress: string;

  /** Live metrics */
  marketCapUsd?: number; // total liquidity in USD
  fdvUsd?: number; // fully diluted valuation in USD

  priceUsd?: number; // current price
  priceChange1hPct?: number;
  priceChange6hPct?: number; // 1m % change
  priceChange5mPct?: number; // 30m % change
  priceChange24hPct?: number; // 24h % change

  volume24hUsd?: number; // 24h volume in USD
  volume5mUsd?: number; // 5m volume in USD
  volume1hUsd?: number; // 1h volume in USD
  volume6hUsd?: number; // 6h volume in USD

  holdersCount?: number; // number of token holders

  txns5m?: DexTransactions;
  txns1h?: DexTransactions;
  txns6h?: DexTransactions;
  txns24h?: DexTransactions;

  dexUrl?: string; // URL to the DEX pair (e.g. Raydium, Orca)

  /** Last time any metric was updated */
  updatedAt?: Timestamp;
}
