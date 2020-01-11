import path from 'path';

import { app, Tray, MenuItem, Menu } from 'electron';
import AutoLaunch from 'auto-launch';

import config from '../config';
import { CUSTOM_EVENT, SHORTCUT } from '../consts';

import Window from './window';
import checkForUpdates from './checkForUpdates';
import { getSelectionText } from './utils';
import GtTray from './tray';
import shortcutRegister from './shortcut';
import settings from './settings';

process.env.GOOGLE_API_KEY = 'AIzaSyB0X6iZUJXzdqBK-3TOzKIx6p14J2Eb4OU';

if (!config.isDebug) {
  const googleTranslateAutoLaunch = new AutoLaunch({ name: 'Google 翻译' });
  googleTranslateAutoLaunch.isEnabled().then(isEnabled => {
    if (!isEnabled) {
      googleTranslateAutoLaunch.enable();
    }
  });
  if (settings.enableUpdateCheck === 'on') checkForUpdates();
  app.dock?.hide?.();

  const menu = new Menu();
  // 加了菜单才有 cmd + c 的功能
  menu.append(new MenuItem({ role: 'editMenu' }));
  Menu.setApplicationMenu(menu);
}

let tray: Tray;
app.on('ready', () => {
  const window = new Window();
  tray = new GtTray(path.resolve(__public, 'iconTemplate@2x.png'), window);

  shortcutRegister(SHORTCUT.TRANSLATE, async () => {
    if (!window) return;
    if (window.isVisible()) {
      window.fadeOut();
    } else {
      window.webContents.send(CUSTOM_EVENT.TRANSLATE, await getSelectionText());
      window.fadeIn();
    }
  });
});

app.on('before-quit', () => {
  tray.destroy();
  app.exit();
});
