import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useQueryParams } from './useQueryParam';

const QUERY_PARAM_KEY = 'q';
const TEMPOSTACK_PARAM_KEY = 'tempostack';
const NAMESPACE_KEY = 'namespace';

export const useURLState = () => {
  const queryParams = useQueryParams();
  const history = useHistory();
  const location = useLocation();

  const initialQuery = queryParams.get(QUERY_PARAM_KEY);
  const initialTempoStack = queryParams.get(TEMPOSTACK_PARAM_KEY) ?? undefined;
  const initialNamespace = queryParams.get(NAMESPACE_KEY) ?? undefined;

  const [query, setQuery] = React.useState(initialQuery);
  const [tempoStack, setTempoStack] = React.useState<string | undefined>(
    initialTempoStack,
  );
  const [namespace, setNamespace] = React.useState<string | undefined>(
    initialNamespace,
  );

  const setQueryInURL = (newQuery: string) => {
    const trimmedQuery = newQuery.trim();
    queryParams.set(QUERY_PARAM_KEY, trimmedQuery);
    history.push(`${location.pathname}?${queryParams.toString()}`);
  };

  const setTempoStackInURL = (
    selectedNamespace?: string,
    selectedTempoStack?: string,
  ) => {
    if (selectedTempoStack && selectedNamespace) {
      queryParams.set(TEMPOSTACK_PARAM_KEY, selectedTempoStack);
      queryParams.set(NAMESPACE_KEY, selectedNamespace);
    } else {
      queryParams.delete(TEMPOSTACK_PARAM_KEY);
      queryParams.delete(NAMESPACE_KEY);
    }
    history.push(`${location.pathname}?${queryParams.toString()}`);
  };

  React.useEffect(() => {
    const queryValue = queryParams.get(QUERY_PARAM_KEY) ?? initialQuery ?? '';
    const tempoStackValue = queryParams.get(TEMPOSTACK_PARAM_KEY) ?? undefined;
    const namespaceValue = queryParams.get(NAMESPACE_KEY) ?? undefined;

    setQuery(queryValue.trim());
    setTempoStack(tempoStackValue);
    setNamespace(namespaceValue);
  }, [queryParams]);

  return {
    query,
    setQueryInURL,
    tempoStack,
    setTempoStackInURL,
    namespace,
    setNamespace,
  };
};
