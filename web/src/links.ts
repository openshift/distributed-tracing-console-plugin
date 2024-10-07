// note: this file must be kept in sync with the route definitions in TracingUI.tsx
// in the future, adjust the links based on admin console vs dev console

export function linkToTraceDetailPage(traceId: string) {
  // by capturing the entire URL search params, we can provide a breadcrumb to the previous page with the Tempo instance and query filled out
  return `/observe/traces/${traceId}?${new URLSearchParams(window.location.search).toString()}`;
}
