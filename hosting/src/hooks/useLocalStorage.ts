import { useState, useEffect } from "react";

const getStorageValue = <T>(key: string, defaultValue: T): T => {
  // getting stored value
  const saved = localStorage.getItem(key);
  if (!saved) {
    return defaultValue;
  }
  try {
    const initial = JSON.parse(saved) as T;
    return initial || defaultValue;
  } catch (e: unknown) {
    console.error(e);
    return defaultValue;
  }
};

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
