import { useEffect, useState } from "react";

export type WindowSizeSize = "mobile" | "tablet" | "desktop";

export function useWindowSize(): WindowSizeSize {
  const [category, setCategory] = useState<WindowSizeSize>("mobile");

  useEffect(() => {
    const getCategory = (width: number): WindowSizeSize => {
      if (width < 768) return "mobile";
      if (width < 1024) return "tablet";
      return "desktop";
    };

    const updateCategory = () => {
      setCategory(getCategory(window.innerWidth));
    };

    updateCategory(); // Initial check

    window.addEventListener("resize", updateCategory);
    return () => window.removeEventListener("resize", updateCategory);
  }, []);

  return category;
}
