import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useQueryParams } from './useQueryParam';

const QUERY_PARAM_KEY = 'q';
const LOKISTACK_PARAM_KEY = 'lokistack';

export const useURLState = () => {
  const queryParams = useQueryParams();
  const history = useHistory();
  const location = useLocation();

  const initialQuery = queryParams.get(QUERY_PARAM_KEY);
  const initialLokiStack = queryParams.get(LOKISTACK_PARAM_KEY) ?? undefined;

  const [query, setQuery] = React.useState(initialQuery);
  const [lokiStack, setLokiStack] = React.useState<string | undefined>(
    initialLokiStack,
  );

  const setQueryInURL = (newQuery: string) => {
    const trimmedQuery = newQuery.trim();
    queryParams.set(QUERY_PARAM_KEY, trimmedQuery);
    history.push(`${location.pathname}?${queryParams.toString()}`);
  };

  const setLokiStackInURL = (selectedLokiStack?: string) => {
    console.log(selectedLokiStack);
    if (selectedLokiStack) {
      queryParams.set(LOKISTACK_PARAM_KEY, selectedLokiStack);
    } else {
      queryParams.delete(LOKISTACK_PARAM_KEY);
    }
    history.push(`${location.pathname}?${queryParams.toString()}`);
  };

  React.useEffect(() => {
    const queryValue = queryParams.get(QUERY_PARAM_KEY) ?? initialQuery ?? '';
    const lokiStackValue = queryParams.get(LOKISTACK_PARAM_KEY) ?? undefined;

    setQuery(queryValue.trim());
    setLokiStack(lokiStackValue);
  }, [queryParams]);

  return {
    query,
    setQueryInURL,
    lokiStack,
    setLokiStackInURL,
  };
};
