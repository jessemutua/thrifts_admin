// src/core/rules/planRules.ts
// What each plan group means in the portal: its label, its colour tone, and which groups need Chief to act.
// The server decides the group (reja adminActivityRules.js); this only says how to show it.
// Pure: imports nothing, so tests/portalRulesCheck.mjs can run it with plain Node.

export type BucketKey = 'pilot' | 'paid' | 'grace' | 'pilot_ended' | 'overdue' | 'not_started' | 'suspended';
export type Tone = 'success' | 'accent' | 'warning' | 'danger' | 'muted';

export const BUCKET_ORDER: BucketKey[] = ['pilot', 'paid', 'grace', 'pilot_ended', 'overdue', 'not_started', 'suspended'];

const LABELS: Record<BucketKey, string> = {
  pilot: 'On pilot',
  paid: 'Paid',
  grace: 'Grace days',
  pilot_ended: 'Pilot ended',
  overdue: 'Overdue',
  not_started: 'Not started',
  suspended: 'Suspended',
};

const TONES: Record<BucketKey, Tone> = {
  pilot: 'accent',
  paid: 'success',
  grace: 'warning',
  pilot_ended: 'warning',
  overdue: 'danger',
  not_started: 'muted',
  suspended: 'danger',
};

export function bucketLabel(bucket: string): string {
  return (LABELS as Record<string, string>)[bucket] ?? bucket;
}

export function bucketTone(bucket: string): Tone {
  return (TONES as Record<string, Tone>)[bucket] ?? 'muted';
}

export function isBucket(value: string | null | undefined): value is BucketKey {
  return !!value && (BUCKET_ORDER as string[]).includes(value);
}

// Groups that are money Chief is waiting for: a call to make
export function needsCall(bucket: string): boolean {
  return bucket === 'grace' || bucket === 'pilot_ended' || bucket === 'overdue';
}

// The words under a shop's plan badge: "ends 14 Nov (in 3 days)", "ended 2 Oct", or nothing
export function planEndText(expiresAt: string | null, bucket: string, formatDate: (v: string) => string, relative: (v: string) => string): string {
  if (!expiresAt || bucket === 'not_started') return '';
  const ended = new Date(expiresAt).getTime() <= Date.now();
  return ended ? `ended ${formatDate(expiresAt)}` : `ends ${formatDate(expiresAt)} (${relative(expiresAt)})`;
}

// A plan-history row in one line: what happened
export function describeChange(c: { source: string; newStatus: string; oldStatus: string | null; note: string | null }): string {
  if (c.source === 'manual') return 'Payment recorded';
  if (c.source === 'trial') return c.note && c.note.startsWith('pilot until') ? 'Pilot set' : 'Free month started';
  if (c.source === 'admin') return c.newStatus === 'suspended' ? 'Suspended' : 'Suspension lifted';
  if (c.source === 'system') return c.newStatus === 'expired' ? 'Plan ran out' : 'Changed by the system';
  return `Changed (${c.source})`;
}

// M-Pesa codes are 10 letters and digits. Lenient: 2 to 100 like the server, but warn when it does not look like one.
export function looksLikeMpesaCode(code: string): boolean {
  return /^[A-Z0-9]{10}$/.test(code.trim().toUpperCase());
}
