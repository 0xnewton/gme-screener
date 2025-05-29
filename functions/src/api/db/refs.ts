import { db } from "../firebase";

export const getTokenCollectionRef = () => db.collection("Tokens");
export const getTokenRef = (id?: string) => {
  const collectionRef = getTokenCollectionRef();
  return id ? collectionRef.doc(id) : collectionRef.doc();
};
