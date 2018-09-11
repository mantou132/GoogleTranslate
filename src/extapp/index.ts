import { Input, Output } from 'web-ext-native-msg';
import * as process from 'process';
import * as ipc from 'node-ipc';

ipc.config.id = 'native-message-host';
ipc.config.retry = 1000;
ipc.config.silent = true;
ipc.connectTo('google-translate');

const writeStdout = async (msg: string) => {
  const buf = await new Output().encode(msg);
  return buf && process.stdout.write(buf);
};

const handleMsg = async (msg: string) => {
  ipc.of['google-translate'].emit('translate-text', msg);
  writeStdout('pong');
};

const input = new Input();

const readStdin = (chunk: Buffer) => {
  const arr = input.decode(chunk);
  const func: Promise<void>[] = [];
  if (Array.isArray(arr) && arr.length) {
    arr.forEach((msg) => {
      if (msg) func.push(handleMsg(msg));
    });
  }
  return Promise.all(func);
};

process.stdin.on('data', readStdin);
