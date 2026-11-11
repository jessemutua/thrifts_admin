// src/features/verticals/screens/VerticalFieldRows.tsx
// The rows of fields in the Verticals editor (product fields, and sign-up questions). Each row: label, key, kind of
// answer, and what goes with it (choices for a choice field, suggestions for a text field), a hint, Under "More",
// and Hidden. A field already saved keeps its key and kind and cannot be removed: Hidden stops the form asking.
import { t } from '../../../text/portalText';
import { FIELD_TYPES, type FieldForm } from '../../../core/rules/verticalFormRules';
import { TrashIcon } from '../../../ui/components/portalIcons';

type Props = {
  rows: FieldForm[];
  readOnly: boolean;
  showMore: boolean; // product fields have "Under More"; sign-up questions do not
  onChange: (i: number, patch: Partial<FieldForm>) => void;
  onRemove: (i: number) => void;
  onMove: (i: number, by: -1 | 1) => void;
};

const typeLabel = (type: string) => (type === 'select' ? t('vfield.typeSelect') : type === 'isbn' ? t('vfield.typeIsbn') : t('vfield.typeText'));

export function VerticalFieldRows({ rows, readOnly, showMore, onChange, onRemove, onMove }: Props) {
  if (rows.length === 0) return <div className="empty">{t('vfield.none')}</div>;
  return (
    <div className="stack">
      {rows.map((f, i) => (
        <div key={i} className="card card-pad stack-s" style={{ opacity: f.hidden ? 0.6 : 1 }}>
          <div className="row-between">
            <span className="card-title">{f.label || t('vfield.untitled')}{f.hidden ? ` · ${t('vfield.isHidden')}` : ''}</span>
            {!readOnly ? (
              <div className="row">
                <button className="btn ghost small" type="button" disabled={i === 0} onClick={() => onMove(i, -1)} aria-label={t('vfield.up')}>↑</button>
                <button className="btn ghost small" type="button" disabled={i === rows.length - 1} onClick={() => onMove(i, 1)} aria-label={t('vfield.down')}>↓</button>
                {!f.saved ? <button className="btn ghost icon-btn" type="button" onClick={() => onRemove(i)} aria-label={t('vfield.remove')} title={t('vfield.remove')}><TrashIcon /></button> : null}
              </div>
            ) : null}
          </div>
          <div className="grid-3">
            <label className="field">
              <span className="field-label">{t('vfield.label')}</span>
              <input className="input" value={f.label} disabled={readOnly} maxLength={40} onChange={(e) => onChange(i, { label: e.target.value })} />
            </label>
            <label className="field">
              <span className="field-label">{t('vfield.key')}</span>
              <input className="input" value={f.key} disabled={readOnly || f.saved} maxLength={30} onChange={(e) => onChange(i, { key: e.target.value.toLowerCase() })} />
              <span className="field-hint">{f.saved ? t('vfield.keyLocked') : t('vfield.keyHint')}</span>
            </label>
            <label className="field">
              <span className="field-label">{t('vfield.type')}</span>
              <select className="select" value={f.type} disabled={readOnly || f.saved} onChange={(e) => onChange(i, { type: e.target.value })}>
                {FIELD_TYPES.map((type) => <option key={type} value={type}>{typeLabel(type)}</option>)}
              </select>
            </label>
          </div>
          {f.type === 'select' ? (
            <label className="field">
              <span className="field-label">{t('vfield.choices')}</span>
              <textarea className="textarea" value={f.choices} disabled={readOnly} onChange={(e) => onChange(i, { choices: e.target.value })} />
              <span className="field-hint">{f.saved ? t('vfield.choicesLocked') : t('vfield.choicesHint')}</span>
            </label>
          ) : null}
          {f.type === 'text' ? (
            <div className="grid-2">
              <label className="field">
                <span className="field-label">{t('vfield.suggestions')}</span>
                <input className="input" value={f.suggestions} disabled={readOnly} onChange={(e) => onChange(i, { suggestions: e.target.value })} />
                <span className="field-hint">{t('vfield.suggestionsHint')}</span>
              </label>
              <label className="field">
                <span className="field-label">{t('vfield.maxLength')}</span>
                <input className="input num" value={f.maxLength} disabled={readOnly} inputMode="numeric" placeholder="60" onChange={(e) => onChange(i, { maxLength: e.target.value.replace(/\D/g, '') })} />
              </label>
            </div>
          ) : null}
          {f.type === 'isbn' ? <div className="note-box info">{t('vfield.isbnNote')}</div> : null}
          <label className="field">
            <span className="field-label">{t('vfield.hint')}</span>
            <input className="input" value={f.hint} disabled={readOnly} maxLength={120} onChange={(e) => onChange(i, { hint: e.target.value })} />
          </label>
          <div className="row wrap">
            {showMore ? (
              <label className="row small"><input type="checkbox" checked={f.more} disabled={readOnly} onChange={(e) => onChange(i, { more: e.target.checked })} />{t('vfield.more')}</label>
            ) : null}
            <label className="row small"><input type="checkbox" checked={f.hidden} disabled={readOnly} onChange={(e) => onChange(i, { hidden: e.target.checked })} />{t('vfield.hidden')}</label>
          </div>
        </div>
      ))}
    </div>
  );
}
