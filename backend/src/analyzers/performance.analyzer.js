export function calculateOnTimeRate(entregas = []) {
  if (!entregas.length) return 100;
  const onTime = entregas.filter((item) => item.status === 'Entregue' && !item.dtAtraso).length;
  return Number(((onTime / entregas.length) * 100).toFixed(2));
}
