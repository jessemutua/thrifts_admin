// src/ui/components/shareBars.tsx
// A ranked list with a bar each: where shoppers come from, what they look at. Each row: name, bar, count and percent.
import { formatCount } from '../../core/rules/formatRules';

type Row = { key: string; count: number; pct: number | null };

export function ShareBars({ rows, label }: { rows: Row[]; label: (key: string) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="stack-s">
      {rows.map((r) => (
        <div key={r.key} className="share-row">
          <span className="ellipsis">{label(r.key)}</span>
          <span className="share-track"><span className="share-fill" style={{ width: `${(r.count / max) * 100}%` }} /></span>
          <span className="num caption" style={{ textAlign: 'right' }}>{formatCount(r.count)}{r.pct !== null ? ` · ${r.pct}%` : ''}</span>
        </div>
      ))}
    </div>
  );
}
