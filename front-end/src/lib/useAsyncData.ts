'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface State<T> {
  key: string | null;
  data: T | null;
  error: string | null;
}

/**
 * Loads data and exposes `reload` for after mutations.
 * `deps` works like a useEffect dependency list: when it changes, data is refetched.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const key = JSON.stringify(deps);
  const [state, setState] = useState<State<T>>({ key: null, data: null, error: null });
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const run = useCallback(async (k: string) => {
    try {
      const data = await fetcherRef.current();
      setState({ key: k, data, error: null });
    } catch (e) {
      setState({ key: k, data: null, error: e instanceof Error ? e.message : 'Erreur inconnue' });
    }
  }, []);

  useEffect(() => {
    run(key);
  }, [key, run]);

  const reload = useCallback(() => run(key), [run, key]);

  return {
    data: state.key === key ? state.data : null,
    error: state.key === key ? state.error : null,
    loading: state.key !== key,
    reload,
  };
}
