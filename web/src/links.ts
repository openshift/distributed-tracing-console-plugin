// Note: this file must be kept in sync with the route definitions in console-extensions.json

export function linkToTraceDetailPage(traceId: string) {
  // by capturing the entire URL search params, we can provide a breadcrumb to the previous page with the Tempo instance and query filled out
  return `/observe/traces/${traceId}?${new URLSearchParams(window.location.search).toString()}`;
}
