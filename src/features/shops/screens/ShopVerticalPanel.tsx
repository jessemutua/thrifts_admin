// src/features/shops/screens/ShopVerticalPanel.tsx
// On a main shop's page: which vertical (business type) it is, and moving it to another one (Fashion to Books, say).
// Its branches move with it. Products keep every detail; the app's forms simply start asking the new questions.
// A branch shows its type only: it follows its main shop.
import { useEffect, useState } from 'react';
import { t } from '../../../text/portalText';
import { getVerticals, setShopVerticalRequest } from '../../../core/services/portalRequests';
import { errorText, useLoad } from '../../shared/hooks/useLoad';

export function ShopVerticalPanel({ shopId, current, isBranch, onDone }: { shopId: string; current: string; isBranch: boolean; onDone: (message: string) => void }) {
  const list = useLoad(getVerticals, []);
  const [chosen, setChosen] = useState(current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setChosen(current), [current]);

  const verticals = list.data?.verticals ?? [];
  const nameOf = (key: string) => verticals.find((v) => v.key === key)?.label ?? key;

  async function move() {
    if (chosen === current) return;
    if (!window.confirm(t('shopVertical.confirm', { from: nameOf(current), to: nameOf(chosen) }))) return;
    setBusy(true);
    setError(null);
    try {
      const r = await setShopVerticalRequest(shopId, chosen);
      onDone(t('shopVertical.done', { name: nameOf(chosen), n: r.shopsChanged }));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card card-pad stack-s">
      <div className="row-between">
        <div className="card-title">{t('shopVertical.title')}</div>
        <span className="caption">{nameOf(current)}</span>
      </div>
      {isBranch ? <p className="caption" style={{ margin: 0 }}>{t('shopVertical.branch')}</p> : (
        <>
          <p className="caption" style={{ margin: 0 }}>{t('shopVertical.hint')}</p>
          <div className="row">
            <select className="select" value={chosen} disabled={busy || !list.data} onChange={(e) => setChosen(e.target.value)} style={{ maxWidth: 260 }}>
              {verticals.map((v) => <option key={v.key} value={v.key}>{v.label}{v.showAtSignup ? '' : ` (${t('verticals.hidden')})`}</option>)}
            </select>
            <button className="btn" type="button" disabled={busy || chosen === current} onClick={() => void move()}>{busy ? t('common.saving') : t('shopVertical.move')}</button>
          </div>
          {error ? <div className="note-box error" role="alert">{error}</div> : null}
        </>
      )}
    </section>
  );
}
