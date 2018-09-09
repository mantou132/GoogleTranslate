import process from 'process';
import path from 'path';
import {
  Input,
  Output,
  getAbsPath,
  createFile,
  createDir,
  isFile,
} from 'web-ext-native-msg';
import ipc from 'node-ipc';
import startCase from 'lodash/startCase';
import { app } from 'electron';
import { spawn } from 'child_process';

export function installNativeMessageManifest() {
  [
    {
      dir: '~/Library/Application Support/Mozilla/NativeMessagingHosts',
    },
    {
      dir: '~/Library/Application Support/Google/Chrome/NativeMessagingHosts',
    },
  ].forEach((opt) => {
    const dirArr = getAbsPath(opt.dir).split(path.sep);
    dirArr[0] = path.sep;
    createDir(dirArr);
    const filePath = getAbsPath(`${opt.dir}/google_translate.json`);
    if (isFile(filePath)) return;
    createFile(
      filePath,
      JSON.stringify(
        {
          name: 'google_translate',
          description: '谷歌翻译',
          path: process.argv[0],
          type: 'stdio',
          allowed_extensions: ['{fa233117-785b-4da4-a4a2-6f5312c6381b}'],
        },
        null,
        2,
      ),
      { encoding: 'utf-8' },
    );
  });
}

export function initIpcService(mainWindow) {
  installNativeMessageManifest();
  ipc.config.id = 'google-translate';
  ipc.config.retry = 1000;
  ipc.config.silent = true;
  ipc.serve(() =>
    ipc.server.on('translate-text', (message) => {
      const { window } = mainWindow;
      const trimStr = message.trim();
      const originStr = /^[a-zA-Z_-]+$/.test(trimStr)
        ? startCase(trimStr)
        : trimStr;
      mainWindow.showWindow();
      window.webContents.send('translate-clipboard-text', originStr);
    }),
  );
  ipc.server.start();
}

export function initIpcClient() {
  ipc.config.id = 'native-message-host';
  ipc.config.retry = 1000;
  ipc.config.silent = true;
  new Promise((resolve, reject) => {
    ipc.connectTo('google-translate', () => {
      ipc.of['google-translate'].on('connect', resolve);
    });
    setTimeout(reject, ipc.config.retry * 5);
  }).catch(() => {
    spawn(process.argv[0], {
      detached: true,
      stdio: 'ignore',
    }).unref();
  });

  return {
    translateText(text) {
      ipc.of['google-translate'].emit('translate-text', text);
    },
  };
}

export function isNativeMessagingHosts() {
  return process.argv[1] && process.argv[1].includes('NativeMessagingHosts');
}

export function initNativeMessagingHosts() {
  const { translateText } = initIpcClient();

  const writeStdout = async (msg) => {
    const str = await new Output().encode(msg);
    return str && process.stdout.write(str);
  };

  const handleMsg = async (msg) => {
    translateText(msg);
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
}
