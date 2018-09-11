import process from 'process';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import ipc from 'node-ipc';
import startCase from 'lodash/startCase';

export function installNativeMessageManifest(isDevelopment: boolean) {
  const manifest = {
    name: 'google_translate',
    description: '谷歌翻译',
    path: isDevelopment
      ? `${process.cwd()}/src/extapp/index`
      : `${process.resourcesPath}/extapp`,
    type: 'stdio',
    allowed_extensions: ['{fa233117-785b-4da4-a4a2-6f5312c6381b}'],
  };

  const dirs = [
    'Library/Application Support/Mozilla/NativeMessagingHosts',
    // 'Library/Application Support/Google/Chrome/NativeMessagingHosts',
  ];

  dirs.forEach((dir) => {
    mkdirp(dir, (err) => {
      if (!err) {
        fs.writeFile(
          path.resolve(process.env.HOME || '', `${dir}/google_translate.json`),
          JSON.stringify(manifest, null, 2),
          () => undefined,
        );
      }
    });
  });
}

export function initIpcService(
  mainWindow: Menubar.MenubarApp,
  isDevelopment: boolean,
) {
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
