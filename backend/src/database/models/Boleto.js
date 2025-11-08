import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'Boleto',
    {
      boletoId: {
        type: DataTypes.STRING(50),
        unique: true,
        field: 'boleto_id',
      },
      empresaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'empresa_id',
      },
      competencia: DataTypes.STRING(10),
      dtVencimentoOriginal: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'dt_vencimento_original',
      },
      dtVencimento: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'dt_vencimento',
      },
      dtPagamento: {
        type: DataTypes.DATE,
        field: 'dt_pagamento',
      },
      dtCredito: {
        type: DataTypes.DATE,
        field: 'dt_credito',
      },
      dtCriacao: {
        type: DataTypes.DATE,
        field: 'dt_criacao',
      },
      valor: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      valorPago: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'valor_pago',
      },
      valorTaxa: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'valor_taxa',
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      notaFiscal: {
        type: DataTypes.STRING(50),
        field: 'nota_fiscal',
      },
      pdfNotaUrl: {
        type: DataTypes.TEXT,
        field: 'pdf_nota_url',
      },
      syncedAt: {
        type: DataTypes.DATE,
        field: 'synced_at',
      },
    },
    {
      tableName: 'boletos',
    }
  );
