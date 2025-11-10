const TIME_ZONE = 'America/Sao_Paulo';
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toDate(val) {
  if (!val) return null;
  const d = val instanceof Date ? new Date(val.getTime()) : new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function nowTz() {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now).reduce((acc, part) => {
      if (part.type !== 'literal') acc[part.type] = part.value;
      return acc;
    }, {});
    const { year, month, day, hour, minute, second } = parts;
    const utcMillis = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
    );
    // Ajusta usando offset do fuso alvo no instante atual
    const sameInstant = new Date(now);
    const offsetMinutes = (sameInstant.getTime() - utcMillis) / 60000;
    return new Date(utcMillis + offsetMinutes * 60000);
  } catch (err) {
    return new Date();
  }
}

export function daysBetween(a, b) {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return null;
  return Math.floor(Math.abs(db.getTime() - da.getTime()) / MS_PER_DAY);
}

export function percentile(arr, p) {
  const xs = (arr || [])
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (!xs.length) return null;
  if (p <= 0) return xs[0];
  if (p >= 100) return xs[xs.length - 1];
  const rank = (p / 100) * (xs.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return xs[low];
  const f = rank - low;
  return xs[low] * (1 - f) + xs[high] * f;
}
