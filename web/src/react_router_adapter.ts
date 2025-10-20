import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import { QueryParamAdapterComponent } from 'use-query-params';

export const ReactRouterAdapter: QueryParamAdapterComponent = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return children({
    location,
    push: ({ search, state }) => navigate({ search }, { state }),
    replace: ({ search, state }) => navigate({ search }, { replace: true, state }),
  });
};
