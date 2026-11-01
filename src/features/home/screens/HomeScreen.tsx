// src/features/home/screens/HomeScreen.tsx
// The first screen after signing in: one summary of every section, each card linking to the page with the detail
// (Metrics, Online stores, Shops, People, Feedback, App). Drawing only: the numbers come from useOverview.
import { Link } from 'react-router-dom';
import { t } from '../../../text/portalText';
import { formatCount, formatDateTime, formatKes } from '../../../core/rules/formatRules';
import { growthText } from '../../../core/rules/metricsSummary.ts';
import { PageHead } from '../../../ui/components/portalShell';
import { StatTile } from '../../../ui/components/statTile';
import { SalesBars } from '../../../ui/components/salesBars';
import { BucketSplit } from '../../../ui/components/bucketSplit';
import { SeeAllLink } from '../../../ui/components/seeAllLink';
import { ErrorNote, LoadingNote } from '../../../ui/components/stateNotes';
import { RefreshIcon } from '../../../ui/components/portalIcons';
import { ShopMiniList } from '../../shops/screens/ShopMiniList';
import { useOverview } from '../hooks/useOverview';

export function HomeScreen() {
  const { data, error, loading, reload, needCall, moodTotal } = useOverview();
  const o = data?.overview;
  const m = data?.metrics;
  const app = data?.app;
  const online = data?.online;

  return (
    <>
      <PageHead title={t('home.title')} sub={o ? t('home.updated', { time: formatDateTime(o.generatedAt) }) : undefined}>
        <button className="btn" onClick={reload} disabled={loading}><RefreshIcon />{t('common.refresh')}</button>
      </PageHead>

      {error ? <ErrorNote message={error} onRetry={reload} /> : null}
      {!o && loading ? <LoadingNote /> : null}

      {o ? (
        <div className="stack" style={{ opacity: loading ? 0.7 : 1 }}>
          <div className="grid-tiles">
            {m ? (
              <StatTile label={t('home.stockValue')} value={formatKes(m.stock.valueKes)} to="/metrics"
                foot={t('home.stockFoot', { units: formatCount(m.stock.units), products: formatCount(m.products.live) })} />
            ) : null}
            {m ? (
              <StatTile label={t('home.sales30')} value={formatKes(m.sales.last30.totalKes)} to="/metrics"
                foot={growthText(m.sales.growthPct)} alert={m.sales.growthPct !== null && m.sales.growthPct < 0} />
            ) : null}
            {online ? (
              <StatTile label={t('home.visits')} value={formatCount(online.visits.last30)} to="/online"
                foot={t('home.visitsFoot', { n: formatCount(online.stores.live) })} />
            ) : null}
            <StatTile label={t('home.shops')} value={formatCount(o.shops.total)} to="/shops"
              foot={t('home.shopsFoot', { week: o.shops.newThisWeek, branches: o.shops.branches })} />
            <StatTile label={t('home.needCall')} value={formatCount(needCall)} alert={needCall > 0}
              foot={t('home.needCallFoot')} to={o.shops.byBucket.pilot_ended ? '/shops?bucket=pilot_ended' : '/shops?bucket=overdue'} />
            <StatTile label={t('home.money')} value={formatKes(o.money.thisMonthKes)} to="/shops?bucket=paid"
              foot={o.money.estimatedPayments > 0
                ? t('home.moneyFootEstimated', { n: o.money.payments, e: o.money.estimatedPayments })
                : t('home.moneyFoot', { n: o.money.payments })} />
          </div>

          <div className="grid-2">
            <section className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">{t('home.salesTitle')}</div>
                  <div className="caption num">{t('home.salesFoot', { total: formatKes(o.sales.last7Days.totalKes), n: formatCount(o.sales.last7Days.count) })}</div>
                </div>
                <SeeAllLink to="/metrics" label={t('home.seeMetrics')} />
              </div>
              <div className="card-body">
                <SalesBars days={o.sales.daily} />
                <p className="caption" style={{ margin: '8px 0 0' }}>{t('home.selling', { n: o.shops.sellingLast7Days, total: o.shops.total + o.shops.branches })}</p>
              </div>
            </section>
            <section className="card">
              <div className="card-head">
                <span className="card-title">{t('home.plansTitle')}</span>
                <SeeAllLink to="/shops" label={t('home.seeShops')} />
              </div>
              <div className="card-body stack">
                <BucketSplit counts={o.shops.byBucket} />
                <dl className="kv">
                  <dt>{t('home.onPilot')}</dt><dd className="num">{formatCount(o.shops.byBucket.pilot)} <span className="muted">· {t('home.endingSoon', { n: o.lists.endingSoon.total })}</span></dd>
                  <dt>{t('home.paid')}</dt><dd className="num">{formatCount(o.shops.byBucket.paid)}</dd>
                  <dt>{t('home.notStartedLabel')}</dt><dd className="num">{formatCount(o.shops.byBucket.not_started)}</dd>
                </dl>
              </div>
            </section>
          </div>

          <div className="grid-3">
            <ShopMiniList title={t('home.listOverdue')} hint={t('home.listOverdueHint')} total={o.lists.overdue.total}
              shops={o.lists.overdue.shops} empty={t('home.listOverdueEmpty')} show="end" />
            <ShopMiniList title={t('home.listEnding')} hint={t('home.listEndingHint')} total={o.lists.endingSoon.total}
              shops={o.lists.endingSoon.shops} empty={t('home.listEndingEmpty')} show="end" />
            <ShopMiniList title={t('home.listQuiet')} hint={t('home.listQuietHint')} total={o.lists.quiet.total}
              shops={o.lists.quiet.shops} empty={t('home.listQuietEmpty')} show="lastSale" />
          </div>

          <div className="grid-3">
            <section className="card">
              <div className="card-head"><span className="card-title">{t('nav.people')}</span><SeeAllLink to="/people" label={t('home.seeAll')} /></div>
              <div className="card-body">
                <dl className="kv">
                  <dt>{t('home.accounts')}</dt><dd className="num">{formatCount(o.people.accounts)}</dd>
                  <dt>{t('home.newAccounts')}</dt><dd className="num">{formatCount(o.people.newThisWeek)}</dd>
                  <dt>{t('home.members')}</dt><dd className="num">{formatCount(o.people.members)}</dd>
                </dl>
              </div>
            </section>
            <section className="card">
              <div className="card-head"><span className="card-title">{t('nav.feedback')}</span><SeeAllLink to="/feedback" label={t('home.seeAll')} /></div>
              <div className="card-body">
                {moodTotal === 0 ? <p className="caption" style={{ margin: 0 }}>{t('home.noMood')}</p> : (
                  <dl className="kv">
                    <dt>{t('home.mood')}</dt><dd className="num">{formatCount(moodTotal)}</dd>
                    <dt>😊 {t('feedback.happy')}</dt><dd className="num">{o.feedbackLast7Days.happy}</dd>
                    <dt>😐 {t('feedback.okay')} · 🙁 {t('feedback.unhappy')}</dt><dd className="num">{o.feedbackLast7Days.okay} · {o.feedbackLast7Days.unhappy}</dd>
                  </dl>
                )}
              </div>
            </section>
            <section className="card">
              <div className="card-head"><span className="card-title">{t('nav.app')}</span><SeeAllLink to="/app" label={t('home.seeAll')} /></div>
              <div className="card-body">
                {app ? (
                  <dl className="kv">
                    <dt>{t('app.latest')}</dt><dd className="num">{app.versions.latestVersion}</dd>
                    <dt>{t('app.min')}</dt><dd className="num">{app.versions.minVersion}</dd>
                    <dt>{t('app.link')}</dt><dd>{app.versions.downloadUrl ? t('home.linkSet') : <span className="muted">{t('home.linkNone')}</span>}</dd>
                  </dl>
                ) : <p className="caption" style={{ margin: 0 }}>{t('home.cardFailed')}</p>}
              </div>
            </section>
          </div>
          {!m ? <p className="caption"><Link to="/metrics">{t('home.metricsFailed')}</Link></p> : null}
        </div>
      ) : null}
    </>
  );
}
