// src/features/feedback/hooks/useFeedbackList.ts
// The daily "how was today?" answers across all shops, for the last 7, 30 or 90 days.
import { useState } from 'react';
import { getFeedback } from '../../../core/services/portalRequests';
import { useLoad } from '../../shared/hooks/useLoad';

export const RANGES = [7, 30, 90] as const;

export function useFeedbackList() {
  const [days, setDays] = useState<number>(30);
  const loaded = useLoad(() => getFeedback(days), [days]);
  const totals = loaded.data?.totals;
  const answered = totals ? totals.happy + totals.okay + totals.unhappy : 0;
  return { ...loaded, days, setDays, answered };
}
