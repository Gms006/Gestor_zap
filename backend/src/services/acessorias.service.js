// backend/src/services/acessorias.service.js
import axios from 'axios';
import acessoriasConfig from '../config/acessorias.config.js';
import logger from '../utils/logger.utils.js';

const api = axios.create({
  baseURL: acessoriasConfig.baseURL,
  timeout: acessoriasConfig.timeout,
});

api.interceptors.request.use((cfg) => {
  cfg.headers = { ...cfg.headers, ...acessoriasConfig.headers() };
  return cfg;
});

// A Acessórias entrega 20 por página no ListAll
export const REMOTE_PAGE_SIZE = 20;

function normalizeCompany(company = {}) {
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

async function fetchRemotePage(remotePage = 1) {
  const { data } = await api.get('/companies/ListAll', { params: { Pagina: remotePage } });
  const arr = Array.isArray(data?.Empresas) ? data.Empresas
            : Array.isArray(data) ? data
            : Array.isArray(data?.data) ? data.data
            : [];
  return arr.map(normalizeCompany).filter(x => x.identificador);
}

// Adapter de paginação para consumo “paginado” no /api/empresas se precisar
export async function fetchEmpresas({ page = 1, perPage = 10, q = '' } = {}) {
  const startIndex = (page - 1) * perPage;
  const remoteStart = Math.floor(startIndex / REMOTE_PAGE_SIZE) + 1;
  const offset = startIndex % REMOTE_PAGE_SIZE;

  let bucket = await fetchRemotePage(remoteStart);
  // Puxa páginas remotas suficientes pra cobrir perPage
  while (bucket.length < offset + perPage) {
    const nextRemote = remoteStart + Math.ceil((bucket.length - offset) / REMOTE_PAGE_SIZE);
    const extra = await fetchRemotePage(nextRemote);
    if (!extra.length) break;
    bucket = bucket.concat(extra);
  }

  let slice = bucket.slice(offset, offset + perPage);
  if (q) {
    const k = q.toLowerCase();
    slice = slice.filter(c =>
      (c.razao || '').toLowerCase().includes(k) ||
      (c.fantasia || '').toLowerCase().includes(k) ||
      (c.identificador || '').toLowerCase().includes(k)
    );
  }

  return {
    data: slice,
    items: slice,
    pagination: {
      page,
      perPage,
      total: undefined,       // API não fornece total; pode calcular via full sync
      totalPages: undefined,  // idem
      hasNext: bucket.length === offset + perPage,
    },
  };
}

export default api;
