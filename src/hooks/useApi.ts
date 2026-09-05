import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi<T>(
  apiFunction: () => Promise<T>,
  immediate = true,
  deps: unknown[] = []
) {
  const apiFunctionRef = useRef(apiFunction);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFunctionRef.current = apiFunction;
  }, [apiFunction]);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunctionRef.current();
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, execute, ...deps]);

  return { data, loading, error, execute, setData };
}