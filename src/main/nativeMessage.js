import process from 'process';
import path from 'path';
import { getAbsPath, createFile, createDir } from 'web-ext-native-msg';
import ipc from 'node-ipc';
import startCase from 'lodash/startCase';

export function installNativeMessageManifest(isDevelopment) {
  [
    {
      dir: '~/Library/Application Support/Mozilla/NativeMessagingHosts',
    },
    // {
    //   dir: '~/Library/Application Support/Google/Chrome/NativeMessagingHosts',
    // },
  ].forEach((opt) => {
    const dirArr = getAbsPath(opt.dir).split(path.sep);
    dirArr[0] = path.sep;
    createDir(dirArr);
    createFile(
      getAbsPath(`${opt.dir}/google_translate.json`),
      JSON.stringify(
        {
          name: 'google_translate',
          description: '谷歌翻译',
          path: isDevelopment
            ? `${process.cwd()}/src/extensionapp/extensionapp`
            : `${process.resourcesPath}/extensionapp`,
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

export function initIpcService(mainWindow, isDevelopment) {
  installNativeMessageManifest(isDevelopment);
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
