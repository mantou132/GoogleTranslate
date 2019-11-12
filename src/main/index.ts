import { app, BrowserWindow, Tray, screen, globalShortcut, clipboard, MenuItem, Menu, ipcMain } from 'electron';
import AutoLaunch from 'auto-launch';
import robotjs from 'robotjs';

import { getTranslateString } from '../utils';
import config from '../config';

import checkForUpdates from './checkForUpdates';
import { initIpcService } from './nativeMessage';

const isDevelopment = process.env.NODE_ENV !== 'production';

process.env.GOOGLE_API_KEY = 'AIzaSyB0X6iZUJXzdqBK-3TOzKIx6p14J2Eb4OU';

if (!isDevelopment) {
  const googleTranslateAutoLaunch = new AutoLaunch({ name: 'Google 翻译' });
  googleTranslateAutoLaunch.isEnabled().then(isEnabled => {
    if (!isEnabled) {
      googleTranslateAutoLaunch.enable();
    }
  });
  checkForUpdates();
  app.dock.hide();

  const menu = new Menu();
  // 加了菜单才有 cmd + shift + i 的功能
  menu.append(
    new MenuItem({
      role: 'about',
      submenu: [{ role: 'toggleDevTools' }],
    }),
  );
  // 加了菜单才有 cmd + c 的功能
  menu.append(new MenuItem({ role: 'editMenu' }));
  Menu.setApplicationMenu(menu);
}

let tray: Tray;
let window: BrowserWindow | null;
app.on('ready', () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  window = new BrowserWindow({
    x: width - 400 - 10,
    y: Number(((height - 800) / 2).toFixed()),
    width: 400,
    height: 800,
    transparent: true,
    vibrancy: 'light',
    titleBarStyle: 'customButtonsOnHover',
    minimizable: false,
    maximizable: false,
    closable: false, // 不能用常规方法退出，需要在 before-quite 中自行退出 app
    webPreferences: {
      nodeIntegration: true,
      preload: `${__dirname}/preload.js`,
    },
  });

  window.loadURL(config.translateUrl);

  new Promise((resolve, reject) => {
    window?.webContents.addListener('did-finish-load', resolve);
    setTimeout(reject, 3000);
  }).catch(() => {
    window?.loadURL(config.translateUrlFallback);
  });

  initIpcService(window, isDevelopment);
  globalShortcut.register('CommandOrControl+Q', async () => {
    if (!window) return;
    if (window.isVisible()) {
      window.hide();
    } else {
      const oldString = clipboard.readText();
      clipboard.writeText(''); // clear clipboard text
      robotjs.keyTap('c', 'command'); // Invalid when no selection text
      await new Promise(resolve => setTimeout(resolve, 300));

      const newString = clipboard.readText();
      const originStr = getTranslateString(newString);

      clipboard.writeText(oldString);
      window.show();

      window.webContents.send('translate-clipboard-text', originStr);
    }
  });

  window.on('closed', () => {
    window = null;
  });

  window.on('blur', () => {
    window?.hide();
  });

  tray = new Tray(`${__public}/iconTemplate@2x.png`);
  tray.on('click', () => {
    window?.show();
  });
});

ipcMain.on('show-window', () => {
  window?.show();
});

ipcMain.on('hide-window', () => {
  window?.hide();
});

app.on('before-quit', () => {
  tray.destroy();
  app.exit();
});
