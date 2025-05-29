import { FirestoreDataConverter } from "firebase-admin/firestore";
import { Token } from "../../types";

export const pumpFunTokenConverter: FirestoreDataConverter<Token> = {
  toFirestore: (token) => ({
    ...token,
    // createdAt & updatedAt should already be Timestamps
  }),
  fromFirestore: (snap) => snap.data() as Token,
};
