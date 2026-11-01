// src/ui/components/monthBars.tsx
// Bars for the last few months (Metrics page). The current month is drawn lighter: it is not finished yet.
import { formatKes } from '../../core/rules/formatRules';

type Month = { month: string; label: string; gmvKes: number; sales: number };

export function MonthBars({ months }: { months: Month[] }) {
  const max = Math.max(1, ...months.map((m) => m.gmvKes));
  return (
    <div className="bars" role="img" aria-label="Sales value by month">
      {months.map((m, i) => (
        <div className="bar-col" key={m.month} title={`${m.label}: ${formatKes(m.gmvKes)} from ${m.sales} sales`}>
          <span className="bar-label num">{m.gmvKes ? formatKes(m.gmvKes).replace('KES ', '') : ''}</span>
          <div className={`bar${m.gmvKes === 0 ? ' zero' : ''}`}
            style={{ height: `${Math.max(2, (m.gmvKes / max) * 100)}%`, maxWidth: 56, opacity: i === months.length - 1 ? 0.55 : 1 }} />
          <span className="bar-label">{m.label.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}
