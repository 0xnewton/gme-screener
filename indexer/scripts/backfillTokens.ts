import admin from "firebase-admin";
import { FieldValue, UpdateData } from "firebase-admin/firestore";

/**
 * Fetch all Pump.fun coins minted in the last N hours whose mint address ends in “GME”
 * by paginating through the public `/coins` API.
 *
 * To use: paste into your browser console or run with `ts-node`.
 */
interface PumpFunCoin {
  mint: string;
  name: string;
  symbol: string;
  created_timestamp: number; // ms since epoch
}

interface Token {
  name: string;
  symbol: string;
  mintAddress: string;
  creator?: string;
  createdAt: FirebaseFirestore.FieldValue;
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

// https://frontend-api-v3.pump.fun/coins/search?offset=0&limit=48&sort=created_timestamp&includeNsfw=true&order=DESC&searchTerm=GME&type=hybrid
(async () => {
  // ←— Change this to whatever look-back window you want (in hours)
  const HOURS = 24;
  const LIMIT = 48; // fixed page size
  const ENDPOINT = "https://frontend-api-v3.pump.fun/coins";

  const cutoff = Date.now() - HOURS * 3600 * 1000;

  let offset = 0;
  const found: PumpFunCoin[] = [];

  console.log(`🔍 Looking for …GME tokens minted in the last ${HOURS}h`);
  while (true) {
    console.log(`  → fetching offset=${offset}`);
    const res = await fetch(
      `${ENDPOINT}?offset=${offset}&limit=${LIMIT}` +
        `&sort=created_timestamp&order=DESC&includeNsfw=true&searchTerm=GME&type=hybrid`
    );
    if (!res.ok) {
      console.error("HTTP error", res.status, await res.text());
      break;
    }

    const page = (await res.json()) as PumpFunCoin[];
    console.log(`    • got ${page.length} items`);

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
      console.log("    ⏹ reached items older than cutoff, stopping");
      break;
    }

    offset += LIMIT;
  }

  console.log(`\n✅ Found ${found.length} …GME tokens in the last ${HOURS}h:`);
  console.table(
    found.map((c) => ({
      mint: c.mint,
      symbol: c.symbol,
      name: c.name,
      created: new Date(c.created_timestamp).toLocaleString(),
    }))
  );
  for (const coin of found) {
    console.log(
      `→ ${coin.symbol} (${coin.name}) at ${coin.mint} created ` +
        `${new Date(coin.created_timestamp).toLocaleString()}`
    );

    const mintAddr = coin.mint;
    const ref = db.collection("Tokens").doc(mintAddr);
    if ((await ref.get()).exists) {
      console.log(`    ⏩ [SKIP] ${coin.symbol}@${mintAddr} already indexed`);
      continue;
    }

    const payload: UpdateData<Token> = {
      name: coin.name,
      symbol: coin.symbol,
      mintAddress: mintAddr,
      createdAt: FieldValue.serverTimestamp(),
    };

    await ref.create(payload);
  }
})();
