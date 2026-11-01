// src/features/shops/screens/ShopDetailScreen.tsx
// One shop: its plan and the buttons that change it, how much it is really used, its people and branches,
// and on the right Chief's notes, the plan history and recent feedback. Drawing only.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { channelLabel, t } from '../../../text/portalText';
import { formatCount, formatDate, formatKes, relativeDay } from '../../../core/rules/formatRules';
import { planEndText } from '../../../core/rules/planRules';
import { PlanBadge, Pill } from '../../../ui/components/planBadge';
import { ErrorNote, LoadingNote } from '../../../ui/components/stateNotes';
import { BackIcon } from '../../../ui/components/portalIcons';
import { useToast } from '../../../ui/components/toastNote';
import { useShopDetail } from '../hooks/useShopDetail';
import { useTestShopToggle } from '../hooks/useShopActions';
import { DeleteShopDialog, PaidDialog, PilotDialog, SuspendDialog } from './ShopActionDialogs';
import { HistoryPanel, NotesPanel, ShopFeedbackPanel } from './ShopSidePanels';

type Open = null | 'pilot' | 'paid' | 'suspend' | 'delete';

function initials(name: string | null, email: string | null): string {
  const src = (name || email || '?').trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function ShopDetailScreen() {
  const { shopId = '' } = useParams();
  const { data, error, loading, reload, afterChange } = useShopDetail(shopId);
  const [open, setOpen] = useState<Open>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const testToggle = useTestShopToggle(shopId, !!data?.detail.shop.isTest, (m) => { toast(m); afterChange(); });

  const back = <Link to="/shops" className="row small" style={{ color: 'var(--muted-text)', marginBottom: 12 }}><BackIcon className="" />{t('shop.back')}</Link>;

  if (!data) {
    return (<>{back}{error ? <ErrorNote message={error} onRetry={reload} /> : null}{loading ? <LoadingNote /> : null}</>);
  }

  const { detail, history, notes } = data;
  const s = detail.shop;
  const u = detail.usage;
  const isBranch = !!s.mainShop;
  const suspended = s.status === 'suspended';
  const done = (message: string) => { setOpen(null); toast(message); afterChange(); };

  return (
    <>
      {back}
      <div className="page-head">
        <div className="stack-s" style={{ gap: 4 }}>
          <div className="row wrap"><h1 className="page-title">{s.name}</h1><PlanBadge bucket={s.bucket} />{s.isTest ? <Pill>{t('shop.testBadge')}</Pill> : null}</div>
          <div className="caption">
            {isBranch ? <>{t('shops.branchOf', { name: '' })}<Link to={`/shops/${s.mainShop!.id}`}>{s.mainShop!.name}</Link> · </> : `${channelLabel(s.salesChannel)} · `}
            {t('shop.joined', { date: formatDate(s.createdAt) })}
            {s.location ? ` · ${s.location}` : ''}
            {s.slug ? <> · <a href={`https://thrifts.co.ke/s/${s.slug}`} target="_blank" rel="noreferrer">{t('shop.storePage')}</a></> : null}
          </div>
        </div>
      </div>

      {error ? <div style={{ marginBottom: 16 }}><ErrorNote message={error} onRetry={reload} /></div> : null}
      {s.deleted ? <div className="note-box warn" style={{ marginBottom: 16 }}>{t('shop.deleted')}</div> : null}

      <div className="grid-2" style={{ opacity: loading ? 0.7 : 1 }}>
        <div className="stack">
          <section className="card card-pad stack">
            <div className="row-between">
              <div>
                <div className="caption">{t('shop.plan')}</div>
                <div style={{ fontSize: 'var(--f-heading)', fontWeight: 650 }}>
                  {isBranch ? t('shop.planViaMain') : planEndText(s.expiresAt, s.bucket, formatDate, relativeDay) || t('shop.noPlan')}
                </div>
              </div>
              <PlanBadge bucket={s.bucket} />
            </div>
            {isBranch ? <div className="note-box info">{t('shop.branchNote')}</div> : null}
            {!s.deleted ? (
              <div className="row wrap">
                {!isBranch && !suspended ? <button className="btn primary" onClick={() => setOpen('paid')}>{t('paid.title')}</button> : null}
                {!isBranch && !suspended ? <button className="btn" onClick={() => setOpen('pilot')}>{s.bucket === 'pilot' ? t('pilot.change') : t('pilot.title')}</button> : null}
                <button className={`btn${suspended ? '' : ' danger'}`} onClick={() => setOpen('suspend')}>{suspended ? t('suspend.liftTitle') : t('suspend.title')}</button>
              </div>
            ) : null}
          </section>

          <section className="card">
            <div className="card-head"><span className="card-title">{t('shop.usage')}</span><span className="caption">{t('shop.last30')}</span></div>
            <div className="card-body">
              <dl className="kv">
                <dt>{t('shop.sales')}</dt><dd className="num">{formatCount(u.paidSalesLast30Days)} · {formatKes(u.salesKesLast30Days)}</dd>
                <dt>{t('shop.lastSale')}</dt><dd>{s.lastSaleAt ? `${formatDate(s.lastSaleAt)} (${relativeDay(s.lastSaleAt)})` : <span className="muted">{t('shops.noSales')}</span>}</dd>
                <dt>{t('shop.products')}</dt><dd className="num">{formatCount(u.products)} · {t('shop.published', { n: formatCount(u.published) })}</dd>
                <dt>{t('shop.visits')}</dt><dd className="num">{formatCount(u.storeVisitsLast30Days)}</dd>
                <dt>{t('shop.approvals')}</dt><dd className="num">{formatCount(u.waitingApprovals)}</dd>
                <dt>{t('shop.uploads')}</dt><dd className="num">{formatCount(u.bulkUploads)}</dd>
                <dt>{t('shop.payment')}</dt><dd>{s.paymentSetUp ? <Pill tone="success">{t('shop.paymentYes')}</Pill> : <Pill tone="warning">{t('shop.paymentNo')}</Pill>}</dd>
                {s.contactPhone ? <><dt>{t('shop.phone')}</dt><dd><a href={`tel:${s.contactPhone}`}>{s.contactPhone}</a></dd></> : null}
              </dl>
            </div>
          </section>

          <section className="card">
            <div className="card-head"><span className="card-title">{t('shop.people')}</span><span className="caption num">{detail.people.length}</span></div>
            {detail.people.length === 0 ? <div className="empty">{t('shop.noPeople')}</div> : (
              <div className="list">
                {detail.people.map((p) => (
                  <Link key={p.id} to={`/people?q=${encodeURIComponent(p.email ?? p.name ?? '')}`} className="list-item">
                    <div className="row" style={{ minWidth: 0, gap: 12 }}>
                      <span className="avatar">{initials(p.name, p.email)}</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="cell-main ellipsis">{p.name || p.email || t('shops.noOwner')}</div>
                        <div className="cell-sub ellipsis">{p.email ?? ''}</div>
                      </div>
                    </div>
                    <div className="row">
                      {p.paused ? <Pill tone="warning">{t('people.paused')}</Pill> : null}
                      <Pill tone={p.role === 'owner' ? 'accent' : undefined}>{p.role === 'owner' ? t('people.owner') : t('people.attendant')}</Pill>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {detail.branches.length > 0 ? (
            <section className="card">
              <div className="card-head"><span className="card-title">{t('shop.branches')}</span><span className="caption num">{detail.branches.length}</span></div>
              <div className="list">
                {detail.branches.map((b) => (
                  <Link key={b.id} to={`/shops/${b.id}`} className="list-item">
                    <span className="cell-main">{b.name}</span>
                    <span className="caption">{b.subscriptionStatus === 'suspended' ? t('suspend.suspended') : t('shop.joined', { date: formatDate(b.createdAt) })}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {!s.deleted && !isBranch ? (
            <section className="card card-pad stack-s">
              <div className="row-between">
                <div className="card-title">{s.isTest ? t('test.isTest') : t('test.title')}</div>
                {s.isTest ? <Pill>{t('shop.testBadge')}</Pill> : null}
              </div>
              <p className="caption" style={{ margin: 0 }}>{s.isTest ? t('test.isTestHint') : t('test.hint')}</p>
              {testToggle.error ? <div className="note-box error" role="alert">{testToggle.error}</div> : null}
              <div><button className="btn" disabled={testToggle.busy} onClick={() => void testToggle.toggle()}>
                {testToggle.busy ? t('common.saving') : s.isTest ? t('test.unmark') : t('test.mark')}
              </button></div>
            </section>
          ) : null}

          {!s.deleted ? (
            <section className="card card-pad stack-s">
              <div className="card-title">{t('delete.zone')}</div>
              <p className="caption" style={{ margin: 0 }}>{detail.branches.some((b) => b.name !== 'Deleted shop') ? t('delete.branchesFirst') : t('delete.zoneHint')}</p>
              <div><button className="btn danger" disabled={detail.branches.some((b) => b.name !== 'Deleted shop')} onClick={() => setOpen('delete')}>{t('delete.title')}</button></div>
            </section>
          ) : null}
        </div>

        <div className="stack">
          <NotesPanel shopId={s.id} notes={notes} afterChange={afterChange} />
          <HistoryPanel history={history} />
          <ShopFeedbackPanel items={detail.recentFeedback} />
        </div>
      </div>

      {open === 'pilot' ? <PilotDialog shopId={s.id} shopName={s.name} currentEnd={s.onPilot ? s.expiresAt : null} onClose={() => setOpen(null)} onDone={done} /> : null}
      {open === 'paid' ? <PaidDialog shopId={s.id} shopName={s.name} currentEnd={s.status === 'active' ? s.expiresAt : null} onClose={() => setOpen(null)} onDone={done} /> : null}
      {open === 'delete' ? (
        <DeleteShopDialog shopId={s.id} shopName={s.name} people={detail.people.length} sales={u.paidSalesLast30Days}
          payments={history.filter((c) => c.source === 'manual').length}
          onClose={() => setOpen(null)} onDone={(message) => { setOpen(null); toast(message); navigate('/shops', { replace: true }); }} />
      ) : null}
      {open === 'suspend' ? <SuspendDialog shopId={s.id} shopName={s.name} suspended={suspended} hasBranches={detail.branches.length > 0} onClose={() => setOpen(null)} onDone={done} /> : null}
    </>
  );
}
