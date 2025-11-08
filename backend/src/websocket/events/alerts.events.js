export default function registerAlertsEvents(socket) {
  socket.on('alerts:subscribe', () => {
    socket.join('alerts');
  });
}
