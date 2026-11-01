// src/features/feedback/screens/FeedbackScreen.tsx
// What owners and attendants say in the app's daily prompt: the mood count, then every answer that has words.
import { Link } from 'react-router-dom';
import { t } from '../../../text/portalText';
import { formatCount } from '../../../core/rules/formatRules';
import { PageHead } from '../../../ui/components/portalShell';
import { StatTile } from '../../../ui/components/statTile';
import { EmptyNote, ErrorNote, LoadingNote } from '../../../ui/components/stateNotes';
import { RANGES, useFeedbackList } from '../hooks/useFeedbackList';

const MOOD = ['', '🙁', '😐', '😊'];

export function FeedbackScreen() {
  const f = useFeedbackList();
  const d = f.data;
  const pct = (n: number) => (f.answered ? `${Math.round((n / f.answered) * 100)}%` : '–');
  return (
    <>
      <PageHead title={t('feedback.title')} sub={t('feedback.sub')}>
        <div className="seg" role="group" aria-label={t('feedback.range')}>
          {RANGES.map((r) => (<button key={r} className={f.days === r ? 'on' : ''} onClick={() => f.setDays(r)}>{t('feedback.days', { n: r })}</button>))}
        </div>
      </PageHead>
      {f.error ? <ErrorNote message={f.error} onRetry={f.reload} /> : null}
      {!d && f.loading ? <LoadingNote /> : null}
      {d ? (
        <div className="stack" style={{ opacity: f.loading ? 0.6 : 1 }}>
          <div className="grid-tiles">
            <StatTile label={t('feedback.answers')} value={formatCount(f.answered)} />
            <StatTile label={`😊 ${t('feedback.happy')}`} value={formatCount(d.totals.happy)} foot={pct(d.totals.happy)} />
            <StatTile label={`😐 ${t('feedback.okay')}`} value={formatCount(d.totals.okay)} foot={pct(d.totals.okay)} />
            <StatTile label={`🙁 ${t('feedback.unhappy')}`} value={formatCount(d.totals.unhappy)} foot={pct(d.totals.unhappy)} alert={d.totals.unhappy > 0} />
          </div>
          <section className="card">
            <div className="card-head"><span className="card-title">{t('feedback.words')}</span><span className="caption num">{d.entries.length}</span></div>
            {d.entries.length === 0 ? <EmptyNote>{t('feedback.none')}</EmptyNote> : (
              <div className="list">
                {d.entries.map((e) => (
                  <div key={e.id} className="list-item" style={{ alignItems: 'flex-start', justifyContent: 'flex-start', gap: 14 }}>
                    <span className="mood" aria-label={String(e.mood)}>{MOOD[e.mood] ?? ''}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      {e.note ? <div style={{ overflowWrap: 'anywhere' }}>{e.note}</div> : null}
                      {e.wish ? <div className="small" style={{ overflowWrap: 'anywhere' }}><span className="muted">{t('feedback.wish')}</span> {e.wish}</div> : null}
                      <div className="caption">
                        <Link to={`/shops/${e.shop.id}`}>{e.shop.name}</Link>{e.person.name ? ` · ${e.person.name}` : ''} · {e.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
