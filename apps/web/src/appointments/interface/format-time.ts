/**
 * Formats an appointment start as a stable HH:MM label (UTC) for the time rail.
 * UTC keeps rendering deterministic across environments and tests; locale-aware
 * formatting can replace this once a per-tenant timezone is introduced.
 */
export function formatTime(startsAt: Date): string {
  return startsAt.toISOString().slice(11, 16);
}
