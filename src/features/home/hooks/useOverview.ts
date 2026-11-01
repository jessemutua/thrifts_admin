// src/features/home/hooks/useOverview.ts
// Home is the summary of every section. It loads the overview (required) plus the Metrics, Online and App numbers (optional:
// if one of those fails, Home still shows everything else and that card just says it could not load).
import { getAppSettings, getMetrics, getOnline, getOverview } from '../../../core/services/portalRequests';
import { useLoad } from '../../shared/hooks/useLoad';
import type { AppSettings, Metrics, OnlineStores } from '../../../core/types/adminTypes';

async function loadHome() {
  const [overview, metrics, app, online] = await Promise.all([
    getOverview(),
    getMetrics().catch((): Metrics | null => null),
    getAppSettings().catch((): AppSettings | null => null),
    getOnline().catch((): OnlineStores | null => null),
  ]);
  return { overview, metrics, app, online };
}

export function useOverview() {
  const loaded = useLoad(loadHome, []);
  const o = loaded.data?.overview;
  const b = o?.shops.byBucket;
  const needCall = b ? b.grace + b.pilot_ended + b.overdue : 0;
  const moodTotal = o ? o.feedbackLast7Days.happy + o.feedbackLast7Days.okay + o.feedbackLast7Days.unhappy : 0;
  return { ...loaded, needCall, moodTotal };
}
