// src/features/shops/screens/ShopActionDialogs.tsx
// The three forms opened from the shop page's plan card. Drawing only: logic in useShopActions.ts.
import { t } from '../../../text/portalText';
import { formatDate, formatKes } from '../../../core/rules/formatRules';
import { PortalDialog } from '../../../ui/components/portalDialog';
import { useDeleteShopForm, usePaidForm, usePilotForm, useSuspendForm } from '../hooks/useShopActions';

type Base = { shopId: string; shopName: string; onClose: () => void; onDone: (message: string) => void };

function Footer({ onClose, busy, valid, label, danger }: { onClose: () => void; busy: boolean; valid: boolean; label: string; danger?: boolean }) {
  return (
    <>
      <button className="btn" type="button" onClick={onClose} disabled={busy}>{t('common.cancel')}</button>
      <button className={`btn ${danger ? 'danger solid' : 'primary'}`} type="submit" form="action-form" disabled={!valid || busy}>
        {busy ? t('common.saving') : label}
      </button>
    </>
  );
}

export function PilotDialog({ shopId, shopName, currentEnd, onClose, onDone }: Base & { currentEnd: string | null }) {
  const f = usePilotForm(shopId, currentEnd, onDone);
  return (
    <PortalDialog title={t('pilot.title')} subtitle={shopName} onClose={onClose} busy={f.busy}
      footer={<Footer onClose={onClose} busy={f.busy} valid={f.valid} label={t('pilot.button')} />}>
      <form id="action-form" className="stack" onSubmit={(e) => { e.preventDefault(); f.submit(); }}>
        <label className="field">
          <span className="field-label">{t('pilot.endsOn')}</span>
          <input className="input" type="date" value={f.endsOn} min={f.min} max={f.max} onChange={(e) => f.setEndsOn(e.target.value)} required />
          <span className="field-hint">{t('pilot.hint')}</span>
        </label>
        <label className="field">
          <span className="field-label">{t('common.noteOptional')}</span>
          <input className="input" value={f.note} maxLength={300} onChange={(e) => f.setNote(e.target.value)} placeholder={t('pilot.notePlaceholder')} />
        </label>
        {f.error ? <div className="note-box error" role="alert">{f.error}</div> : null}
      </form>
    </PortalDialog>
  );
}

export function PaidDialog({ shopId, shopName, currentEnd, onClose, onDone }: Base & { currentEnd: string | null }) {
  const f = usePaidForm(shopId, onDone);
  return (
    <PortalDialog title={t('paid.title')} subtitle={shopName} onClose={onClose} busy={f.busy}
      footer={<Footer onClose={onClose} busy={f.busy} valid={f.valid} label={t('paid.button')} />}>
      <form id="action-form" className="stack" onSubmit={(e) => { e.preventDefault(); f.submit(); }}>
        <label className="field">
          <span className="field-label">{t('paid.months')}</span>
          <select className="select" value={f.months} onChange={(e) => f.setMonths(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{t(m === 1 ? 'paid.monthOne' : 'paid.monthMany', { n: m, price: formatKes(m * 2000) })}</option>
            ))}
          </select>
          <span className="field-hint">
            {currentEnd
              ? t('paid.extendsFrom', { date: formatDate(currentEnd) })
              : t('paid.startsToday')}
          </span>
        </label>
        <label className="field">
          <span className="field-label">{t('paid.reference')}</span>
          <input className="input" value={f.reference} maxLength={100} autoCapitalize="characters" spellCheck={false}
            onChange={(e) => f.setReference(e.target.value)} placeholder="TK31AB2CDE" required />
          <span className={`field-hint${f.refOdd ? ' warn' : ''}`}>{f.refOdd ? t('paid.referenceOdd') : t('paid.referenceHint')}</span>
        </label>
        <label className="field">
          <span className="field-label">{t('paid.amount')}</span>
          <input className="input num" inputMode="numeric" value={f.amount} onChange={(e) => f.setAmount(e.target.value)} placeholder={String(f.expected)} />
          <span className={`field-hint${f.amountBad || f.amountOff ? ' warn' : ''}`}>
            {f.amountBad ? t('paid.amountBad') : f.amountOff ? t('paid.amountOff', { expected: formatKes(f.expected) }) : t('paid.amountHint', { expected: formatKes(f.expected) })}
          </span>
        </label>
        <label className="field">
          <span className="field-label">{t('common.noteOptional')}</span>
          <input className="input" value={f.note} maxLength={300} onChange={(e) => f.setNote(e.target.value)} />
        </label>
        {f.error ? <div className="note-box error" role="alert">{f.error}</div> : null}
      </form>
    </PortalDialog>
  );
}

export function SuspendDialog({ shopId, shopName, suspended, hasBranches, onClose, onDone }: Base & { suspended: boolean; hasBranches: boolean }) {
  const f = useSuspendForm(shopId, suspended, onDone);
  return (
    <PortalDialog title={suspended ? t('suspend.liftTitle') : t('suspend.title')} subtitle={shopName} onClose={onClose} busy={f.busy}
      footer={<Footer onClose={onClose} busy={f.busy} valid label={suspended ? t('suspend.liftButton') : t('suspend.button')} danger={!suspended} />}>
      <form id="action-form" className="stack" onSubmit={(e) => { e.preventDefault(); void f.submit(); }}>
        <div className={`note-box ${suspended ? 'info' : 'warn'}`}>
          {suspended ? t('suspend.liftExplain') : t('suspend.explain')}
          {!suspended && hasBranches ? ` ${t('suspend.branches')}` : ''}
        </div>
        <label className="field">
          <span className="field-label">{t('suspend.reason')}</span>
          <input className="input" value={f.reason} maxLength={300} onChange={(e) => f.setReason(e.target.value)} />
        </label>
        {f.error ? <div className="note-box error" role="alert">{f.error}</div> : null}
      </form>
    </PortalDialog>
  );
}

export function DeleteShopDialog({ shopId, shopName, people, sales, payments, onClose, onDone }: Base & { people: number; sales: number; payments: number }) {
  const f = useDeleteShopForm(shopId, shopName, onDone);
  return (
    <PortalDialog title={t('delete.title')} subtitle={shopName} onClose={onClose} busy={f.busy}
      footer={<Footer onClose={onClose} busy={f.busy} valid={f.matches} label={t('delete.button')} danger />}>
      <form id="action-form" className="stack" onSubmit={(e) => { e.preventDefault(); f.submit(); }}>
        <div className="note-box warn">{t('delete.explain')}</div>
        <dl className="kv">
          <dt>{t('delete.people')}</dt><dd className="num">{people}</dd>
          <dt>{t('delete.sales')}</dt><dd className="num">{sales}</dd>
          <dt>{t('delete.payments')}</dt><dd className="num">{payments}</dd>
        </dl>
        {payments > 0 ? <div className="note-box error">{t('delete.paidWarning')}</div> : null}
        <label className="field">
          <span className="field-label">{t('delete.typeName', { name: shopName })}</span>
          <input className="input" value={f.typed} onChange={(e) => f.setTyped(e.target.value)} autoComplete="off" spellCheck={false} autoFocus />
        </label>
        {f.error ? <div className="note-box error" role="alert">{f.error}</div> : null}
      </form>
    </PortalDialog>
  );
}
