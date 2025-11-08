export function simpleMovingAverage(data = [], window = 3) {
  if (data.length < window) return [];
  const result = [];
  for (let i = window - 1; i < data.length; i += 1) {
    const slice = data.slice(i - window + 1, i + 1);
    const average = slice.reduce((sum, value) => sum + value, 0) / window;
    result.push(Number(average.toFixed(2)));
  }
  return result;
}
