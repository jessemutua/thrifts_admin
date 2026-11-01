// src/ui/components/planBadge.tsx
// A shop's plan group as a coloured pill (On pilot, Paid, Overdue...). Labels and colours come from planRules.ts.
import { bucketLabel, bucketTone } from '../../core/rules/planRules';

export function PlanBadge({ bucket }: { bucket: string }) {
  return <span className={`badge tone-${bucketTone(bucket)}`}>{bucketLabel(bucket)}</span>;
}

// A plain pill for anything else (Owner, Paused, Admin...)
export function Pill({ children, tone }: { children: React.ReactNode; tone?: 'success' | 'accent' | 'warning' | 'danger' }) {
  return <span className={`badge plain${tone ? ` tone-${tone}` : ''}`}>{children}</span>;
}
