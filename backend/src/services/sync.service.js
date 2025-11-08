import cron from 'node-cron';
import logger from '../utils/logger.utils.js';
import { fetchEmpresas } from './acessorias.service.js';
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

function mapCompanyPayload(company) {
  return {
    identificador: company.identificador,
    razao: company.razao,
    fantasia: company.fantasia,
    regimeId: company.regimeId,
    regimeNome: company.regimeNome,
    ativa: company.ativa,
    dtCadastro: company.dtCadastro || null,
    dtCliDesde: company.dtCliDesde || null,
    dtCliAte: company.dtCliAte || null,
    dtAbertura: company.dtAbertura || null,
    inscricaoMunicipal: company.inscricaoMunicipal || null,
    endereco: company.endereco || null,
    cidade: company.cidade || null,
    uf: company.uf || null,
    telefone: company.telefone || null,
    syncedAt: new Date(),
  };
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

  const paginationState = {
    page: 1,
    perPage: Number(process.env.SYNC_PAGE_SIZE || 50),
    total: 0,
    totalPages: 1,
  };

  let errorCaptured = null;

  if (io) {
    io.emit('sync:start', { entity: 'empresas', full });
  }

  try {
    let hasMore = true;

    while (hasMore) {
      const { data, pagination } = await fetchEmpresas({
        page: paginationState.page,
        perPage: paginationState.perPage,
      });

      paginationState.total = pagination?.total || paginationState.total;
      paginationState.totalPages = pagination?.totalPages || paginationState.totalPages;

      for (const company of data) {
        try {
          if (!company.identificador) {
            summary.errors += 1;
            continue;
          }

          const payload = mapCompanyPayload(company);
          const upsertResult = await Empresa.upsert(payload, {
            returning: true,
          });
          const created = Array.isArray(upsertResult) ? upsertResult[1] : false;

          if (created) {
            summary.inserted += 1;
          } else {
            summary.updated += 1;
          }
        } catch (error) {
          summary.errors += 1;
          logger.error('Failed to upsert empresa', {
            identificador: company.identificador,
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
          total: paginationState.total || summary.processed,
        });
      }

      if (!full) {
        break;
      }

      paginationState.page += 1;

      const totalPagesCalculated = paginationState.totalPages ||
        (paginationState.total && paginationState.perPage
          ? Math.ceil(paginationState.total / paginationState.perPage)
          : paginationState.page);

      hasMore =
        paginationState.page <= totalPagesCalculated &&
        data.length === paginationState.perPage;
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
