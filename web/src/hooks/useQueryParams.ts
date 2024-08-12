import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

// minimal implementation of https://www.npmjs.com/package/use-query-params
export function useQueryParams<T extends Record<string, string | undefined>>(
  paramsConfig: T,
): [{ [K in keyof T]: string | T[K] }, (params: { [K in keyof T]: string | undefined }) => void] {
  const location = useLocation();
  const history = useHistory();

  const queryParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const params = Object.entries(paramsConfig).map(([name, defaultValue]) => [
      name,
      searchParams.get(name) ?? defaultValue,
    ]);
    return Object.fromEntries(params);
  }, [location.search, paramsConfig]);

  const setQueryParams = useCallback(
    (params: Record<keyof T, string | undefined>) => {
      // use history.location here to not create a new instance of this function for every location change
      const searchParams = new URLSearchParams(history.location.search);
      for (const [key, val] of Object.entries(params)) {
        if (val === undefined) {
          searchParams.delete(key);
        } else {
          searchParams.set(key, val);
        }
      }
      history.push(`${location.pathname}?${searchParams}`);
    },
    [history, location.pathname],
  );

  return [queryParams, setQueryParams];
}

export function useQueryParam<T extends string | undefined>(
  name: string,
  defaultValue: T,
): [string | T, (param: string | undefined) => void] {
  const paramsConfig = useMemo(() => {
    return { [name]: defaultValue };
  }, [name, defaultValue]);

  const [params, setParams] = useQueryParams(paramsConfig);
  const setParam = useCallback(
    (val: string | undefined) => setParams({ [name]: val }),
    [setParams, name],
  );

  return [params[name], setParam];
}
