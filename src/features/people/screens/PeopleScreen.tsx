// src/features/people/screens/PeopleScreen.tsx
// Everyone with an account: how they sign in, whether their email is confirmed, and which shops they are in.
// With no search it shows the newest 20 accounts. Drawing only: logic in usePeopleSearch.
import { Link } from 'react-router-dom';
import { t } from '../../../text/portalText';
import { formatDate } from '../../../core/rules/formatRules';
import { PageHead } from '../../../ui/components/portalShell';
import { SearchBox } from '../../../ui/components/searchBox';
import { Pill } from '../../../ui/components/planBadge';
import { EmptyNote, ErrorNote, LoadingNote } from '../../../ui/components/stateNotes';
import { usePeopleSearch } from '../hooks/usePeopleSearch';

export function PeopleScreen() {
  const p = usePeopleSearch();
  const people = p.data?.people ?? [];
  return (
    <>
      <PageHead title={t('people.title')} sub={p.q ? undefined : t('people.newest')} />
      <div className="stack">
        <SearchBox value={p.q} onChange={p.setQ} placeholder={t('people.search')} autoFocus />
        {p.error ? <ErrorNote message={p.error} onRetry={p.reload} /> : null}
        {p.data?.error ? <ErrorNote message={p.data.error} /> : null}
        <section className="card" style={{ opacity: p.loading && p.data ? 0.6 : 1 }}>
          {!p.data && p.loading ? <LoadingNote /> : null}
          {p.data && people.length === 0 ? <EmptyNote>{t('people.none')}</EmptyNote> : null}
          {people.length > 0 ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>{t('people.colPerson')}</th><th>{t('people.colSignIn')}</th><th>{t('people.colShops')}</th><th>{t('people.colJoined')}</th></tr></thead>
                <tbody>
                  {people.map((person) => (
                    <tr key={person.id}>
                      <td>
                        <div className="row">
                          <span className="cell-main">{person.name || <span className="muted">{t('people.noName')}</span>}</span>
                          {person.isAdmin ? <Pill tone="accent">{t('people.admin')}</Pill> : null}
                        </div>
                        <div className="cell-sub">{person.email ?? ''}</div>
                      </td>
                      <td>
                        <div className="row wrap">
                          <Pill>{person.signIn === 'google' ? t('people.google') : t('people.password')}</Pill>
                          {person.emailConfirmed ? null : <Pill tone="warning">{t('people.unconfirmed')}</Pill>}
                        </div>
                      </td>
                      <td>
                        {person.shops.length === 0 ? <span className="muted">{t('people.noShop')}</span> : (
                          <div className="stack-s" style={{ gap: 2 }}>
                            {person.shops.map((s) => (
                              <div key={s.id} className="row small">
                                <Link to={`/shops/${s.id}`}>{s.name}</Link>
                                <span className="caption">{s.role === 'owner' ? t('people.owner') : t('people.attendant')}{s.isBranch ? ` · ${t('people.branch')}` : ''}</span>
                                {s.paused ? <Pill tone="warning">{t('people.paused')}</Pill> : null}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="num muted">{formatDate(person.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </>
  );
}
