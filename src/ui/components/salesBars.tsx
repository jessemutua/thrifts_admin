// src/ui/components/salesBars.tsx
// A bar per day (Home's sales, Online Stores' visits). Hovering a bar shows the day's numbers. `describe` words the
// hover text; without it the bars are sales (money and count).
import { formatCount, formatDayLabel, formatKes } from '../../core/rules/formatRules';

type Day = { date: string; count: number; total: number };

export function SalesBars({ days, describe }: { days: Day[]; describe?: (d: Day) => string }) {
  const max = Math.max(1, ...days.map((d) => d.total));
  return (
    <div className="bars" role="img" aria-label={`The last ${days.length} days`}>
      {days.map((d, i) => (
        <div className="bar-col" key={d.date} title={describe ? `${formatDayLabel(d.date)}: ${describe(d)}` : `${formatDayLabel(d.date)}: ${formatKes(d.total)} from ${formatCount(d.count)} sales`}>
          <div className={`bar${d.total === 0 ? ' zero' : ''}`} style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }} />
          <span className="bar-label">{i % 2 === days.length % 2 ? formatDayLabel(d.date).split(' ')[0] : ' '}</span>
        </div>
      ))}
    </div>
  );
}
