"use client";
import { useEffect, useState } from "react";

// All timestamps are shown in Africa/Lagos (WAT, UTC+1) and stored as UTC ISO.
// Using explicit timeZone ensures server (UTC) and client (local) render identically,
// preventing hydration mismatches like "09:11" vs "10:11".

function fmt(date: string | Date, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", ...opts }).format(new Date(date));
}

export function fmtNoteCard(date: string | Date) {
  const d = new Date(date);
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Africa/Lagos" }).format(d).toUpperCase();
  const day = fmt(date, { day: "numeric" });
  const month = fmt(date, { month: "short" }).toUpperCase();
  const time = fmt(date, { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${weekday} ${day} ${month} · ${time}`;
}

export function fmtEntryTime(date: string | Date) {
  const day = fmt(date, { day: "numeric" });
  const month = fmt(date, { month: "short" });
  const time = fmt(date, { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day} ${month} ${time}`;
}

export function fmtGroupHeader(date: string | Date) {
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "Africa/Lagos" }).format(new Date(date));
  const day = fmt(date, { day: "numeric" });
  const month = fmt(date, { month: "long" });
  const year = fmt(date, { year: "numeric" });
  return `${weekday}, ${day} ${month} ${year}`;
}

export function fmtShort(date: string | Date) {
  return fmt(date, { day: "numeric", month: "short" });
}

export function fmtTime12(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Lagos", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(date));
}

export function fmtTime24(date: string | Date) {
  return fmt(date, { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function fmtFull(date: string | Date) {
  const day = fmt(date, { day: "numeric", month: "short" });
  const time = fmtTime12(date);
  return `${day} · ${time}`;
}

// Client-only wrapper to avoid hydration mismatch on mount-sensitive dates.
// Falls back to Lagos-formatted string immediately (so server/client match via timeZone),
// but also handles "now" values that move every second.
import React from "react";

export function ClientDate({ date, formatter, fallback }: { date?: string | Date; formatter: (d: string | Date) => string; fallback?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted && fallback) return React.createElement("span", { suppressHydrationWarning: true }, fallback);
  if (!date) return null;
  // Always format in Lagos timeZone so server+client agree
  try {
    return React.createElement("span", { suppressHydrationWarning: true }, formatter(date));
  } catch {
    return React.createElement("span", { suppressHydrationWarning: true }, String(date));
  }
}

// Simple hook for "now" comparisons (Today counts, overdue)
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
