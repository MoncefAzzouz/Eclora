'use client';

export { useAsyncData as useApi } from '@/lib/useAsyncData';

/** Notifies layout-level widgets (sidebar badges, bell) that counts may have changed. */
export function emitDataChanged() {
  window.dispatchEvent(new Event('eclora:data-changed'));
}

/** Reads a query-string value on the client (avoids useSearchParams' Suspense requirement). */
export function readQueryParam(name: string): string | null {
  return typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(name);
}
