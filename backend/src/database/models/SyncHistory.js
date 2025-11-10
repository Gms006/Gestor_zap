import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'SyncHistory',
    {
      tipo: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      dtInicio: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'dt_inicio',
      },
      dtFim: {
        type: DataTypes.DATE,
        field: 'dt_fim',
      },
      registrosProcessados: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'registros_processados',
      },
      registrosNovos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'registros_novos',
      },
      registrosAtualizados: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'registros_atualizados',
      },
      status: DataTypes.STRING(20),
      erroMsg: {
        type: DataTypes.TEXT,
        field: 'erro_msg',
      },
    },
    {
      tableName: 'sync_history',
    }
  );
