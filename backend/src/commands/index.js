import { registerCommand, executeCommand } from './command.handler.js';
import registerRelatorioCommand from './relatorio.command.js';

registerRelatorioCommand(registerCommand);

export { registerCommand, executeCommand };
