const ipc = require('node-ipc');

ipc.config.id = 'world';
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

ipc.connectTo('world', () => {
  ipc.of.world.on('connect', () => {
    ipc.log('## connected to world ##', ipc.config.delay);
    ipc.of.world.emit('app.message', {
      id: ipc.config.id,
      message: 'hello',
    });
  });
  ipc.of.world.on('disconnect', () => {
    ipc.log('disconnected from world');
  });
  ipc.of.world.on('app.message', (data) => {
    ipc.log('got a message from world : ', data);
  });

  console.log(ipc.of.world.destroy);
});
