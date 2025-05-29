import "dotenv/config";
// import * as admin from 'firebase-admin';
import { Connection, Keypair } from "@solana/web3.js";
// import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
// import NodeWallet from '@coral-xyz/anchor/nodewallet';
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { PumpFunSDK } from "pumpdotfun-sdk";

// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });
// const db = admin.firestore();

// const RPC_URL = process.env.SOLANA_RPC_URL!;
// const PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
// const connection = new Connection(RPC_URL, 'confirmed');

const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");
const wallet = Keypair.generate(); // replace with your funded keypair
const provider = new AnchorProvider(connection, new Wallet(wallet), {
  commitment: "confirmed",
});
const sdk = new PumpFunSDK(provider);

const main = async () => {
  console.log("starting to listen...");
  // listen for every “createEvent” from Pump.fun
  sdk.addEventListener("createEvent", async (ev) => {
    const mintAddr = ev.mint.toBase58();
    console.log(`New event: ${ev.name} (${ev.symbol}) at ${mintAddr}`);
    if (!mintAddr.endsWith("GME")) return;

    // await db
    //   .collection('pumpfun_tokens')
    //   .doc(mintAddr)
    //   .set({
    //     name:        ev.name,
    //     symbol:      ev.symbol,
    //     mintAddress: mintAddr,
    //     creator:     ev.creator.toBase58(),
    //     createdAt:   admin.firestore.FieldValue.serverTimestamp(),
    //   }, { merge: true });

    console.log(`→ indexed ${ev.symbol} @ ${mintAddr}`);
  });
};

main();
