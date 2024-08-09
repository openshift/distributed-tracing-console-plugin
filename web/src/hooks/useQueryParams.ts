import { useMemo } from 'react';
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
  }, [location.search]);

  const setQueryParams = (params: Record<keyof T, string | undefined>) => {
    const searchParams = new URLSearchParams(location.search);
    for (const [key, val] of Object.entries(params)) {
      if (val === undefined) {
        searchParams.delete(key);
      } else {
        searchParams.set(key, val);
      }
    }
    history.push(`${location.pathname}?${searchParams}`);
  };

  return [queryParams, setQueryParams];
}

export function useQueryParam<T extends string | undefined>(
  name: string,
  defaultValue: T,
): [string | T, (param: string | undefined) => void] {
  const [params, setParams] = useQueryParams({ [name]: defaultValue });
  return [params[name], (val: string | undefined) => setParams({ [name]: val })];
}
