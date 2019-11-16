/* eslint-disable @typescript-eslint/camelcase */
import process from 'process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import { dialog } from 'electron';
import mkdirp from 'mkdirp';
import ipc from 'node-ipc';

import { getTranslateString } from '../utils';
import config from '../config';

export function installNativeMessageManifest() {
  const manifest = {
    name: 'google_translate_bridge',
    description: '谷歌翻译',
    path: config.isDebug ? `${process.cwd()}/src/bridge/target/debug/bridge` : `${__public}/google-translate-bridge`,
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
      dir: 'Library/Application Support/Google/Chrome Canary/NativeMessagingHosts',
      allowed_origins: ['chrome-extension://hjaohjgedndjjaegicnfikppfjbboohf/'],
    },
    {
      dir: 'Library/Application Support/Chromium/NativeMessagingHosts',
      allowed_origins: ['chrome-extension://hjaohjgedndjjaegicnfikppfjbboohf/'],
    },
  ];

  browsersOpt.forEach(async opt => {
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
      const filePath = path.resolve(absDir, 'google_translate_bridge.json');
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

export function initIpcService(window: Electron.BrowserWindow) {
  installNativeMessageManifest();
  ipc.config.id = 'google-translate-bridge';
  ipc.config.retry = 1000;
  ipc.config.silent = true;
  ipc.serve(() =>
    ipc.server.on('translate-text', message => {
      window.show();

      const originStr = getTranslateString(message);
      window.webContents.send('translate-clipboard-text', originStr);
    }),
  );
  ipc.server.start();
}
