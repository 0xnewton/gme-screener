import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getFunctions } from "firebase-admin/functions";

const app = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export const functions = getFunctions(app);
export const db = getFirestore(app);
