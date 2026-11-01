// src/features/metrics/hooks/useMetrics.ts
// The Metrics page's data (GET /admin/metrics) and its "Copy summary" button.
import { useState } from 'react';
import { getMetrics } from '../../../core/services/portalRequests';
import { metricsSummary } from '../../../core/rules/metricsSummary';
import { useLoad } from '../../shared/hooks/useLoad';

export function useMetrics() {
  const loaded = useLoad(getMetrics, []);
  const [copied, setCopied] = useState(false);
  async function copySummary() {
    if (!loaded.data) return;
    try {
      await navigator.clipboard.writeText(metricsSummary(loaded.data));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }
  return { ...loaded, copySummary, copied };
}
