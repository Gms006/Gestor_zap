export default function registerChatEvents(socket) {
  socket.on('chat:send', (payload) => {
    socket.emit('chat:ack', payload);
  });
}
