// src/features/verticals/screens/VerticalEditorScreen.tsx
// One vertical, top to bottom: the basics (name, key, picture, open at sign-up), the product fields, the item types
// (which fields each one asks), the sign-up questions, then the store card and Meta settings. Save sends it all;
// the server's problems come back as a list at the bottom. Fashion & apparel is built in and opens read only.
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { t } from '../../../text/portalText';
import { ICONS } from '../../../core/rules/verticalFormRules';
import { PageHead } from '../../../ui/components/portalShell';
import { Pill } from '../../../ui/components/planBadge';
import { BackIcon } from '../../../ui/components/portalIcons';
import { ErrorNote, LoadingNote } from '../../../ui/components/stateNotes';
import { useToast } from '../../../ui/components/toastNote';
import { useVerticalEditor } from '../hooks/useVerticalEditor';
import { VerticalFieldRows } from './VerticalFieldRows';

export function VerticalEditorScreen() {
  const { key } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const e = useVerticalEditor(key, search.get('from'), (saved, created) => {
    toast(t('verticals.saved'));
    if (created) navigate(`/verticals/${encodeURIComponent(saved)}`, { replace: true });
  });
  const f = e.form;
  const back = <Link to="/verticals" className="row small" style={{ color: 'var(--muted-text)', marginBottom: 12 }}><BackIcon className="" />{t('verticals.back')}</Link>;

  if (!f) return (<>{back}{e.loadError ? <ErrorNote message={e.loadError} onRetry={e.retry} /> : <LoadingNote />}</>);

  const ro = e.readOnly;
  const labelOf = (k: string) => f.fields.find((x) => x.key === k)?.label || k;
  const chip = (on: boolean, label: string, onClick: () => void) => (
    <button key={label} type="button" className={`chip${on ? ' on' : ''}`} disabled={ro} onClick={onClick}>{label}</button>
  );

  return (
    <>
      {back}
      <PageHead title={e.isNew ? t('verticals.newTitle') : f.label} sub={e.isNew ? t('verticals.newSub') : t('verticals.editSub', { n: e.shopCount })}>
        {ro ? <Pill>{t('verticals.builtIn')}</Pill> : null}
      </PageHead>
      {ro ? <div className="note-box info" style={{ marginBottom: 16 }}>{t('verticals.builtInNote')}</div> : null}

      <form className="stack" style={{ maxWidth: 860 }} onSubmit={(ev) => { ev.preventDefault(); void e.save(); }}>
        <section className="card">
          <div className="card-head"><span className="card-title">{t('verticals.basics')}</span></div>
          <div className="card-body stack">
            <div className="grid-3">
              <label className="field">
                <span className="field-label">{t('verticals.name')}</span>
                <input className="input" value={f.label} disabled={ro} maxLength={40} onChange={(ev) => e.set('label', ev.target.value)} placeholder="Books" />
              </label>
              <label className="field">
                <span className="field-label">{t('verticals.key')}</span>
                <input className="input" value={f.key} disabled={ro || !e.isNew} maxLength={40} onChange={(ev) => e.set('key', ev.target.value.toLowerCase())} placeholder="books" />
                <span className="field-hint">{e.isNew ? t('verticals.keyHint') : t('verticals.keyLocked')}</span>
              </label>
              <label className="field">
                <span className="field-label">{t('verticals.icon')}</span>
                <select className="select" value={f.icon} disabled={ro} onChange={(ev) => e.set('icon', ev.target.value)}>
                  {ICONS.map((i) => <option key={i} value={i}>{t(`icon.${i}` as const)}</option>)}
                </select>
              </label>
            </div>
            <label className="row"><input type="checkbox" checked={f.showAtSignup} disabled={ro} onChange={(ev) => e.set('showAtSignup', ev.target.checked)} />{t('verticals.signup')}</label>
            <span className="field-hint">{t('verticals.signupHint')}</span>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><span className="card-title">{t('verticals.fields')}</span><span className="caption">{t('verticals.fieldsHint')}</span></div>
          <div className="card-body stack">
            <VerticalFieldRows rows={f.fields} readOnly={ro} showMore onChange={(i, p) => e.setField('fields', i, p)} onRemove={(i) => e.removeField('fields', i)} onMove={(i, by) => e.moveField('fields', i, by)} />
            {!ro ? <div><button className="btn" type="button" onClick={() => e.addField('fields')}>{t('verticals.addField')}</button></div> : null}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><span className="card-title">{t('verticals.types')}</span><span className="caption">{t('verticals.typesHint')}</span></div>
          <div className="card-body stack">
            {f.types.length === 0 ? <div className="empty">{t('verticals.noTypes')}</div> : null}
            {f.types.map((type, i) => (
              <div key={i} className="card card-pad stack-s">
                <div className="row-between">
                  <span className="card-title">{type.label || t('vfield.untitled')}</span>
                  {!ro ? <button className="btn ghost small" type="button" onClick={() => e.removeType(i)}>{t('verticals.removeType')}</button> : null}
                </div>
                <div className="grid-2">
                  <label className="field">
                    <span className="field-label">{t('verticals.typeName')}</span>
                    <input className="input" value={type.label} disabled={ro} maxLength={40} onChange={(ev) => e.setType(i, { label: ev.target.value })} />
                  </label>
                  <label className="field">
                    <span className="field-label">{t('verticals.typeWords')}</span>
                    <input className="input" value={type.legacy} disabled={ro} onChange={(ev) => e.setType(i, { legacy: ev.target.value })} />
                    <span className="field-hint">{t('verticals.typeWordsHint')}</span>
                  </label>
                </div>
                <span className="field-label">{t('verticals.typeFields')}</span>
                <div className="chips">{e.fieldKeys.filter((k) => k !== 'category').map((k) => chip(type.fields.includes(k), labelOf(k), () => e.toggleTypeField(i, k)))}</div>
              </div>
            ))}
            {!ro ? <div><button className="btn" type="button" onClick={e.addType}>{t('verticals.addType')}</button></div> : null}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><span className="card-title">{t('verticals.questions')}</span><span className="caption">{t('verticals.questionsHint')}</span></div>
          <div className="card-body stack">
            <VerticalFieldRows rows={f.questions} readOnly={ro} showMore={false} onChange={(i, p) => e.setField('questions', i, p)} onRemove={(i) => e.removeField('questions', i)} onMove={(i, by) => e.moveField('questions', i, by)} />
            {!ro ? <div><button className="btn" type="button" onClick={() => e.addField('questions')}>{t('verticals.addQuestion')}</button></div> : null}
          </div>
        </section>

        <section className="card">
          <div className="card-head"><span className="card-title">{t('verticals.store')}</span></div>
          <div className="card-body stack">
            <span className="field-label">{t('verticals.cardFields')}</span>
            <div className="chips">{e.fieldKeys.map((k) => chip(f.cardFields.includes(k), labelOf(k), () => e.toggleCard(k)))}</div>
            <span className="field-hint">{t('verticals.cardFieldsHint')}</span>
            <label className="row"><input type="checkbox" checked={f.variants} disabled={ro} onChange={(ev) => e.set('variants', ev.target.checked)} />{t('verticals.variants')}</label>
            <span className="field-hint">{t('verticals.variantsHint')}</span>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><span className="card-title">{t('verticals.meta')}</span><span className="caption">{t('verticals.metaHint')}</span></div>
          <div className="card-body stack">
            <div className="grid-2">
              <label className="field">
                <span className="field-label">{t('verticals.category')}</span>
                <input className="input num" value={f.category} disabled={ro} inputMode="numeric" placeholder="543543" onChange={(ev) => e.set('category', ev.target.value.replace(/\D/g, ''))} />
                <span className="field-hint">{t('verticals.categoryHint')}</span>
              </label>
              <label className="field">
                <span className="field-label">{t('verticals.gtin')}</span>
                <select className="select" value={f.gtinField} disabled={ro} onChange={(ev) => e.set('gtinField', ev.target.value)}>
                  <option value="">{t('verticals.none')}</option>
                  {e.fieldKeys.map((k) => <option key={k} value={k}>{labelOf(k)}</option>)}
                </select>
                <span className="field-hint">{t('verticals.gtinHint')}</span>
              </label>
            </div>
            <span className="field-label">{t('verticals.brand')}</span>
            <div className="chips">{e.fieldKeys.map((k) => chip(f.brandFields.includes(k), labelOf(k), () => e.toggleBrand(k)))}</div>
            <span className="field-hint">{t('verticals.brandHint')}</span>
            <label className="row"><input type="checkbox" checked={f.apparel} disabled={ro} onChange={(ev) => e.set('apparel', ev.target.checked)} />{t('verticals.apparel')}</label>
            <span className="field-hint">{t('verticals.apparelHint')}</span>
          </div>
        </section>

        {e.problems.length ? (
          <div className="note-box error" role="alert">
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{t('verticals.problems')}</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>{e.problems.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
        ) : null}
        {!ro ? (
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button className="btn primary" type="submit" disabled={e.busy}>{e.busy ? t('common.saving') : e.isNew ? t('verticals.create') : t('verticals.save')}</button>
          </div>
        ) : null}
      </form>
    </>
  );
}
