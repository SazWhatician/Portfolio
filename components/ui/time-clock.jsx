"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Clock, Sparkles, Sun, Moon, Sunrise, Sunset, Radio } from "lucide-react";

/**
 * Atmospheric Theme Definitions
 */
export const THEME_CONFIG = {
  morning: {
    id: "morning",
    name: "Morning",
    label: "Dawn Mist",
    icon: Sunrise,
    emoji: "🌅",
    hoursText: "05:00 – 11:59",
    dotColor: "bg-amber-400",
    badgeBg: "bg-amber-500/10 text-amber-900 border-amber-300/40",
  },
  afternoon: {
    id: "afternoon",
    name: "Afternoon",
    label: "High Noon",
    icon: Sun,
    emoji: "☀️",
    hoursText: "12:00 – 16:59",
    dotColor: "bg-sky-400",
    badgeBg: "bg-sky-500/10 text-sky-900 border-sky-300/40",
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    label: "Golden Hour",
    icon: Sunset,
    emoji: "🌇",
    hoursText: "17:00 – 19:59",
    dotColor: "bg-rose-400",
    badgeBg: "bg-rose-500/10 text-rose-900 border-rose-300/40",
  },
  night: {
    id: "night",
    name: "Night",
    label: "Starlit Aurora",
    icon: Moon,
    emoji: "🌙",
    hoursText: "20:00 – 04:59",
    dotColor: "bg-indigo-400",
    badgeBg: "bg-indigo-500/10 text-indigo-900 border-indigo-300/40",
  },
};

/**
 * Determine theme based on current system hour
 */
export function getSystemTimeTheme(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "sunset";
  return "night";
}

/**
 * TimeClock Component
 * Visual clock HUD is completely hidden per user preference,
 * while real-world time-based atmospheric lighting effects remain 100% active.
 */
export default function TimeClock({
  mode = "auto",
  resolvedTheme = "sunset",
  onModeChange,
}) {
  return null;
}
