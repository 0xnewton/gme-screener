import { FirestoreDataConverter } from "firebase/firestore";
import { Token } from "./types";

export const tokenConverter: FirestoreDataConverter<Token> = {
  toFirestore: (token) => ({
    ...token,
    // createdAt & updatedAt should already be Timestamps
  }),
  fromFirestore: (snap) => snap.data() as Token,
};
