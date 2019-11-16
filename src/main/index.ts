import { app, Tray, globalShortcut, MenuItem, Menu } from 'electron';
import AutoLaunch from 'auto-launch';

import config from '../config';

import Window from './window';
import checkForUpdates from './checkForUpdates';
import { getSelectionText } from './utils';

process.env.GOOGLE_API_KEY = 'AIzaSyB0X6iZUJXzdqBK-3TOzKIx6p14J2Eb4OU';

if (!config.isDebug) {
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
app.on('ready', () => {
  const window = new Window({});

  tray = new Tray(`${__public}/iconTemplate@2x.png`);
  tray
    .on('click', () => {
      if (window.isVisible()) {
        window.fadeOut();
      } else {
        window.fadeIn();
      }
    })
    .on('right-click', () => {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Quit',
          click() {
            app.exit();
          },
        },
      ]);
      tray.popUpContextMenu(contextMenu);
    });

  globalShortcut.register('CommandOrControl+Q', async () => {
    if (!window) return;
    if (window.isVisible()) {
      window.fadeOut();
    } else {
      window.fadeIn();
      window.webContents.send('translate-clipboard-text', await getSelectionText());
    }
  });
});

app.on('before-quit', () => {
  tray.destroy();
  app.exit();
});
