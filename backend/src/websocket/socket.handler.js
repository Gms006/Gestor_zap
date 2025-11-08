import registerSyncEvents from './events/sync.events.js';
import registerChatEvents from './events/chat.events.js';
import registerAlertsEvents from './events/alerts.events.js';

export default function registerSocketEvents(io) {
  io.on('connection', (socket) => {
    registerSyncEvents(socket, io);
    registerChatEvents(socket, io);
    registerAlertsEvents(socket, io);
  });
}
