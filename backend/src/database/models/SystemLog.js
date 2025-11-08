import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'SystemLog',
    {
      nivel: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      categoria: DataTypes.STRING(50),
      mensagem: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      detalhes: DataTypes.TEXT,
    },
    {
      tableName: 'system_logs',
    }
  );
