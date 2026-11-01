// src/features/shops/screens/ShopListScreen.tsx
// Every shop: search by shop name or owner email, filter by plan group, newest or A-Z, 25 a page.
// Clicking a row opens the shop page. Drawing only: the logic is in useShopList.
import { useNavigate } from 'react-router-dom';
import { channelLabel, t } from '../../../text/portalText';
import { BUCKET_ORDER, bucketLabel, planEndText } from '../../../core/rules/planRules';
import { formatCount, formatDate, relativeDay } from '../../../core/rules/formatRules';
import { PageHead } from '../../../ui/components/portalShell';
import { SearchBox } from '../../../ui/components/searchBox';
import { PlanBadge, Pill } from '../../../ui/components/planBadge';
import { EmptyNote, ErrorNote, LoadingNote } from '../../../ui/components/stateNotes';
import { useShopList } from '../hooks/useShopList';

export function ShopListScreen() {
  const list = useShopList();
  const navigate = useNavigate();
  const data = list.data;

  return (
    <>
      <PageHead title={t('shops.title')} sub={data ? t('shops.count', { n: formatCount(data.total) }) : undefined} />

      <div className="stack">
        <div className="row-between">
          <SearchBox value={list.q} onChange={list.setQ} placeholder={t('shops.search')} />
          <div className="seg" role="group" aria-label={t('shops.sort')}>
            <button className={list.sort === 'newest' ? 'on' : ''} onClick={() => list.setSort('newest')}>{t('shops.newest')}</button>
            <button className={list.sort === 'name' ? 'on' : ''} onClick={() => list.setSort('name')}>{t('shops.az')}</button>
          </div>
        </div>
        <div className="chips" role="group" aria-label={t('shops.filter')}>
          <button className={`chip${list.bucket === '' && !list.testOnly ? ' on' : ''}`} onClick={() => list.setBucket('')}>{t('shops.all')}</button>
          {BUCKET_ORDER.map((b) => (
            <button key={b} className={`chip${list.bucket === b && !list.testOnly ? ' on' : ''}`} onClick={() => list.setBucket(b)}>{bucketLabel(b)}</button>
          ))}
          <button className={`chip${list.testOnly ? ' on' : ''}`} onClick={list.showTestShops} title={t('shops.testHint')}>{t('shops.testChip')}</button>
        </div>

        {list.error ? <ErrorNote message={list.error} onRetry={list.reload} /> : null}

        <section className="card" style={{ opacity: list.loading && data ? 0.6 : 1 }}>
          {!data && list.loading ? <LoadingNote /> : null}
          {data && data.shops.length === 0 ? (
            <EmptyNote>{list.testOnly ? t('shops.noTest') : list.q || list.bucket ? t('shops.noneMatch') : t('shops.none')}</EmptyNote>
          ) : null}
          {data && data.shops.length > 0 ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>{t('shops.colShop')}</th><th>{t('shops.colOwner')}</th><th>{t('shops.colPlan')}</th><th>{t('shops.colLastSale')}</th><th>{t('shops.colJoined')}</th></tr>
                </thead>
                <tbody>
                  {data.shops.map((s) => (
                    <tr key={s.id} className="click" onClick={() => navigate(`/shops/${s.id}`)}
                      tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/shops/${s.id}`); }}>
                      <td>
                        <div className="row"><span className="cell-main">{s.name}</span>{s.isTest ? <Pill>{t('shop.testBadge')}</Pill> : null}</div>
                        <div className="cell-sub">
                          {s.mainShop ? t('shops.branchOf', { name: s.mainShop.name }) : channelLabel(s.salesChannel)}
                        </div>
                      </td>
                      <td>
                        <div>{s.owner?.name || <span className="muted">{t('shops.noOwner')}</span>}</div>
                        <div className="cell-sub">{s.owner?.email ?? ''}</div>
                      </td>
                      <td>
                        <div className="row">{s.mainShop ? <Pill>{t('shops.viaMain')}</Pill> : null}<PlanBadge bucket={s.bucket} /></div>
                        <div className="cell-sub">{planEndText(s.expiresAt, s.bucket, formatDate, relativeDay)}</div>
                      </td>
                      <td className="num">{s.lastSaleAt ? relativeDay(s.lastSaleAt) : <span className="muted">{t('shops.noSalesShort')}</span>}</td>
                      <td className="num muted">{formatDate(s.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {data && data.pages > 1 ? (
            <div className="pager">
              <span className="caption">{t('shops.page', { page: data.page, pages: data.pages })}</span>
              <div className="row">
                <button className="btn small" disabled={data.page <= 1} onClick={() => list.setPage(data.page - 1)}>{t('common.previous')}</button>
                <button className="btn small" disabled={data.page >= data.pages} onClick={() => list.setPage(data.page + 1)}>{t('common.next')}</button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
