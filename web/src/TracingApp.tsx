import React, { ReactNode } from 'react';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouterAdapter } from './react_router_adapter';

interface TracingAppProps {
  children: ReactNode;
}

export function TracingApp({ children }: TracingAppProps) {
  return <QueryParamProvider adapter={ReactRouterAdapter}>{children}</QueryParamProvider>;
}
