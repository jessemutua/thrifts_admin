// src/features/online/hooks/useOnlineStores.ts
// The Online Stores tab's data (GET /admin/online), and the words for each traffic source and shopper group.
import { getOnline } from '../../../core/services/portalRequests';
import { useLoad } from '../../shared/hooks/useLoad';
import { t, type TextKey } from '../../../text/portalText';

export function sourceLabel(key: string): string {
  const k = `source.${key}` as TextKey;
  const text = t(k);
  return text === k ? key : text;
}

export function genderLabel(key: string): string {
  const k = `gender.${key}` as TextKey;
  const text = t(k);
  return text === k ? key : text;
}

export function useOnlineStores() {
  return useLoad(getOnline, []);
}
