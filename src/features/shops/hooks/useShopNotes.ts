// src/features/shops/hooks/useShopNotes.ts
// Adding and removing Chief's notes on a shop. The list itself comes with the shop page (useShopDetail).
import { useState } from 'react';
import { addNoteRequest, deleteNoteRequest } from '../../../core/services/portalRequests';
import { errorText } from '../../shared/hooks/useLoad';

export const NOTE_MAX = 1000; // same as reja src/services/adminActionRules.js

export function useShopNotes(shopId: string, afterChange: () => void) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(call: () => Promise<unknown>, clear: boolean) {
    setBusy(true);
    setError(null);
    try {
      await call();
      if (clear) setDraft('');
      afterChange();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  const canAdd = draft.trim().length > 0 && draft.trim().length <= NOTE_MAX && !busy;
  const add = () => { if (canAdd) void run(() => addNoteRequest(shopId, draft.trim()), true); };
  const remove = (noteId: string) => void run(() => deleteNoteRequest(noteId), false);
  return { draft, setDraft, canAdd, add, remove, busy, error };
}
