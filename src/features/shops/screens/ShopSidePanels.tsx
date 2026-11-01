// src/features/shops/screens/ShopSidePanels.tsx
// The shop page's right-hand column: Chief's notes, the plan history, and what the shop's people said lately.
import type { PlanChange, ShopDetail, ShopNote } from '../../../core/types/adminTypes';
import { t } from '../../../text/portalText';
import { formatDate, formatDateTime, formatKes } from '../../../core/rules/formatRules';
import { describeChange } from '../../../core/rules/planRules';
import { TrashIcon } from '../../../ui/components/portalIcons';
import { NOTE_MAX, useShopNotes } from '../hooks/useShopNotes';

export function NotesPanel({ shopId, notes, afterChange }: { shopId: string; notes: ShopNote[]; afterChange: () => void }) {
  const n = useShopNotes(shopId, afterChange);
  return (
    <section className="card">
      <div className="card-head"><span className="card-title">{t('notes.title')}</span><span className="caption">{t('notes.private')}</span></div>
      <div className="card-body stack-s">
        <textarea className="textarea" value={n.draft} maxLength={NOTE_MAX} placeholder={t('notes.placeholder')}
          onChange={(e) => n.setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) n.add(); }} />
        <div className="row-between">
          <span className="caption">{t('notes.shortcut')}</span>
          <button className="btn primary small" onClick={n.add} disabled={!n.canAdd}>{n.busy ? t('common.saving') : t('notes.add')}</button>
        </div>
        {n.error ? <div className="note-box error" role="alert">{n.error}</div> : null}
      </div>
      {notes.length === 0 ? <div className="empty" style={{ paddingTop: 0 }}>{t('notes.none')}</div> : (
        <div className="list">
          {notes.map((note) => (
            <div key={note.id} className="list-item" style={{ alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{note.body}</div>
                <div className="caption">{formatDateTime(note.createdAt)}{note.author.name ? ` · ${note.author.name}` : ''}</div>
              </div>
              <button className="btn ghost icon-btn" aria-label={t('notes.delete')} title={t('notes.delete')} disabled={n.busy}
                onClick={() => { if (window.confirm(t('notes.confirmDelete'))) n.remove(note.id); }}><TrashIcon /></button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function historyClass(c: PlanChange): string {
  if (c.source === 'manual') return 'pay';
  if (c.source === 'trial') return 'pilot';
  if (c.newStatus === 'suspended' || c.newStatus === 'expired') return 'stop';
  return '';
}

export function HistoryPanel({ history }: { history: PlanChange[] }) {
  return (
    <section className="card">
      <div className="card-head"><span className="card-title">{t('history.title')}</span></div>
      <div className="card-body">
        {history.length === 0 ? <div className="empty">{t('history.none')}</div> : (
          <ul className="timeline">
            {history.map((c, i) => (
              <li key={`${c.changedAt}-${i}`} className={historyClass(c)}>
                <div className="row-between" style={{ gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{describeChange(c)}</span>
                  {c.amountKes !== null ? <span className="num" style={{ fontWeight: 600, color: 'var(--success)' }}>{formatKes(c.amountKes)}</span> : null}
                </div>
                <div className="caption">
                  {formatDateTime(c.changedAt)}
                  {c.newExpiresAt ? ` · ${t('history.until', { date: formatDate(c.newExpiresAt) })}` : ''}
                  {c.source === 'manual' && c.reference ? ` · ${c.reference}` : ''}
                </div>
                {c.note && c.source !== 'system' ? <div className="caption" style={{ overflowWrap: 'anywhere' }}>{c.note}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

const MOOD = ['', '🙁', '😐', '😊'];

export function ShopFeedbackPanel({ items }: { items: ShopDetail['recentFeedback'] }) {
  if (items.length === 0) return null;
  return (
    <section className="card">
      <div className="card-head"><span className="card-title">{t('feedback.recent')}</span></div>
      <div className="list">
        {items.map((f, i) => (
          <div key={i} className="list-item" style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <span className="mood" aria-hidden>{MOOD[f.mood] ?? ''}</span>
            <div style={{ minWidth: 0 }}>
              {f.note ? <div style={{ overflowWrap: 'anywhere' }}>{f.note}</div> : null}
              {f.wish ? <div className="small" style={{ overflowWrap: 'anywhere' }}><span className="muted">{t('feedback.wish')}</span> {f.wish}</div> : null}
              <div className="caption">{f.kenyaDate}{f.name ? ` · ${f.name}` : ''}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
