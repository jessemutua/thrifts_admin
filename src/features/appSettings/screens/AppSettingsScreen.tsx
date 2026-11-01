// src/features/appSettings/screens/AppSettingsScreen.tsx
// Which app versions phones are told about: the newest (a gentle "update" banner), the oldest still allowed
// (older phones are blocked), and where "Get the new version" goes. Phones see a change within a minute.
import { t } from '../../../text/portalText';
import { formatDateTime } from '../../../core/rules/formatRules';
import { PageHead } from '../../../ui/components/portalShell';
import { Pill } from '../../../ui/components/planBadge';
import { ErrorNote, LoadingNote } from '../../../ui/components/stateNotes';
import { useToast } from '../../../ui/components/toastNote';
import { useAppSettingsForm } from '../hooks/useAppSettingsForm';

export function AppSettingsScreen() {
  const toast = useToast();
  const a = useAppSettingsForm(() => toast(t('app.saved')));
  const f = a.form;
  return (
    <>
      <PageHead title={t('app.title')} sub={t('app.sub')} />
      {a.error ? <ErrorNote message={a.error} onRetry={a.reload} /> : null}
      {!a.data && a.loading ? <LoadingNote /> : null}
      {a.data ? (
        <section className="card" style={{ maxWidth: 640 }}>
          <div className="card-head">
            <span className="card-title">{t('app.versions')}</span>
            <span className="row caption">
              {a.data.from === 'portal'
                ? <>{t('app.fromPortal', { when: formatDateTime(a.data.updatedAt) })}</>
                : <Pill>{t('app.fromCode')}</Pill>}
            </span>
          </div>
          <form className="card-body stack" onSubmit={(e) => { e.preventDefault(); void a.save(); }}>
            <label className="field">
              <span className="field-label">{t('app.latest')}</span>
              <input className="input num" value={f.latestVersion} onChange={(e) => a.set('latestVersion')(e.target.value)} placeholder="1.1.0" />
              <span className={`field-hint${a.latestOk ? '' : ' warn'}`}>{a.latestOk ? t('app.latestHint') : t('app.badVersion')}</span>
            </label>
            <label className="field">
              <span className="field-label">{t('app.min')}</span>
              <input className="input num" value={f.minVersion} onChange={(e) => a.set('minVersion')(e.target.value)} placeholder="1.0.1" />
              <span className={`field-hint${a.minOk && a.orderOk ? '' : ' warn'}`}>
                {!a.minOk ? t('app.badVersion') : !a.orderOk ? t('app.badOrder') : t('app.minHint')}
              </span>
            </label>
            <label className="field">
              <span className="field-label">{t('app.link')}</span>
              <input className="input" value={f.downloadUrl} onChange={(e) => a.set('downloadUrl')(e.target.value)} placeholder="https://play.google.com/store/apps/details?id=com.pirple.thrifts" />
              <span className={`field-hint${a.linkOk ? '' : ' warn'}`}>{a.linkOk ? t('app.linkHint') : t('app.badLink')}</span>
            </label>
            {a.raisesMin ? <div className="note-box warn">{t('app.raisesMin', { v: f.minVersion })}</div> : null}
            {a.saveError ? <div className="note-box error" role="alert">{a.saveError}</div> : null}
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn" type="button" disabled={!a.changed || a.busy} onClick={a.reset}>{t('common.undo')}</button>
              <button className={`btn ${a.raisesMin ? 'danger solid' : 'primary'}`} type="submit" disabled={!a.valid || !a.changed || a.busy}>
                {a.busy ? t('common.saving') : t('app.save')}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </>
  );
}
