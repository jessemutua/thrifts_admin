// src/features/shops/hooks/useShopActions.ts
// The forms behind the shop page's buttons: set a pilot end date, record a payment, suspend or lift.
// Each checks what is typed before sending, shows the server's message if it refuses, and calls done() on success.
import { useState } from 'react';
import { deleteShopRequest, liftRequest, markPaidRequest, setPilotRequest, setTestShopRequest, suspendRequest } from '../../../core/services/portalRequests';
import { kenyaDateInput } from '../../../core/rules/formatRules';
import { looksLikeMpesaCode } from '../../../core/rules/planRules';
import { errorText } from '../../shared/hooks/useLoad';
import { ApiError } from '../../../core/services/portalApi';
import { t } from '../../../text/portalText';

const MONTHLY_PRICE_KES = 2000; // same as reja src/services/subscriptionRules.js

// Shared: sending state and the error message
function useSend(done: (message: string) => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function send(call: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError(null);
    try {
      await call();
      done(message);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, setError, send };
}

// Pilot: an end date (today to a year ahead), defaults to 30 days from today, plus an optional note
export function usePilotForm(shopId: string, currentEnd: string | null, done: (m: string) => void) {
  const min = kenyaDateInput();
  const max = kenyaDateInput(new Date(), 366);
  const current = currentEnd && new Date(currentEnd).getTime() > Date.now() ? kenyaDateInput(new Date(currentEnd)) : '';
  const [endsOn, setEndsOn] = useState(current || kenyaDateInput(new Date(), 30));
  const [note, setNote] = useState('');
  const s = useSend(done);
  const valid = endsOn >= min && endsOn <= max;
  const submit = () => valid && s.send(
    () => setPilotRequest(shopId, { endsOn, note: note.trim() || undefined }),
    t('pilot.done'),
  );
  return { endsOn, setEndsOn, note, setNote, min, max, valid, submit, busy: s.busy, error: s.error };
}

// Payment: months (1 to 12), the M-Pesa code (required, it stops the same payment being counted twice),
// the amount received (blank = the price), and a note
export function usePaidForm(shopId: string, done: (m: string) => void) {
  const [months, setMonths] = useState(1);
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const s = useSend(done);

  const expected = months * MONTHLY_PRICE_KES;
  const amountNum = amount.trim() === '' ? null : Number(amount.replace(/[,\s]/g, ''));
  const amountBad = amountNum !== null && (!Number.isInteger(amountNum) || amountNum < 0);
  const ref = reference.trim().toUpperCase();
  const refShort = ref.length < 2;
  const refOdd = !refShort && !looksLikeMpesaCode(ref);
  const amountOff = amountNum !== null && !amountBad && amountNum !== expected;
  const valid = !refShort && !amountBad && months >= 1 && months <= 12;

  const submit = () => valid && s.send(async () => {
    const r = await markPaidRequest(shopId, {
      months, reference: ref, amountKes: amountNum ?? undefined, note: note.trim() || undefined,
    });
    // The server answers a code it has already used as a success with duplicate: true. Nothing changed: say so.
    if (r.duplicate) throw new ApiError(409, t('paid.duplicate'));
  }, t('paid.done'));

  return {
    months, setMonths, reference, setReference, amount, setAmount, note, setNote,
    expected, amountBad, amountOff, refShort, refOdd, valid, submit, busy: s.busy, error: s.error,
  };
}

// Suspend or lift, with an optional reason
export function useSuspendForm(shopId: string, suspended: boolean, done: (m: string) => void) {
  const [reason, setReason] = useState('');
  const s = useSend(done);
  const submit = () => s.send(
    () => (suspended ? liftRequest(shopId, reason.trim() || undefined) : suspendRequest(shopId, reason.trim() || undefined)),
    suspended ? t('suspend.liftDone') : t('suspend.done'),
  );
  return { reason, setReason, submit, busy: s.busy, error: s.error };
}

// Delete shop (for test shops): the exact shop name must be typed, the same rule the server checks.
// Capitals and spaces at the ends do not matter. Cannot be undone.
export function useDeleteShopForm(shopId: string, shopName: string, done: (m: string) => void) {
  const [typed, setTyped] = useState('');
  const s = useSend(done);
  const matches = typed.trim().toLowerCase() === shopName.trim().toLowerCase() && shopName.trim() !== '';
  const submit = () => matches && s.send(() => deleteShopRequest(shopId, typed.trim()), t('delete.done', { name: shopName }));
  return { typed, setTyped, matches, submit, busy: s.busy, error: s.error };
}

// Mark or unmark a test shop (its branches follow). One click, no form: it changes no data, only what the portal counts.
export function useTestShopToggle(shopId: string, isTest: boolean, done: (m: string) => void) {
  const s = useSend(done);
  const toggle = () => s.send(() => setTestShopRequest(shopId, !isTest), isTest ? t('test.unmarked') : t('test.marked'));
  return { toggle, busy: s.busy, error: s.error };
}
