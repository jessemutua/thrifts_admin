// src/features/people/hooks/usePeopleSearch.ts
// Finds accounts by email or name (password and Google-only accounts both). The search lives in the address
// (/people?q=...), so the shop page can link straight to a person.
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPeople } from '../../../core/services/portalRequests';
import { useLoad } from '../../shared/hooks/useLoad';

export function usePeopleSearch() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const loaded = useLoad(() => getPeople(q), [q]);
  const setQ = useCallback((v: string) => setParams(v ? { q: v } : {}, { replace: true }), [setParams]);
  return { ...loaded, q, setQ };
}
