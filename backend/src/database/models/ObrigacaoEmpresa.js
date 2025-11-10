import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'ObrigacaoEmpresa',
    {
      empresaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'empresa_id',
      },
      nome: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: DataTypes.STRING(50),
      tipo: DataTypes.STRING(20),
      entregues: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      atrasadas: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      proximos30d: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'proximos_30d',
      },
      futuras30plus: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'futuras_30plus',
      },
    },
    {
      tableName: 'obrigacoes_empresa',
    }
  );
