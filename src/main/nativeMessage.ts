import process from 'process';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import ipc from 'node-ipc';
import { dialog } from 'electron';
import { promisify } from 'util';
import { getTranslateString } from '../util';

export function installNativeMessageManifest(isDevelopment: boolean) {
  const manifest = {
    name: 'google_translate',
    description: '谷歌翻译',
    path: isDevelopment
      ? `${process.cwd()}/src/extapp/index`
      : `${process.resourcesPath}/extapp`,
    type: 'stdio',
  };

  const browsersOpt = [
    {
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests
      dir: 'Library/Application Support/Mozilla/NativeMessagingHosts',
      allowed_extensions: ['{fa233117-785b-4da4-a4a2-6f5312c6381b}'],
    },
    {
      // https://developer.chrome.com/extensions/nativeMessaging#native-messaging-host
      dir: 'Library/Application Support/Google/Chrome/NativeMessagingHosts',
      allowed_origins: ['chrome-extension://hjaohjgedndjjaegicnfikppfjbboohf/'],
    },
    {
      dir:
        'Library/Application Support/Google/Chrome Canary/NativeMessagingHosts',
      allowed_origins: ['chrome-extension://hjaohjgedndjjaegicnfikppfjbboohf/'],
    },
    {
      dir: 'Library/Application Support/Chromium/NativeMessagingHosts',
      allowed_origins: ['chrome-extension://hjaohjgedndjjaegicnfikppfjbboohf/'],
    },
  ];

  browsersOpt.forEach(async (opt) => {
    const title = 'Google 翻译添加浏览器支持失败';
    const absDir = path.resolve(process.env.HOME!, opt.dir);
    try {
      try {
        await promisify(fs.readdir)(absDir);
      } catch (e) {
        await promisify(mkdirp)(absDir);
      }
      const data = {
        ...manifest,
        ...opt,
        dir: undefined,
      };
      const filePath = path.resolve(absDir, 'google_translate.json');
      try {
        await promisify(fs.writeFile)(filePath, JSON.stringify(data, null, 2));
      } catch (e) {
        dialog.showErrorBox(title, `创建文件 ${filePath} 失败`);
      }
    } catch (e) {
      dialog.showErrorBox(title, `创建文件夹 ${absDir} 失败`);
    }
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
      mainWindow.showWindow();

      const originStr = getTranslateString(message);
      window.webContents.send('translate-clipboard-text', originStr);
    }),
  );
  ipc.server.start();
}
