// src/features/verticals/screens/VerticalListScreen.tsx
// Verticals: the kinds of business Thrifts serves (Fashion, Books, ...). Each row: its name, how many shops use it,
// and whether new shops can pick it at sign-up. "New vertical" starts blank or from a ready-made template.
import { Link, useNavigate } from 'react-router-dom';
import { t } from '../../../text/portalText';
import { getVerticals, getVerticalTemplates } from '../../../core/services/portalRequests';
import { useLoad } from '../../shared/hooks/useLoad';
import { PageHead } from '../../../ui/components/portalShell';
import { Pill } from '../../../ui/components/planBadge';
import { ErrorNote, LoadingNote } from '../../../ui/components/stateNotes';

export function VerticalListScreen() {
  const navigate = useNavigate();
  const list = useLoad(getVerticals, []);
  const templates = useLoad(getVerticalTemplates, []);
  const open = (key: string) => navigate(`/verticals/${encodeURIComponent(key)}`);

  return (
    <>
      <PageHead title={t('verticals.title')} sub={t('verticals.sub')}>
        <Link className="btn" to="/verticals/new">{t('verticals.newBlank')}</Link>
        {(templates.data?.templates ?? []).map((tpl) => (
          <Link key={tpl.key} className="btn primary" to={`/verticals/new?from=${encodeURIComponent(tpl.key)}`}>{t('verticals.newFrom', { name: tpl.label })}</Link>
        ))}
      </PageHead>
      {list.error ? <ErrorNote message={list.error} onRetry={list.reload} /> : null}
      <section className="card">
        {!list.data && list.loading ? <LoadingNote /> : null}
        {list.data ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{t('verticals.colName')}</th><th>{t('verticals.colShops')}</th><th>{t('verticals.colSignup')}</th><th>{t('verticals.colFields')}</th></tr></thead>
              <tbody>
                {list.data.verticals.map((v) => (
                  <tr key={v.key} className="click" tabIndex={0} onClick={() => open(v.key)} onKeyDown={(e) => { if (e.key === 'Enter') open(v.key); }}>
                    <td>
                      <div className="row"><span className="cell-main">{v.label}</span>{v.builtIn ? <Pill>{t('verticals.builtIn')}</Pill> : null}</div>
                      <div className="cell-sub">{v.key}</div>
                    </td>
                    <td className="num">{v.shopCount}</td>
                    <td>{v.showAtSignup ? <Pill tone="success">{t('verticals.open')}</Pill> : <Pill tone="warning">{t('verticals.hidden')}</Pill>}</td>
                    <td className="num muted">{t('verticals.counts', { fields: v.productAttributes.filter((f) => !f.hidden).length, types: v.productTypes.length })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </>
  );
}
