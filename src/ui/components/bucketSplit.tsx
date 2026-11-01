// src/ui/components/bucketSplit.tsx
// One bar split into the plan groups (how many shops are on pilot, paid, overdue...), with a clickable key under it.
import { Link } from 'react-router-dom';
import { BUCKET_ORDER, bucketLabel, bucketTone } from '../../core/rules/planRules';

export function BucketSplit({ counts }: { counts: Record<string, number> }) {
  const total = BUCKET_ORDER.reduce((n, b) => n + (counts[b] || 0), 0);
  const shown = BUCKET_ORDER.filter((b) => (counts[b] || 0) > 0);
  return (
    <div className="stack-s">
      <div className="split">
        {shown.map((b) => (
          <span key={b} className={`dot-${bucketTone(b)}`} style={{ width: `${((counts[b] || 0) / Math.max(1, total)) * 100}%` }} />
        ))}
      </div>
      <div className="legend">
        {shown.map((b) => (
          <Link key={b} to={`/shops?bucket=${b}`} style={{ color: 'inherit' }}>
            <i className={`dot-${bucketTone(b)}`} />{bucketLabel(b)} <b className="num">{counts[b]}</b>
          </Link>
        ))}
      </div>
    </div>
  );
}
