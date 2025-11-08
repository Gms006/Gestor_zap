import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'Empresa',
    {
      idExterno: {
        type: DataTypes.STRING(50),
        field: 'id_externo',
        unique: true,
        allowNull: true,
      },
      identificador: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
      },
      cnpj: {
        type: DataTypes.STRING(14),
        field: 'cnpj',
      },
      razao: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fantasia: DataTypes.TEXT,
      regimeId: {
        type: DataTypes.INTEGER,
        field: 'regime_id',
      },
      regimeNome: {
        type: DataTypes.STRING(50),
        field: 'regime_nome',
      },
      ativa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      dtCadastro: {
        type: DataTypes.DATE,
        field: 'dt_cadastro',
      },
      dtCliDesde: {
        type: DataTypes.DATE,
        field: 'dt_cli_desde',
      },
      dtCliAte: {
        type: DataTypes.DATE,
        field: 'dt_cli_ate',
      },
      dtAbertura: {
        type: DataTypes.DATE,
        field: 'dt_abertura',
      },
      inscricaoMunicipal: {
        type: DataTypes.STRING(50),
        field: 'inscricao_municipal',
      },
      endereco: DataTypes.TEXT,
      cidade: DataTypes.STRING(100),
      uf: DataTypes.STRING(2),
      status: DataTypes.STRING(50),
      telefone: DataTypes.STRING(20),
      honorario: DataTypes.DECIMAL(10, 2),
      scoreRisco: {
        type: DataTypes.INTEGER,
        field: 'score_risco',
        defaultValue: 0,
      },
      syncedAt: {
        type: DataTypes.DATE,
        field: 'synced_at',
      },
    },
    {
      tableName: 'empresas',
    }
  );
