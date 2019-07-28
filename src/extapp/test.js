const ipc = require('node-ipc');

ipc.config.id = 'bridge';
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

ipc.connectTo('bridge', () => {
  ipc.of.bridge.on('connect', () => {
    ipc.log('## connected to world ##', ipc.config.delay);
    ipc.of.bridge.emit('app.message', {
      id: ipc.config.id,
      message: 'hello',
    });
  });
  ipc.of.bridge.on('disconnect', () => {
    ipc.log('disconnected from world');
  });
  ipc.of.bridge.on('app.message', (data) => {
    ipc.log('got a message from world : ', data);
  });
});
