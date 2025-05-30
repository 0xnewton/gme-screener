// src/hooks/useSnapshot.ts
import { useState, useEffect } from "react";
import {
  onSnapshot,
  Query,
  QuerySnapshot,
  DocumentData,
  FirestoreError,
} from "firebase/firestore";

export interface SnapshotState<T> {
  data: T[];
  loading: boolean;
  error: FirestoreError | null;
}

export const useSnapshot = <T = DocumentData>(
  q: Query<T>
): SnapshotState<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      q,
      (snap: QuerySnapshot<T>) => {
        const docs = snap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
        );
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore onSnapshot error", err);
        setError(err);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [q]);

  return { data, loading, error };
};
