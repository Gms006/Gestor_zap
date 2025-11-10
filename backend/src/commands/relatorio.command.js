import { buildDailyReport } from '../reporters/daily.reporter.js';

export default function registerRelatorioCommand(register) {
  register('/relatorio', async (params, context) => {
    const tipo = params[0] || 'geral';
    if (tipo !== 'geral') {
      return `⚠️ Relatório '${tipo}' ainda não implementado.`;
    }
    return buildDailyReport(context);
  });
}
