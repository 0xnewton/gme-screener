import * as admin from "firebase-admin";
import { Connection, Keypair } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { PumpFunSDK } from "pumpdotfun-sdk";
import http from "http";
import { Token } from "./types";
import { FieldValue, UpdateData } from "firebase-admin/firestore";
import { db, functions } from "./firebase";

const REFRESH_METRICS_QUEUE_NAME = "refreshMetrics";

const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");
const wallet = Keypair.generate(); // replace with your funded keypair
const provider = new AnchorProvider(connection, new Wallet(wallet), {
  commitment: "confirmed",
});
const sdk = new PumpFunSDK(provider);
const queue = functions.taskQueue(REFRESH_METRICS_QUEUE_NAME);

const main = async () => {
  console.log("starting to listen...");
  // listen for every “createEvent” from Pump.fun
  sdk.addEventListener("createEvent", async (ev) => {
    try {
      const mintAddr = ev.mint.toBase58();
      console.log(`New event: ${ev.name} (${ev.symbol}) at ${mintAddr}`);
      if (!mintAddr.endsWith("GME")) return;
      const payload: UpdateData<Token> = {
        name: ev.name,
        symbol: ev.symbol,
        mintAddress: mintAddr,
        creator: ev.user.toBase58(),
        createdAt: FieldValue.serverTimestamp(),
      };
      const ref = db.collection("Tokens").doc(mintAddr);
      const existing = await ref.get();
      if (existing.exists) {
        console.log(`Token ${mintAddr} already exists, skipping...`);
        return;
      }
      await db.collection("Tokens").doc(mintAddr).create(payload);
      // Enqueue a task to refresh metrics for this token
      await queue.enqueue({
        tokenMint: mintAddr,
      });

      console.log(`→ indexed ${ev.symbol} @ ${mintAddr}`);
    } catch (err: any) {
      console.error("Error processing event:", err?.message);
    }
  });
};

main();

// Then start a minimal HTTP server so Cloud Run’s health check passes:
const port = parseInt(process.env.PORT ?? "8080", 10);
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
  })
  .listen(port, () => {
    console.log(`✅ Health-check server listening on port ${port}`);
  });
