// backend/src/services/sync.service.js
import { getDatabase } from '../database/connection.js';
import logger from '../utils/logger.utils.js';
import { fetchEmpresas as fetchPaged, REMOTE_PAGE_SIZE } from './acessorias.service.js';
import axios from 'axios';
import acessoriasConfig from '../config/acessorias.config.js';

const api = axios.create({
  baseURL: acessoriasConfig.baseURL,
  timeout: acessoriasConfig.timeout,
});
api.interceptors.request.use((cfg) => {
  cfg.headers = { ...cfg.headers, ...acessoriasConfig.headers() };
  return cfg;
});

// Busca página crua direto do endpoint remoto (otimiza loop do sync)
async function fetchRemoteListPage(page = 1) {
  const { data } = await api.get('/companies/ListAll', { params: { Pagina: page } });
  const items = Array.isArray(data?.Empresas) ? data.Empresas
              : Array.isArray(data) ? data
              : Array.isArray(data?.data) ? data.data
              : [];
  return items;
}

function normalizeForDb(company = {}) {
  const end = company?.Endereco || company?.endereco || {};
  const identificador =
    company.Identificador ?? company.identificador ?? company.CNPJ ?? company.cnpj ?? null;

  return {
    identificador,
    razao: company.Razao ?? company.RazaoSocial ?? company.razao ?? company.razao_social ?? '',
    fantasia: company.Fantasia ?? company.NomeFantasia ?? company.fantasia ?? company.nome_fantasia ?? null,
    regimeId: company?.Regime?.ID ?? company?.RegimeID ?? company?.regime_id ?? null,
    regimeNome: company?.Regime?.Nome ?? company?.RegimeNome ?? company?.regime_nome ?? null,
    cidade: end.Cidade ?? company.Cidade ?? null,
    uf: end.UF ?? company.UF ?? null,
    ativa:
      typeof company.Ativa === 'boolean'
        ? company.Ativa
        : typeof company.ativa === 'boolean'
        ? company.ativa
        : true,
  };
}

export async function syncEmpresas({ full = false } = {}) {
  const db = getDatabase();
  const { Empresa } = db.models;

  let page = 1;
  let imported = 0;
  let updated = 0;
  let pages = 0;

  try {
    do {
      const raw = await fetchRemoteListPage(page);
      pages += 1;

      if (!raw.length) break;

      // Upsert em bloco
      for (const r of raw) {
        const rec = normalizeForDb(r);
        if (!rec.identificador) continue;

        const found = await Empresa.findOne({ where: { identificador: rec.identificador } });
        if (found) {
          await found.update(rec);
          updated += 1;
        } else {
          await Empresa.create(rec);
          imported += 1;
        }
      }

      // Se não for "full", só puxa a primeira página
      if (!full) break;

      page += 1;
    } while (true);

    logger.info('Sync empresas concluído', { pages, imported, updated, full });
    return { ok: true, pages, imported, updated, full };
  } catch (err) {
    logger.error('Sync empresas falhou', { error: err?.message });
    return { ok: false, error: err?.message, pages, imported, updated, full };
  }
}
