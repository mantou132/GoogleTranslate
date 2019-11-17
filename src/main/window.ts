import { BrowserWindow, ipcMain, screen } from 'electron';

import config from '../config';

import { initIpcService } from './nativeMessage';

export default class Window extends BrowserWindow {
  static getRenderPosition() {
    const mousePosition = screen.getCursorScreenPoint();
    const displaySize = screen.getDisplayNearestPoint(mousePosition).workAreaSize;
    const isFullHeight = config.isMac && displaySize.height < 1000;
    const isBottom = config.isWin;
    const width = 380;
    const height = isFullHeight ? displaySize.height : 640;
    const x = displaySize.width - width;
    const y = isBottom ? displaySize.height - height : 0;

    return {
      width,
      height,
      x,
      y,
    };
  }

  constructor(opts: Electron.BrowserWindowConstructorOptions) {
    super({
      show: false,
      transparent: true,
      frame: false,
      skipTaskbar: true,
      titleBarStyle: 'customButtonsOnHover',
      minimizable: false,
      maximizable: false,
      closable: false, // 不能用常规方法退出，需要在 before-quite 中自行退出 app
      alwaysOnTop: config.isDebug,
      hasShadow: false,
      webPreferences: {
        nodeIntegration: true,
        preload: `${__dirname}/preload.js`,
      },
      ...Window.getRenderPosition(),
      ...opts,
    });

    this.on('blur', () => {
      if (!config.isDebug) this.hide();
    });

    this.loadURL(config.translateUrl);

    new Promise((resolve, reject) => {
      this.webContents.addListener('did-finish-load', resolve);
      setTimeout(reject, 3000);
    }).catch(() => {
      this.loadURL(config.translateUrlFallback);
    });

    initIpcService(this);

    ipcMain.on('show-window', () => {
      this.show();
    });

    ipcMain.on('hide-window', () => {
      this.hide();
    });
  }
  fadeIn() {
    const { x, y, width, height } = Window.getRenderPosition();
    this.show();
    this.setPosition(x, y);
    this.setSize(width, height);
    this.webContents.send('fade-in');
  }
  fadeOut() {
    this.webContents.send('fade-out');
    setTimeout(() => {
      this.hide();
    }, 500);
  }
}
