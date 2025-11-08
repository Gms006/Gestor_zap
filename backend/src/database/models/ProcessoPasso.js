import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'ProcessoPasso',
    {
      processoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'processo_id',
      },
      tipo: DataTypes.STRING(50),
      status: DataTypes.STRING(50),
      nome: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ordem: DataTypes.INTEGER,
      bloqueante: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      automacaoConfig: {
        type: DataTypes.JSON,
        field: 'automacao_config',
      },
    },
    {
      tableName: 'processo_passos',
    }
  );
