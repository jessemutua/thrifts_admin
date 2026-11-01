// src/core/rules/formatRules.ts
// How money, dates and times are written in the portal. Always Kenya time (UTC+3, no daylight saving).
// Pure: imports nothing, so tests/portalRulesCheck.mjs can run it with plain Node.

const KENYA_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function kenyaParts(instant: Date) {
  const s = new Date(instant.getTime() + KENYA_OFFSET_MS);
  return { y: s.getUTCFullYear(), m: s.getUTCMonth(), d: s.getUTCDate(), h: s.getUTCHours(), min: s.getUTCMinutes() };
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

// 12500 -> "KES 12,500"
export function formatKes(amount: number | null | undefined): string {
  const n = Math.round(Number(amount) || 0);
  return `KES ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// 1234 -> "1,234"
export function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '–';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// "14 Nov 2026" (Kenya date). Empty text for no date.
export function formatDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return '';
  const p = kenyaParts(d);
  return `${p.d} ${MONTHS[p.m]} ${p.y}`;
}

// "14 Nov, 09:05" (Kenya time)
export function formatDateTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return '';
  const p = kenyaParts(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.d} ${MONTHS[p.m]}, ${pad(p.h)}:${pad(p.min)}`;
}

// "2026-11-14" for a day chart label -> "14 Nov"
export function formatDayLabel(date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return date;
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]}`;
}

// Whole Kenya calendar days from now to the instant (negative = in the past)
export function kenyaDaysFromNow(value: string | Date | null | undefined, now: Date = new Date()): number | null {
  const d = toDate(value);
  if (!d) return null;
  const a = kenyaParts(now);
  const b = kenyaParts(d);
  return Math.round((Date.UTC(b.y, b.m, b.d) - Date.UTC(a.y, a.m, a.d)) / DAY_MS);
}

// "today", "yesterday", "5 days ago", "in 3 days", "tomorrow"
export function relativeDay(value: string | Date | null | undefined, now: Date = new Date()): string {
  const days = kenyaDaysFromNow(value, now);
  if (days === null) return '';
  if (days === 0) return 'today';
  if (days === -1) return 'yesterday';
  if (days === 1) return 'tomorrow';
  return days < 0 ? `${-days} days ago` : `in ${days} days`;
}

// Today's Kenya date as "YYYY-MM-DD", or `addDays` later. What a date input needs.
export function kenyaDateInput(now: Date = new Date(), addDays = 0): string {
  const p = kenyaParts(new Date(now.getTime() + addDays * DAY_MS));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.y}-${pad(p.m + 1)}-${pad(p.d)}`;
}
