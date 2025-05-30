import { useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from "firebase/auth";

export const useAnonymousAuth = (): {
  user: User | null;
  loading: boolean;
  error: Error | null;
} => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in
          setUser(firebaseUser);
          setLoading(false);
        } else {
          // User is signed out, sign in anonymously
          signInAnonymously(auth)
            .then((result) => {
              // User signed in anonymously
              setUser(result.user);
              setLoading(false);
            })
            .catch((err) => {
              console.error("Error signing in anonymously:", err);
              setError(err);
              setLoading(false);
            });
        }
      },
      (err) => {
        console.error("Authentication error:", err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return { user, loading, error };
};
