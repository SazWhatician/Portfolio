"use client";

import { useState, useEffect, useCallback } from "react";
import { getSystemTimeTheme } from "@/components/ui/time-clock";
import { cozyAudio } from "@/lib/cozy-sound";

export function useThemeMode() {
  const [isNight, setIsNight] = useState(false);
  const [systemTheme, setSystemTheme] = useState("sunset");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const natural = getSystemTimeTheme();
    setSystemTheme(natural);

    const computeTheme = () => {
      try {
        const saved = sessionStorage.getItem("portfolio_theme_override");
        if (saved === "dark") return true;
        if (saved === "light") return false;
      } catch {}
      return natural === "night";
    };

    const initialNight = computeTheme();
    setIsNight(initialNight);
    setMounted(true);

    const onThemeChange = (e) => {
      if (e.detail && typeof e.detail.isNight === "boolean") {
        setIsNight(e.detail.isNight);
      }
    };

    window.addEventListener("portfolio-theme-change", onThemeChange);

    // Keep natural system theme updated periodically if user hasn't overridden
    const interval = setInterval(() => {
      const updatedNatural = getSystemTimeTheme();
      setSystemTheme(updatedNatural);
      try {
        const saved = sessionStorage.getItem("portfolio_theme_override");
        if (!saved) {
          setIsNight(updatedNatural === "night");
        }
      } catch {}
    }, 15000);

    return () => {
      window.removeEventListener("portfolio-theme-change", onThemeChange);
      clearInterval(interval);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setIsNight((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem("portfolio_theme_override", next ? "dark" : "light");
      } catch {}
      window.dispatchEvent(
        new CustomEvent("portfolio-theme-change", { detail: { isNight: next } })
      );
      try {
        cozyAudio.playSnap?.(next ? 4 : 2, 0.8);
      } catch {}
      return next;
    });
  }, []);

  return { isNight, toggleTheme, systemTheme, mounted };
}
