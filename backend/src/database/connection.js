import { Sequelize } from 'sequelize';
import { sequelizeOptions } from '../config/database.config.js';
import initModels from './models/index.js';

let sequelizeInstance;

export async function initDatabase() {
  if (!sequelizeInstance) {
    sequelizeInstance = new Sequelize(sequelizeOptions);
    initModels(sequelizeInstance);
  }

  try {
    await sequelizeInstance.authenticate();
    await sequelizeInstance.sync();
    return sequelizeInstance;
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

export function getDatabase() {
  if (!sequelizeInstance) {
    throw new Error('Database has not been initialised yet.');
  }

  return sequelizeInstance;
}

export default sequelizeInstance;
