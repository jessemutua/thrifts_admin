// src/features/online/screens/OnlineStoresScreen.tsx
// Merchants' online stores (their public store pages): how many are live, how many visits they get, where shoppers
// come from, and the busiest stores and products. Reach, not revenue: online orders come with the WhatsApp flow.
// Drawing only: data from useOnlineStores.
import { Link } from 'react-router-dom';
import { t } from '../../../text/portalText';
import { formatCount, formatDateTime, formatKes } from '../../../core/rules/formatRules';
import { growthText } from '../../../core/rules/metricsSummary';
import { PageHead } from '../../../ui/components/portalShell';
import { StatTile } from '../../../ui/components/statTile';
import { SalesBars } from '../../../ui/components/salesBars';
import { ShareBars } from '../../../ui/components/shareBars';
import { EmptyNote, ErrorNote, LoadingNote } from '../../../ui/components/stateNotes';
import { RefreshIcon } from '../../../ui/components/portalIcons';
import { genderLabel, sourceLabel, useOnlineStores } from '../hooks/useOnlineStores';

export function OnlineStoresScreen() {
  const { data: o, error, loading, reload } = useOnlineStores();
  return (
    <>
      <PageHead title={t('online.title')} sub={o ? t('online.sub', { time: formatDateTime(o.generatedAt) }) : undefined}>
        <button className="btn" onClick={reload} disabled={loading}><RefreshIcon />{t('common.refresh')}</button>
      </PageHead>
      {error ? <ErrorNote message={error} onRetry={reload} /> : null}
      {!o && loading ? <LoadingNote /> : null}
      {o ? (
        <div className="stack" style={{ opacity: loading ? 0.7 : 1 }}>
          <div className="grid-tiles">
            <StatTile label={t('online.live')} value={`${formatCount(o.stores.live)} / ${formatCount(o.stores.total)}`}
              foot={t('online.liveFoot', { n: formatCount(o.stores.withPage) })} />
            <StatTile label={t('online.products')} value={formatCount(o.products.published)} foot={t('online.productsFoot')} />
            <StatTile label={t('online.visits')} value={formatCount(o.visits.last30)}
              foot={o.visits.growthPct === null ? t('online.noVisitsBefore') : growthText(o.visits.growthPct)}
              alert={o.visits.growthPct !== null && o.visits.growthPct < 0} />
            <StatTile label={t('online.storesVisited')} value={formatCount(o.visits.storesVisited)}
              foot={t('online.pagesSplit', { store: formatCount(o.visits.storePages), product: formatCount(o.visits.productPages) })} />
          </div>

          <div className="grid-2">
            <section className="card">
              <div className="card-head"><span className="card-title">{t('online.dailyTitle')}</span></div>
              <div className="card-body">
                <SalesBars days={o.visits.daily.map((d) => ({ date: d.date, count: d.count, total: d.count }))}
                  describe={(d) => t('online.dayVisits', { n: formatCount(d.count) })} />
              </div>
            </section>
            <section className="card">
              <div className="card-head"><span className="card-title">{t('online.sourcesTitle')}</span><span className="caption">{t('online.last30')}</span></div>
              <div className="card-body">
                {o.sources.length === 0 ? <EmptyNote>{t('online.noVisits')}</EmptyNote> : <ShareBars rows={o.sources} label={sourceLabel} />}
              </div>
            </section>
          </div>

          <div className="grid-2">
            <section className="card">
              <div className="card-head"><span className="card-title">{t('online.topStores')}</span><span className="caption">{t('online.last30')}</span></div>
              {o.topStores.length === 0 ? <EmptyNote>{t('online.noVisits')}</EmptyNote> : (
                <div className="list">
                  {o.topStores.map((s) => (
                    <Link key={s.id} to={`/shops/${s.id}`} className="list-item">
                      <div style={{ minWidth: 0 }}>
                        <div className="cell-main ellipsis">{s.name}</div>
                        <div className="cell-sub">{t('online.storeProducts', { n: formatCount(s.published) })}</div>
                      </div>
                      <span className="num" style={{ fontWeight: 600 }}>{t('online.visitsN', { n: formatCount(s.visits) })}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
            <section className="card">
              <div className="card-head"><span className="card-title">{t('online.topProducts')}</span><span className="caption">{t('online.last30')}</span></div>
              {o.topProducts.length === 0 ? <EmptyNote>{t('online.noProductVisits')}</EmptyNote> : (
                <div className="list">
                  {o.topProducts.map((p) => (
                    <Link key={p.id} to={`/shops/${p.shop.id}`} className="list-item">
                      <div className="row" style={{ minWidth: 0, gap: 12 }}>
                        {p.imageUrl ? <img src={p.imageUrl} alt="" width={36} height={36} style={{ borderRadius: 8, objectFit: 'cover', flex: 'none' }} /> : null}
                        <div style={{ minWidth: 0 }}>
                          <div className="cell-main ellipsis">{p.name}</div>
                          <div className="cell-sub ellipsis">{p.shop.name} · {formatKes(p.priceKes)}</div>
                        </div>
                      </div>
                      <span className="num" style={{ fontWeight: 600 }}>{t('online.visitsN', { n: formatCount(p.visits) })}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="grid-2">
            <section className="card">
              <div className="card-head"><span className="card-title">{t('online.gendersTitle')}</span><span className="caption">{t('online.gendersHint')}</span></div>
              <div className="card-body">
                {o.genders.length === 0 ? <EmptyNote>{t('online.noProductVisits')}</EmptyNote> : <ShareBars rows={o.genders} label={genderLabel} />}
              </div>
            </section>
            <section className="card card-pad stack-s">
              <div className="card-title">{t('online.channelTitle')}</div>
              <dl className="kv">
                <dt>{t('channel.shop')}</dt><dd className="num">{formatCount(o.stores.channel.shop)}</dd>
                <dt>{t('channel.online')}</dt><dd className="num">{formatCount(o.stores.channel.online)}</dd>
                <dt>{t('channel.both')}</dt><dd className="num">{formatCount(o.stores.channel.both)}</dd>
              </dl>
              <p className="caption" style={{ margin: 0 }}>{t('online.honest')}</p>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}
