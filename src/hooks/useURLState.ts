import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useQueryParams } from './useQueryParam';

const QUERY_PARAM_KEY = 'q';
const LOKISTACK_PARAM_KEY = 'lokistack';
const NAMESPACE_KEY = 'namespace';

export const useURLState = () => {
  const queryParams = useQueryParams();
  const history = useHistory();
  const location = useLocation();

  const initialQuery = queryParams.get(QUERY_PARAM_KEY);
  const initialLokiStack = queryParams.get(LOKISTACK_PARAM_KEY) ?? undefined;
  const initialNamespace = queryParams.get(NAMESPACE_KEY) ?? undefined;

  const [query, setQuery] = React.useState(initialQuery);
  const [lokiStack, setLokiStack] = React.useState<string | undefined>(
    initialLokiStack,
  );
  const [namespace, setNamespace] = React.useState<string | undefined>(
    initialNamespace,
  );

  const setQueryInURL = (newQuery: string) => {
    const trimmedQuery = newQuery.trim();
    queryParams.set(QUERY_PARAM_KEY, trimmedQuery);
    history.push(`${location.pathname}?${queryParams.toString()}`);
  };

  const setLokiStackInURL = (
    selectedLokiStack?: string,
    selectedNamespace?: string,
  ) => {
    if (selectedLokiStack && selectedNamespace) {
      queryParams.set(LOKISTACK_PARAM_KEY, selectedLokiStack);
      queryParams.set(NAMESPACE_KEY, selectedNamespace);
    } else {
      queryParams.delete(LOKISTACK_PARAM_KEY);
      queryParams.delete(NAMESPACE_KEY);
    }
    history.push(`${location.pathname}?${queryParams.toString()}`);
  };

  React.useEffect(() => {
    const queryValue = queryParams.get(QUERY_PARAM_KEY) ?? initialQuery ?? '';
    const lokiStackValue = queryParams.get(LOKISTACK_PARAM_KEY) ?? undefined;
    const namespaceValue = queryParams.get(NAMESPACE_KEY) ?? undefined;

    setQuery(queryValue.trim());
    setLokiStack(lokiStackValue);
    setNamespace(namespaceValue);
  }, [queryParams]);

  return {
    query,
    setQueryInURL,
    lokiStack,
    setLokiStackInURL,
    namespace,
    setNamespace,
  };
};
