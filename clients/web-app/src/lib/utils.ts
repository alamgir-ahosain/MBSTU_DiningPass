import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime12(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function isBookingOpen(config: { mealDate: string; cutTokenBefore: string }): boolean {
  const now = new Date();

  // ✅ Parse as LOCAL time by replacing the date separator so the browser
  // treats it as a local datetime, not UTC.
  // "2026-06-20T10:00:00" → parsed as UTC (wrong for UTC+6 users)
  // Using Date parts directly → always local time (correct)
  const [year, month, day] = config.mealDate.split("-").map(Number);
  const [hour, minute] = config.cutTokenBefore.split(":").map(Number);
  const cutoff = new Date(year, month - 1, day, hour, minute, 0);

  return now < cutoff;
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}
