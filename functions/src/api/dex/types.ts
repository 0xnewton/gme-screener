// Define the four supported periods
export type Period = "m5" | "h1" | "h6" | "h24";

// Reusable stats for transactions
export interface TxnStats {
  buys?: number;
  sells?: number;
}

// Token metadata shape
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
}

// Main pair response from Dexscreener
export interface DexScreenerPair {
  chainId: string; // e.g. "solana"
  dexId: string; // e.g. "pumpfun"
  url: string; // the DEX UI URL
  pairAddress: string; // base58 mint‐pair address
  baseToken: TokenInfo;
  quoteToken: TokenInfo;
  priceNative?: string; // on-chain price as string
  priceUsd?: string; // USD price as string
  txns?: Partial<Record<Period, TxnStats>>; // buys/sells per period
  volume?: Partial<Record<Period, number>>; // volume in USD per period
  priceChange?: Partial<Record<Period, number>>; // % change per period
  fdv?: number; // fully-diluted value in USD
  marketCap?: number; // market cap in USD
  pairCreatedAt?: number; // timestamp (ms since epoch)
}
