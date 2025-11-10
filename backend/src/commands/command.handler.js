const registry = new Map();

export function registerCommand(trigger, handler) {
  registry.set(trigger, handler);
}

export async function executeCommand(message, context = {}) {
  const [trigger, ...params] = message.trim().split(/\s+/);
  const handler = registry.get(trigger.toLowerCase());
  if (!handler) {
    return '❓ Comando não reconhecido. Envie /ajuda para ver as opções disponíveis.';
  }
  return handler(params, context);
}
