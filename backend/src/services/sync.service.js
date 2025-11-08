import cron from 'node-cron';
import logger from '../utils/logger.utils.js';
import { listCompaniesPage } from '../integrations/acessorias.js';
import { getDatabase } from '../database/connection.js';
import { getSocketServer } from '../websocket/io.js';
import { logSystemEvent } from '../utils/system-events.utils.js';

let scheduledJob;

export function scheduleIncrementalSync(callback) {
  const frequency = process.env.SYNC_FREQUENCY || '*/15 * * * *';

  if (scheduledJob) {
    scheduledJob.stop();
  }

  scheduledJob = cron.schedule(frequency, async () => {
    logger.info('Running scheduled incremental sync');
    if (callback) {
      await callback();
    }
  });

  logger.info('Incremental sync scheduled', { frequency });
}

export async function runInitialSync(handler) {
  const startDate = process.env.SYNC_START_DATE || '2025-11-01';
  logger.info('Running initial sync', { startDate });
  if (handler) {
    await handler({ startDate });
  }
}

function cleanseCNPJ(doc) {
  if (!doc) return null;
  const onlyDigits = String(doc).replace(/\D/g, '');
  if (!onlyDigits) return null;
  return onlyDigits.length >= 11 ? onlyDigits.padStart(14, '0') : onlyDigits;
}

function resolveStatusFlags(status, rawActive) {
  if (typeof rawActive === 'boolean') {
    return rawActive;
  }

  if (typeof status !== 'string') {
    return null;
  }

  return /ativa/i.test(status);
}

export async function syncEmpresas({ full = false } = {}) {
  const db = getDatabase();
  const { Empresa, SyncHistory } = db.models;

  const io = getSocketServer();

  const syncRecord = await SyncHistory.create({
    tipo: 'empresas',
    dtInicio: new Date(),
    status: 'running',
  });

  const summary = {
    processed: 0,
    inserted: 0,
    updated: 0,
    errors: 0,
  };

  let errorCaptured = null;
  let page = 1;

  if (io) {
    io.emit('sync:start', { entity: 'empresas', full });
  }

  try {
    while (true) {
      const companies = await listCompaniesPage(page);

      if (!companies.length) {
        break;
      }

      for (const company of companies) {
        try {
          const externalId =
            company.ID ?? company.Id ?? company.id ?? company.EmpresaID ?? company.empresaId ?? null;
          const identificadorBruto =
            company.Identificador ?? company.identificador ?? company.CNPJ ?? company.cnpj ?? null;
          const chave = externalId ?? identificadorBruto;

          if (!chave) {
            summary.errors += 1;
            logger.warn('Empresa ignorada por ausência de identificador', {
              raw: company,
            });
            continue;
          }

          const cnpjLimpo = cleanseCNPJ(identificadorBruto);
          const razao = company.Razao ?? company.razao ?? company.Nome ?? company.nome ?? null;
          const fantasia = company.Fantasia ?? company.fantasia ?? null;
          const status = company.Status ?? company.status ?? null;
          const ativa = resolveStatusFlags(status, company.Ativa ?? company.ativa ?? null);
          const regimeId = company.RegimeID ?? company.regimeId ?? null;
          const regimeNome = company.RegimeNome ?? company.regimeNome ?? null;
          const cidade = company.Cidade ?? company.cidade ?? null;
          const uf = company.UF ?? company.uf ?? null;
          const telefone = company.Telefone ?? company.telefone ?? null;

          const payload = {
            idExterno: String(chave),
            identificador: identificadorBruto ? String(identificadorBruto).trim() : cnpjLimpo || String(chave),
            cnpj: cnpjLimpo,
            razao: razao || 'Razão social não informada',
            fantasia,
            regimeId,
            regimeNome,
            status,
            ativa,
            cidade,
            uf,
            telefone,
            syncedAt: new Date(),
          };

          const existing = await Empresa.findOne({ where: { idExterno: payload.idExterno } });

          if (existing) {
            await existing.update(payload);
            summary.updated += 1;
          } else {
            await Empresa.create(payload);
            summary.inserted += 1;
          }
        } catch (error) {
          summary.errors += 1;
          logger.error('Failed to upsert empresa', {
            identificador: company?.Identificador ?? company?.identificador ?? null,
            error: error.message,
          });
        } finally {
          summary.processed += 1;
        }
      }

      if (io) {
        io.emit('sync:progress', {
          entity: 'empresas',
          processed: summary.processed,
          total: summary.processed,
        });
      }

      if (!full) {
        break;
      }

      page += 1;
    }

    await syncRecord.update({
      dtFim: new Date(),
      status: 'success',
      registrosProcessados: summary.processed,
      registrosNovos: summary.inserted,
      registrosAtualizados: summary.updated,
    });

    await logSystemEvent({
      level: 'info',
      category: 'sync',
      message: 'Sincronização de empresas concluída',
      details: summary,
    });
  } catch (error) {
    errorCaptured = error;
    await syncRecord.update({
      dtFim: new Date(),
      status: 'error',
      erroMsg: error.message,
      registrosProcessados: summary.processed,
      registrosNovos: summary.inserted,
      registrosAtualizados: summary.updated,
    });

    await logSystemEvent({
      level: 'error',
      category: 'sync',
      message: 'Sincronização de empresas falhou',
      details: { ...summary, error: error.message },
    });
  } finally {
    if (io) {
      io.emit('sync:end', {
        entity: 'empresas',
        ...summary,
        status: errorCaptured ? 'error' : 'success',
        error: errorCaptured ? errorCaptured.message : null,
      });
    }
  }

  if (errorCaptured) {
    throw errorCaptured;
  }

  return summary;
}
