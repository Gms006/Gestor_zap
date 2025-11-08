import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'Entrega',
    {
      entId: {
        type: DataTypes.STRING(50),
        unique: true,
        field: 'ent_id',
      },
      empresaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'empresa_id',
      },
      nome: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tipo: DataTypes.STRING(20),
      competencia: DataTypes.DATE,
      dtPrazo: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'dt_prazo',
      },
      dtAtraso: {
        type: DataTypes.DATE,
        field: 'dt_atraso',
      },
      dtEntrega: {
        type: DataTypes.DATE,
        field: 'dt_entrega',
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      multa: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      guiaLida: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'guia_lida',
      },
      departamentoId: {
        type: DataTypes.INTEGER,
        field: 'departamento_id',
      },
      departamentoNome: {
        type: DataTypes.STRING(100),
        field: 'departamento_nome',
      },
      observacoes: DataTypes.TEXT,
      syncedAt: {
        type: DataTypes.DATE,
        field: 'synced_at',
      },
    },
    {
      tableName: 'entregas',
    }
  );
