import { collection, doc } from "firebase/firestore";
import { db } from "./firebase";
import { tokenConverter } from "../lib/converters";

export const getTokenCollectionRef = () =>
  collection(db, "Tokens").withConverter(tokenConverter);

export const getTokenRef = (id?: string) => {
  const collectionRef = getTokenCollectionRef();
  return id ? doc(collectionRef, id) : doc(collectionRef);
};
