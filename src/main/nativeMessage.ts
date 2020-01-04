/* eslint-disable @typescript-eslint/camelcase */
import process from 'process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import { dialog, app } from 'electron';
import mkdirp from 'mkdirp';
import ipc from 'node-ipc';

import config from '../config';
import { CUSTOM_EVENT } from '../consts';

import Window from './window';

type BrowserName = 'Chrome' | 'Chromium' | 'Chrome Canary' | 'Firefox';

function getNativeMessageDir(browser: BrowserName) {
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests
  // https://developer.chrome.com/extensions/nativeMessaging#native-messaging-host
  switch (process.platform) {
    case 'darwin':
      switch (browser) {
        case 'Firefox':
          return 'Library/Application Support/Mozilla/NativeMessagingHosts';
        case 'Chrome Canary':
        case 'Chrome':
          return `Library/Application Support/Google/${browser}/NativeMessagingHosts`;
        case 'Chromium':
          return 'Library/Application Support/Chromium/NativeMessagingHosts';
      }
    case 'linux':
      switch (browser) {
        case 'Firefox':
          return '.mozilla/native-messaging-hosts';
        case 'Chrome Canary':
        case 'Chrome':
          return `.config/google-${browser.toLowerCase().replace(' ', '-')}/NativeMessagingHosts`;
        case 'Chromium':
          return '.config/chromium/NativeMessagingHosts';
      }
    case 'win32':
      return app.getPath('appData');
  }
}

function getNativeMessageAllowedExtension(browser: BrowserName) {
  if (browser === 'Firefox') {
    return { allowed_extensions: ['{fa233117-785b-4da4-a4a2-6f5312c6381b}'] };
  } else {
    return { allowed_origins: ['chrome-extension://hjaohjgedndjjaegicnfikppfjbboohf/'] };
  }
}

function writeRegistryKey(browser: BrowserName, _filePath: string) {
  // unimplement !!!
  switch (browser) {
    case 'Firefox':
      return;
    case 'Chrome Canary':
    case 'Chrome':
    case 'Chromium':
      return;
  }
}

export function installNativeMessageManifest() {
  const manifest = {
    name: 'google_translate_bridge',
    description: '谷歌翻译',
    path: config.isDebug
      ? path.resolve(process.cwd(), `src/bridge/target/release/bridge${config.platform === 'win32' ? '.exe' : ''}`)
      : path.resolve(__public, 'google-translate-bridge'),
    type: 'stdio',
  };

  const browsers: BrowserName[] = ['Chrome', 'Chrome Canary', 'Chromium', 'Firefox'];

  browsers.forEach(async browser => {
    const title = 'Google 翻译添加浏览器支持失败';
    const relDir = getNativeMessageDir(browser);
    if (!relDir) return;
    const absDir = path.resolve(os.homedir(), relDir);
    const filePath = path.resolve(absDir, 'google_translate_bridge.json');
    if (process.platform === 'win32') {
      writeRegistryKey(browser, filePath);
    }
    try {
      try {
        await promisify(fs.readdir)(absDir);
      } catch (e) {
        await promisify(mkdirp)(absDir);
      }
      const data = {
        ...manifest,
        ...getNativeMessageAllowedExtension(browser),
      };
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

export function initIpcService(window: Window) {
  installNativeMessageManifest();
  // 根据 bridge 的二进制文件名称设置 id
  ipc.config.id = config.isDebug ? 'bridge' : 'google-translate-bridge';
  ipc.config.retry = 1000;
  ipc.config.silent = true;
  ipc.serve(() =>
    ipc.server.on(CUSTOM_EVENT.TRANSLATE_REQUEST, message => {
      window.fadeIn();

      window.webContents.send(CUSTOM_EVENT.TRANSLATE, message);
    }),
  );
  ipc.server.start();
}
