import { db } from "../firebase";
import { createToken } from "./converters";

export const getTokenCollectionRef = () => db.collection("Tokens").withConverter(createToken);
export const getTokenRef = (id?: string) => {
  const collectionRef = getTokenCollectionRef();
  return id ? collectionRef.doc(id) : collectionRef.doc();
};
