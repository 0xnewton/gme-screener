import { orderBy, query } from "firebase/firestore";
import { Token } from "../lib/types";
import { getTokenCollectionRef } from "../api/refs";
import { useSnapshot } from "./useSnapshot";
import { useMemo } from "react";

export const useTokens = () => {
  const q = useMemo(() => {
    const col = getTokenCollectionRef();
    return query(col, orderBy("marketCapUsd", "desc"));
  }, []);
  return useSnapshot<Token>(q);
};
