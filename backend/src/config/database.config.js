export const databaseConfig = {
  storage: process.env.DATABASE_PATH || './data/gestor_zap.db',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
};

export const sequelizeOptions = {
  dialect: 'sqlite',
  storage: databaseConfig.storage,
  logging: databaseConfig.logging,
  define: {
    underscored: true,
    freezeTableName: false,
    timestamps: true,
  },
};
