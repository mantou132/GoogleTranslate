const ipc = require('node-ipc');

ipc.config.id = 'google-translate-bridge';
ipc.config.retry = 1500;

ipc.serve(() => {
  ipc.server.on('app.message', (data, socket) => {
    ipc.server.emit(socket, 'app.message', {
      id: ipc.config.id,
      message: `${data.message} world!`,
    });
  });
});

ipc.server.start();

ipc.connectTo('google-translate-bridge', () => {
  ipc.of['google-translate-bridge'].on('connect', () => {
    ipc.log('## connected to world ##', ipc.config.delay);
    ipc.of['google-translate-bridge'].emit('app.message', {
      id: ipc.config.id,
      message: 'hello',
    });
  });
  ipc.of['google-translate-bridge'].on('disconnect', () => {
    ipc.log('disconnected from world');
  });
  ipc.of['google-translate-bridge'].on('app.message', (data) => {
    ipc.log('got a message from world : ', data);
  });
});
