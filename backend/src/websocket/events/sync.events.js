export default function registerSyncEvents(socket) {
  socket.on('sync:request', () => {
    socket.emit('sync:queued');
  });
}
