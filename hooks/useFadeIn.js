"use client";

import { useEffect, useState } from "react";

export default function useFadeIn() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay mínimo para permitir que Tailwind detecte el cambio de clase
    const t = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return isVisible;
}
