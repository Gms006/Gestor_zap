import axios from 'axios';
import acessoriasConfig from '../config/acessorias.config.js';
import logger from '../utils/logger.utils.js';
import { emitAlert, logSystemEvent } from '../utils/system-events.utils.js';

const api = axios.create({
  baseURL: acessoriasConfig.baseURL,
  timeout: acessoriasConfig.timeout,
});

api.interceptors.request.use((config) => {
  const headers = acessoriasConfig.headers();
  config.headers = { ...config.headers, ...headers };
  return config;
});

function normalizeCompany(company) {
  const identificador =
    company?.Identificador ||
    company?.identificador ||
    company?.CNPJ ||
    company?.cnpj ||
    null;

  const regimeNome =
    company?.Regime?.Nome ||
    company?.RegimeNome ||
    company?.regime_nome ||
    company?.regimeNome ||
    null;

  const regimeId =
    company?.Regime?.ID ||
    company?.RegimeID ||
    company?.regime_id ||
    company?.regimeId ||
    null;

  const endereco = company?.Endereco || company?.endereco || {};

  return {
    identificador,
    razao:
      company?.Razao ||
      company?.razao ||
      company?.RazaoSocial ||
      company?.razao_social ||
      '',
    fantasia:
      company?.Fantasia || company?.fantasia || company?.NomeFantasia || company?.nome_fantasia || null,
    regimeId,
    regimeNome,
    ativa:
      typeof company?.Ativa === 'boolean'
        ? company.Ativa
        : typeof company?.ativa === 'boolean'
        ? company.ativa
        : true,
    dtCadastro: company?.DtCadastro || company?.dt_cadastro || null,
    dtCliDesde: company?.DtCliDesde || company?.dt_cli_desde || null,
    dtCliAte: company?.DtCliAte || company?.dt_cli_ate || null,
    dtAbertura: company?.DtAbertura || company?.dt_abertura || null,
    inscricaoMunicipal:
      company?.InscricaoMunicipal || company?.inscricao_municipal || endereco?.InscricaoMunicipal || null,
    endereco: endereco?.Logradouro || endereco?.logradouro || company?.EnderecoCompleto || company?.endereco || null,
    cidade: endereco?.Cidade || endereco?.cidade || company?.Cidade || company?.cidade || null,
    uf: endereco?.UF || endereco?.uf || company?.UF || company?.uf || null,
    telefone: company?.Telefone || company?.telefone || null,
  };
}

function extractCompanies(payload) {
  if (!payload) {
    return [];
  }

  const candidates =
    payload?.Empresas ||
    payload?.empresas ||
    payload?.data ||
    payload?.Data ||
    payload?.items ||
    payload;

  if (Array.isArray(candidates)) {
    return candidates.map(normalizeCompany).filter((item) => item.identificador);
  }

  if (Array.isArray(candidates?.Empresas)) {
    return candidates.Empresas.map(normalizeCompany).filter((item) => item.identificador);
  }

  return [];
}

function extractPagination(payload, { page, perPage }, fallbackCount = 0) {
  const pagination =
    payload?.Paginacao ||
    payload?.pagination ||
    payload?.meta ||
    null;

  const total =
    pagination?.TotalRegistros ||
    pagination?.totalRecords ||
    pagination?.total ||
    fallbackCount ||
    0;

  const totalPages =
    pagination?.TotalPaginas || pagination?.totalPages || (perPage ? Math.ceil(total / perPage) : 1) || 1;

  const hasNext = Boolean(totalPages ? page < totalPages : fallbackCount === perPage);

  return {
    page,
    perPage,
    total,
    totalPages,
    hasNext,
  };
}

export async function fetchEmpresas({ page = 1, perPage = 50 } = {}) {
  try {
    const response = await api.get('/companies', {
      params: {
        Pagina: page,
        ItensPorPagina: perPage,
      },
    });

    const companies = extractCompanies(response.data);
    const pagination = extractPagination(response.data, { page, perPage }, companies.length);

    return { data: companies, pagination };
  } catch (error) {
    const status = error?.response?.status;
    const details = {
      status,
      page,
      perPage,
      error: error?.response?.data || error.message,
    };

    logger.error('Failed to fetch companies from Acessórias API', details);
    await logSystemEvent({
      level: 'error',
      category: 'acessorias',
      message: 'Erro ao buscar empresas na API Acessórias',
      details,
    });

    if (status === 401 || status === 403) {
      emitAlert({
        source: 'acessorias',
        message: `Acesso negado pela API Acessórias (status ${status})`,
        details,
      });
    }

    const httpError = new Error('Falha ao consultar API Acessórias');
    httpError.status = status || 502;
    throw httpError;
  }
}

export default api;
