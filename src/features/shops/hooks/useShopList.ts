// src/features/shops/hooks/useShopList.ts
// The shop list's search, filter, sort and page live in the address (/shops?q=..&bucket=..&sort=..&page=..),
// so Back returns to the same view and a filtered list can be bookmarked or linked from Home.
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getShops } from '../../../core/services/portalRequests';
import { isBucket } from '../../../core/rules/planRules';
import { useLoad } from '../../shared/hooks/useLoad';

export function useShopList() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const bucketParam = params.get('bucket');
  const bucket = isBucket(bucketParam) ? bucketParam : '';
  const sort = params.get('sort') === 'name' ? 'name' : 'newest';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const testOnly = params.get('test') === 'only'; // test shops are listed only when asked for

  const loaded = useLoad(() => getShops({ q, bucket, sort, page, testOnly }), [q, bucket, sort, page, testOnly]);

  // Changing the search, filter or sort goes back to page 1
  const update = useCallback((changes: Record<string, string>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(changes)) {
        if (v) next.set(k, v); else next.delete(k);
      }
      if (!('page' in changes)) next.delete('page');
      return next;
    }, { replace: !('page' in changes) });
  }, [setParams]);

  return {
    ...loaded,
    q, bucket, sort, page, testOnly,
    setQ: useCallback((v: string) => update({ q: v }), [update]),
    setBucket: (v: string) => update({ bucket: v, test: '' }),
    showTestShops: () => update({ test: 'only', bucket: '' }),
    setSort: (v: string) => update({ sort: v === 'name' ? 'name' : '' }),
    setPage: (n: number) => update({ page: n > 1 ? String(n) : '' }),
  };
}
