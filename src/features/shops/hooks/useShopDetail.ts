// src/features/shops/hooks/useShopDetail.ts
// Everything the shop page shows (the shop, its plan history, Chief's notes), loaded together, and the actions
// that change it. After any action the page reloads, so what is shown is always what the server holds.
import { useCallback } from 'react';
import { getNotes, getShop, getShopHistory } from '../../../core/services/portalRequests';
import { useLoad } from '../../shared/hooks/useLoad';

export function useShopDetail(shopId: string) {
  const loaded = useLoad(async () => {
    const [detail, history, notes] = await Promise.all([getShop(shopId), getShopHistory(shopId), getNotes(shopId)]);
    return { detail, history: history.history, notes: notes.notes };
  }, [shopId]);
  const reload = loaded.reload;
  const afterChange = useCallback(() => reload(), [reload]);
  return { ...loaded, afterChange };
}
