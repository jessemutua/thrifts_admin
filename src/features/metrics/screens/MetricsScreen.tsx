// src/features/metrics/screens/MetricsScreen.tsx
// The numbers an investor asks for, across real merchants (test and deleted shops left out): stock on the platform,
// products, sales processed and their growth, and the last 6 months. Drawing only: data from useMetrics.
import { t } from '../../../text/portalText';
import { formatCount, formatDateTime, formatKes } from '../../../core/rules/formatRules';
import { growthText } from '../../../core/rules/metricsSummary';
import { PageHead } from '../../../ui/components/portalShell';
import { StatTile } from '../../../ui/components/statTile';
import { MonthBars } from '../../../ui/components/monthBars';
import { ErrorNote, LoadingNote } from '../../../ui/components/stateNotes';
import { CopyIcon, RefreshIcon } from '../../../ui/components/portalIcons';
import { useMetrics } from '../hooks/useMetrics';

export function MetricsScreen() {
  const { data: m, error, loading, reload, copySummary, copied } = useMetrics();
  return (
    <>
      <PageHead title={t('metrics.title')} sub={m ? t('metrics.sub', { time: formatDateTime(m.generatedAt) }) : t('metrics.subEmpty')}>
        <button className="btn" onClick={reload} disabled={loading}><RefreshIcon />{t('common.refresh')}</button>
        <button className="btn primary" onClick={() => void copySummary()} disabled={!m}><CopyIcon />{copied ? t('metrics.copied') : t('metrics.copy')}</button>
      </PageHead>
      {error ? <ErrorNote message={error} onRetry={reload} /> : null}
      {!m && loading ? <LoadingNote /> : null}
      {m ? (
        <div className="stack" style={{ opacity: loading ? 0.7 : 1 }}>
          <h2 className="card-title">{t('metrics.inventory')}</h2>
          <div className="grid-tiles">
            <StatTile label={t('metrics.stockValue')} value={formatKes(m.stock.valueKes)}
              foot={t('metrics.stockValueFoot', { n: formatCount(m.stock.shopsWithStock) })} />
            <StatTile label={t('metrics.stockCost')} value={formatKes(m.stock.costKes)}
              foot={m.stock.costCoversAll ? t('metrics.costAll') : t('metrics.costPart', { n: formatCount(m.stock.itemsWithoutCost) })} />
            <StatTile label={t('metrics.products')} value={formatCount(m.products.live)}
              foot={t('metrics.productsFoot', { inStock: formatCount(m.products.inStock), out: formatCount(m.products.outOfStock) })} />
            <StatTile label={t('metrics.units')} value={formatCount(m.stock.units)}
              foot={t('metrics.avgStock', { value: formatKes(m.stock.avgValuePerShopKes) })} />
          </div>

          <h2 className="card-title" style={{ marginTop: 8 }}>{t('metrics.salesTitle')}</h2>
          <div className="grid-tiles">
            <StatTile label={t('metrics.gmvAll')} value={formatKes(m.sales.allTime.totalKes)}
              foot={t('metrics.gmvAllFoot', { n: formatCount(m.sales.allTime.count), avg: formatKes(m.sales.allTime.avgBasketKes) })} />
            <StatTile label={t('metrics.gmv30')} value={formatKes(m.sales.last30.totalKes)}
              foot={growthText(m.sales.growthPct)} alert={m.sales.growthPct !== null && m.sales.growthPct < 0} />
            <StatTile label={t('metrics.selling')} value={`${formatCount(m.merchants.sellingLast30Days)} / ${formatCount(m.merchants.stores)}`}
              foot={t('metrics.sellingFoot', { n: formatCount(m.merchants.everSold) })} />
            <StatTile label={t('metrics.mpesa')} value={m.sales.mpesaSharePct === null ? '–' : `${m.sales.mpesaSharePct}%`}
              foot={t('metrics.mpesaFoot', { cash: formatKes(m.sales.cash.totalKes) })} />
          </div>

          <section className="card">
            <div className="card-head">
              <span className="card-title">{t('metrics.monthsTitle')}</span>
              <span className="caption">{t('metrics.monthsHint')}</span>
            </div>
            <div className="card-body"><MonthBars months={m.monthly} /></div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>{t('metrics.colMonth')}</th><th>{t('metrics.colValue')}</th><th>{t('metrics.colSales')}</th><th>{t('metrics.colActive')}</th><th>{t('metrics.colNew')}</th></tr></thead>
                <tbody>
                  {[...m.monthly].reverse().map((row, i) => (
                    <tr key={row.month}>
                      <td className="cell-main">{row.label}{i === 0 ? <span className="caption"> {t('metrics.soFar')}</span> : null}</td>
                      <td className="num">{formatKes(row.gmvKes)}</td>
                      <td className="num">{formatCount(row.sales)}</td>
                      <td className="num">{formatCount(row.activeShops)}</td>
                      <td className="num">{formatCount(row.newShops)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card card-pad">
            <dl className="kv">
              <dt>{t('metrics.fullValue')}</dt><dd className="num">{formatKes(m.stock.fullValueKes)}</dd>
              <dt>{t('metrics.profit')}</dt><dd className="num">{formatKes(m.stock.profitKes)}</dd>
              <dt>{t('metrics.published')}</dt><dd className="num">{formatCount(m.products.onStorePages)}</dd>
              <dt>{t('metrics.visits')}</dt><dd className="num">{formatCount(m.storeVisitsLast30Days)}</dd>
            </dl>
            <p className="caption" style={{ margin: '12px 0 0' }}>{t('metrics.honest')}</p>
          </section>
        </div>
      ) : null}
    </>
  );
}
