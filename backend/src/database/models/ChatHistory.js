import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'ChatHistory',
    {
      tipo: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      numeroUsuario: {
        type: DataTypes.STRING(20),
        field: 'numero_usuario',
      },
      sessaoId: {
        type: DataTypes.STRING(50),
        field: 'sessao_id',
      },
      comando: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      resposta: DataTypes.TEXT,
      tempoRespostaMs: {
        type: DataTypes.INTEGER,
        field: 'tempo_resposta_ms',
      },
    },
    {
      tableName: 'chat_history',
    }
  );
