// src/features/shops/screens/ShopMiniList.tsx
// A short list of shops in a card (Home's "Needs a call", "Ending this week", "Gone quiet"). Each row opens the shop.
import { Link } from 'react-router-dom';
import type { ShopRow } from '../../../core/types/adminTypes';
import { t } from '../../../text/portalText';
import { formatDate, relativeDay } from '../../../core/rules/formatRules';
import { PlanBadge } from '../../../ui/components/planBadge';

type Props = { title: string; hint: string; total: number; shops: ShopRow[]; empty: string; show: 'end' | 'lastSale' };

export function ShopMiniList({ title, hint, total, shops, empty, show }: Props) {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <div className="card-title">{title} {total > 0 ? <span className="muted num">({total})</span> : null}</div>
          <div className="caption">{hint}</div>
        </div>
      </div>
      {shops.length === 0 ? <div className="empty">{empty}</div> : (
        <div className="list">
          {shops.map((s) => (
            <Link key={s.id} to={`/shops/${s.id}`} className="list-item">
              <div style={{ minWidth: 0 }}>
                <div className="cell-main ellipsis">{s.name}</div>
                <div className="cell-sub ellipsis">{s.owner?.name || s.owner?.email || t('shops.noOwner')}</div>
              </div>
              <div style={{ textAlign: 'right', flex: 'none' }}>
                <PlanBadge bucket={s.bucket} />
                <div className="cell-sub">
                  {show === 'end'
                    ? (s.expiresAt ? `${formatDate(s.expiresAt)} · ${relativeDay(s.expiresAt)}` : '')
                    : (s.lastSaleAt ? t('shops.lastSale', { when: relativeDay(s.lastSaleAt) }) : t('shops.noSales'))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {total > shops.length ? <div className="caption" style={{ padding: '10px var(--s-l)' }}>{t('home.andMore', { n: total - shops.length })}</div> : null}
    </section>
  );
}
