// src/features/shared/hooks/useLoad.ts
// Loads data for a screen and tracks its state: loading, the data, or the error message, plus reload().
// A reload keeps the old data on screen while the new data comes, so nothing flickers.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../core/services/portalApi';

export type Loaded<T> = { data: T | null; error: string | null; loading: boolean; reload: () => void };

export function useLoad<T>(load: () => Promise<T>, deps: unknown[]): Loaded<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const latest = useRef(0);

  useEffect(() => {
    const call = ++latest.current; // only the newest request may update the screen
    setLoading(true);
    setError(null);
    load()
      .then((value) => { if (call === latest.current) setData(value); })
      .catch((err: unknown) => {
        if (call !== latest.current) return;
        setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
      })
      .finally(() => { if (call === latest.current) setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { data, error, loading, reload };
}

// The message to show for any failed action
export function errorText(err: unknown): string {
  if (err instanceof ApiError) return err.details.length > 1 ? err.details.join(' ') : err.message;
  return 'Something went wrong. Try again.';
}
