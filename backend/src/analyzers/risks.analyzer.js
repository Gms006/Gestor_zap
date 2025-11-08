export function buildRiskScore({ entregasAtrasadas = 0, processosAtrasados = 0, boletosVencidos = 0 }) {
  return entregasAtrasadas * 2 + processosAtrasados * 3 + boletosVencidos;
}
