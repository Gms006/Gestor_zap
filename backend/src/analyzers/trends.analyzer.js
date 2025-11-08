export function calculateTrend(values = []) {
  if (values.length < 2) return 0;
  const first = values[0];
  const last = values[values.length - 1];
  return Number((((last - first) / Math.max(first, 1)) * 100).toFixed(2));
}
