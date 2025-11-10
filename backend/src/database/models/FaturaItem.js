import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'FaturaItem',
    {
      boletoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'boleto_id',
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      codPlanoContas: {
        type: DataTypes.STRING(20),
        field: 'cod_plano_contas',
      },
      descPlanoContas: {
        type: DataTypes.TEXT,
        field: 'desc_plano_contas',
      },
    },
    {
      tableName: 'fatura_itens',
    }
  );
