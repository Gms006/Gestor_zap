import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'Processo',
    {
      procId: {
        type: DataTypes.STRING(50),
        unique: true,
        field: 'proc_id',
      },
      empresaId: {
        type: DataTypes.INTEGER,
        field: 'empresa_id',
      },
      nome: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      titulo: DataTypes.TEXT,
      criador: DataTypes.STRING(100),
      gestor: DataTypes.STRING(100),
      observacoes: DataTypes.TEXT,
      dtInicio: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'dt_inicio',
      },
      diasCorridos: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'dias_corridos',
      },
      dtConclusao: {
        type: DataTypes.DATE,
        field: 'dt_conclusao',
      },
      dtConclusaoPrevista: {
        type: DataTypes.DATE,
        field: 'dt_conclusao_prevista',
      },
      departamento: DataTypes.STRING(100),
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      porcentagem: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      syncedAt: {
        type: DataTypes.DATE,
        field: 'synced_at',
      },
    },
    {
      tableName: 'processos',
    }
  );
