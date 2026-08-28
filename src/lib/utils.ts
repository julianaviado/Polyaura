/**
 * Small pure helpers: class merging, ids, formatting, and title derivation.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const SIZE_UNITS = ["B", "KB", "MB", "GB"];

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    SIZE_UNITS.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const decimals = exponent === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${SIZE_UNITS[exponent]}`;
}

export function fileKind(name: string) {
  const ext = name.split(".").pop();
  if (!ext || ext === name) return "FILE";
  return ext.slice(0, 4).toUpperCase();
}

/** Groups conversations into the buckets the sidebar renders. */
export function relativeBucket(timestamp: number, now = Date.now()) {
  const day = 86_400_000;
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  if (timestamp >= startOfToday) return "Today";
  if (timestamp >= startOfToday - day) return "Yesterday";
  if (timestamp >= startOfToday - 7 * day) return "Previous 7 days";
  if (timestamp >= startOfToday - 30 * day) return "Previous 30 days";
  return "Older";
}

export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Derives a conversation title from the first thing the user said. */
export function titleFromText(text: string) {
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/^[`"'\s]+/, "")
    .trim();
  if (!cleaned) return "New chat";
  const clipped =
    cleaned.length > 48 ? `${cleaned.slice(0, 48).trim()}…` : cleaned;
  return clipped.charAt(0).toUpperCase() + clipped.slice(1);
}
