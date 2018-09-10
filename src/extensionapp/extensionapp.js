const process = require('process');
const { Input, Output } = require('web-ext-native-msg');
const ipc = require('node-ipc');

ipc.config.id = 'native-message-host';
ipc.config.retry = 1000;
ipc.config.silent = true;
ipc.connectTo('google-translate');

const writeStdout = async (msg) => {
  const str = await new Output().encode(msg);
  return str && process.stdout.write(str);
};

const handleMsg = async (msg) => {
  ipc.of['google-translate'].emit('translate-text', msg);
  writeStdout('pong');
};

const input = new Input();

const readStdin = (chunk) => {
  const arr = input.decode(chunk);
  const func = [];
  if (Array.isArray(arr) && arr.length) {
    arr.forEach((msg) => {
      if (msg) func.push(handleMsg(msg));
    });
  }
  return Promise.all(func);
};

process.stdin.on('data', readStdin);
