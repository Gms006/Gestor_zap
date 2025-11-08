import { format } from '../utils/format.utils.js';

export function buildDailyReport({ empresas = [], entregas = [], processos = [], boletos = [] }) {
  return [
    `📊 RESUMO DO DIA - ${format.date(new Date())}`,
    '',
    `🏢 EMPRESAS ATIVAS: ${empresas.length}`,
    `📋 ENTREGAS PENDENTES: ${entregas.filter((e) => e.status !== 'Entregue').length}`,
    `⚙️ PROCESSOS ATIVOS: ${processos.filter((p) => p.status === 'A').length}`,
    `💰 BOLETOS PENDENTES: ${boletos.filter((b) => b.status === 'P').length}`,
  ].join('\n');
}
