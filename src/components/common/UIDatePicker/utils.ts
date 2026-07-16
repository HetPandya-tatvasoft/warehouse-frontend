import type { Matcher } from "react-day-picker";

// Build disabled matcher from min/max/custom
export function buildDisabledMatcher({
  minDate,
  maxDate,
  disabledDates,
}: {
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Matcher | Matcher[];
}): Matcher[] {
  const matchers: Matcher[] = [];

  if (minDate) {
    matchers.push({ before: minDate });
  }
  if (maxDate) {
    matchers.push({ after: maxDate });
  }
  if (disabledDates) {
    if (Array.isArray(disabledDates)) {
      matchers.push(...disabledDates);
    } else {
      matchers.push(disabledDates);
    }
  }

  return matchers;
}

// Merge date + time into a single Date
export function mergeDateAndTime(
  date: Date,
  time: { hours: number; minutes: number; seconds: number }
): Date {
  const merged = new Date(date);
  merged.setHours(time.hours, time.minutes, time.seconds, 0);
  return merged;
}

// Extract time parts from a Date
export function extractTime(date?: Date) {
  if (!date) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}

// Generate array of numbers for time selects
export function range(count: number, step = 1): number[] {
  return Array.from({ length: Math.ceil(count / step) }, (_, i) => i * step);
}

// Pad number to 2 digits — "5" → "05"
export function pad2(num: number): string {
  return num.toString().padStart(2, "0");
}
