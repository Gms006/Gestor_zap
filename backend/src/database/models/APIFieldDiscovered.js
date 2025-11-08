import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'APIFieldDiscovered',
    {
      endpoint: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      campoPath: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'campo_path',
      },
      tipoDado: {
        type: DataTypes.STRING(50),
        field: 'tipo_dado',
      },
      valoresExemplo: {
        type: DataTypes.TEXT,
        field: 'valores_exemplo',
      },
      ocorrencias: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      ultimaOcorrencia: {
        type: DataTypes.DATE,
        field: 'ultima_ocorrencia',
      },
    },
    {
      tableName: 'api_fields_discovered',
      createdAt: 'primeira_descoberta',
      updatedAt: 'ultima_ocorrencia',
    }
  );
