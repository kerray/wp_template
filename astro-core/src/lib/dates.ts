/**
 * Date helpers (generic, build-time).
 *
 * Czech month names, school-year bucketing (Sept 1 → Aug 31) and ICS timestamp
 * formatting. Sites that need locale-specific display extend these in their own
 * lib; the pieces here are engine-agnostic and reused across collections.
 */

export const CZECH_MONTHS: Record<string, string> = {
  '01': 'Leden', '02': 'Únor', '03': 'Březen', '04': 'Duben',
  '05': 'Květen', '06': 'Červen', '07': 'Červenec', '08': 'Srpen',
  '09': 'Září', '10': 'Říjen', '11': 'Listopad', '12': 'Prosinec',
};

/** Coerce a feed timestamp field (unix seconds, possibly '' or string) to number|null. */
export function toTs(v: number | string | undefined): number | null {
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : null;
}

/** Unix-seconds -> Date. */
export function tsToDate(ts: number): Date {
  return new Date(ts * 1000);
}

/**
 * School year label for a unix-seconds timestamp, e.g. 1700000000 -> "2023-2024".
 * School year runs Sept 1 → Aug 31.
 */
export function schoolYearOf(ts: number): string {
  const d = tsToDate(ts);
  const start = d.getMonth() + 1 >= 9 ? d.getFullYear() : d.getFullYear() - 1;
  return `${start}-${start + 1}`;
}

/** ICS UTC timestamp (YYYYMMDDTHHMMSSZ) from unix seconds. */
export function toIcsUtc(ts: number): string {
  return tsToDate(ts).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** ICS all-day date (YYYYMMDD) from unix seconds. */
export function toIcsDate(ts: number): string {
  const d = tsToDate(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
}
