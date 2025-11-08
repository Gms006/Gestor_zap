import Empresa from './Empresa.js';
import ObrigacaoEmpresa from './ObrigacaoEmpresa.js';
import Entrega from './Entrega.js';
import Processo from './Processo.js';
import ProcessoPasso from './ProcessoPasso.js';
import Boleto from './Boleto.js';
import FaturaItem from './FaturaItem.js';
import SyncHistory from './SyncHistory.js';
import APIFieldDiscovered from './APIFieldDiscovered.js';
import SystemLog from './SystemLog.js';
import ChatHistory from './ChatHistory.js';

export default function initModels(sequelize) {
  const models = {
    Empresa: Empresa(sequelize),
    ObrigacaoEmpresa: ObrigacaoEmpresa(sequelize),
    Entrega: Entrega(sequelize),
    Processo: Processo(sequelize),
    ProcessoPasso: ProcessoPasso(sequelize),
    Boleto: Boleto(sequelize),
    FaturaItem: FaturaItem(sequelize),
    SyncHistory: SyncHistory(sequelize),
    APIFieldDiscovered: APIFieldDiscovered(sequelize),
    SystemLog: SystemLog(sequelize),
    ChatHistory: ChatHistory(sequelize),
  };

  models.Empresa.hasMany(models.ObrigacaoEmpresa, {
    foreignKey: 'empresaId',
    as: 'obrigacoes',
  });
  models.ObrigacaoEmpresa.belongsTo(models.Empresa, {
    foreignKey: 'empresaId',
    as: 'empresa',
  });

  models.Empresa.hasMany(models.Entrega, {
    foreignKey: 'empresaId',
    as: 'entregas',
  });
  models.Entrega.belongsTo(models.Empresa, {
    foreignKey: 'empresaId',
    as: 'empresa',
  });

  models.Empresa.hasMany(models.Processo, {
    foreignKey: 'empresaId',
    as: 'processos',
  });
  models.Processo.belongsTo(models.Empresa, {
    foreignKey: 'empresaId',
    as: 'empresa',
  });

  models.Processo.hasMany(models.ProcessoPasso, {
    foreignKey: 'processoId',
    as: 'passos',
  });
  models.ProcessoPasso.belongsTo(models.Processo, {
    foreignKey: 'processoId',
    as: 'processo',
  });

  models.Empresa.hasMany(models.Boleto, {
    foreignKey: 'empresaId',
    as: 'boletos',
  });
  models.Boleto.belongsTo(models.Empresa, {
    foreignKey: 'empresaId',
    as: 'empresa',
  });

  models.Boleto.hasMany(models.FaturaItem, {
    foreignKey: 'boletoId',
    as: 'itens',
  });
  models.FaturaItem.belongsTo(models.Boleto, {
    foreignKey: 'boletoId',
    as: 'boleto',
  });

  return models;
}
