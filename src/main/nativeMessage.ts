/* eslint-disable @typescript-eslint/camelcase */
import process from 'process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

import { dialog, app } from 'electron';
import mkdirp from 'mkdirp';
import ipc from 'node-ipc';
import regedit, { RegsValues, RegKeys } from 'regedit';

import config from '../config';
import { CUSTOM_EVENT } from '../consts';

import Window from './window';

const NATIVE_MANIFEST_NAME = 'google_translate_bridge';

const vbsPath = config.isDebug
  ? path.resolve(process.cwd(), `node_modules/regedit/vbs`)
  : path.resolve(__public, 'vbs');
regedit.setExternalVBSLocation(vbsPath);

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
      return app.getPath('userData');
  }
}

function getNativeMessageAllowedExtension(browser: BrowserName) {
  const allowed_extensions = ['{fa233117-785b-4da4-a4a2-6f5312c6381b}'];
  const allowed_origins = ['chrome-extension://hjaohjgedndjjaegicnfikppfjbboohf/'];
  if (process.env.TEMP_EXT) {
    if (process.env.TEMP_EXT.startsWith('{')) {
      // firefox
      allowed_extensions.push(process.env.TEMP_EXT);
    } else {
      allowed_origins.push(`chrome-extension://${process.env.TEMP_EXT}/`);
    }
  }
  if (browser === 'Firefox') {
    return { allowed_extensions };
  } else {
    return { allowed_origins };
  }
}

async function writeRegistryKey(browser: BrowserName, filePath: string) {
  const value: RegsValues = {
    default: {
      value: filePath,
      type: 'REG_DEFAULT',
    },
  };
  const values: RegKeys = {};
  switch (browser) {
    case 'Firefox':
      values['HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\google_translate_bridge'] = value;
      break;
    case 'Chrome Canary':
    case 'Chrome':
    case 'Chromium':
      values['HKCU\\SOFTWARE\\Google\\Chrome\\NativeMessagingHosts\\google_translate_bridge'] = value;
      break;
  }
  await promisify(regedit.createKey)(Object.keys(values));
  await promisify(regedit.putValue)(values);
}

export function installNativeMessageManifest() {
  const suffix = config.platform === 'win32' ? '.exe' : '';
  const manifest = {
    name: NATIVE_MANIFEST_NAME,
    description: '谷歌翻译',
    path: config.isDebug
      ? path.resolve(process.cwd(), `src/bridge/target/release/bridge${suffix}`)
      : path.resolve(__public, `google-translate-bridge${suffix}`),
    type: 'stdio',
  };

  const browsers: BrowserName[] = ['Chrome', 'Chrome Canary', 'Chromium', 'Firefox'];

  browsers.forEach(async browser => {
    const title = `Google 翻译添加 ${browser} 扩展支持失败`;
    const relDir = getNativeMessageDir(browser);
    if (!relDir) return;
    const absDir = path.resolve(os.homedir(), relDir);
    const filePath = path.resolve(absDir, `${NATIVE_MANIFEST_NAME}.json`);
    if (process.platform === 'win32') {
      try {
        await writeRegistryKey(browser, filePath);
      } catch (err) {
        dialog.showErrorBox(title, `${err}\nvbsPath: ${vbsPath}\n${err.stack}`);
      }
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
