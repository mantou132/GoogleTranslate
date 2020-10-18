import { app, Tray, Menu, BrowserWindow } from 'electron';

import Window from './window';

let settingsWindow: BrowserWindow | null = null;
const settingsClickHandle = () => {
  if (settingsWindow) {
    app.show();
    settingsWindow.show();
    settingsWindow.moveTop();
    settingsWindow.focus();
  } else {
    settingsWindow = new BrowserWindow({
      width: 360,
      height: 150,
      webPreferences: {
        nodeIntegration: true,
      },
    });
    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
    settingsWindow.loadURL(`file://${__dirname}/settings.html`);
  }
};

export default class GtTray extends Tray {
  constructor(img: string, window: Window) {
    super(img);
    this.on('click', () => {
      if (window.isVisible()) {
        window.fadeOut();
      } else {
        window.fadeIn();
      }
    }).on('right-click', () => {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: 'Toggle Developer Tools',
          click() {
            window.toggleDevTools();
          },
        },
        {
          label: 'Relaunch',
          click() {
            app.relaunch();
            app.exit();
          },
        },
        {
          label: 'Settings',
          click: settingsClickHandle,
        },
        {
          label: 'Quit',
          click() {
            app.quit();
          },
        },
      ]);
      this.popUpContextMenu(contextMenu);
    });
  }
}
