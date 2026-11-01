// src/ui/components/statTile.tsx
// One number on the Home screen: a label, the number, and a short line under it. "alert" turns the number amber.
// When `to` is given the tile is a link (e.g. "Needs a call" opens the shop list filtered to those shops).
import { Link } from 'react-router-dom';

type Props = { label: string; value: string; foot?: string; alert?: boolean; to?: string };

export function StatTile({ label, value, foot, alert, to }: Props) {
  const body = (
    <>
      <span className="tile-label">{label}</span>
      <span className="tile-value">{value}</span>
      {foot ? <span className="tile-foot">{foot}</span> : null}
    </>
  );
  const cls = `card tile${alert ? ' alert' : ''}`;
  if (to) return <Link to={to} className={cls} style={{ color: 'inherit', textDecoration: 'none' }}>{body}</Link>;
  return <div className={cls}>{body}</div>;
}
