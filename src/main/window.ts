import { BrowserWindow, screen } from 'electron';

import config from '../config';

import { initIpcService } from './nativeMessage';

export default class Window extends BrowserWindow {
  static getRenderPosition() {
    const mousePosition = screen.getCursorScreenPoint();
    const displaySize = screen.getDisplayNearestPoint(mousePosition).workAreaSize;
    const isFullHeight = config.platform === 'darwin' && displaySize.height < 1000;
    const isBottom = config.platform === 'win32';
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

  constructor() {
    super({
      show: false,
      transparent: true,
      frame: false,
      skipTaskbar: true,
      titleBarStyle: 'customButtonsOnHover',
      minimizable: false,
      maximizable: false,
      closable: false, // 不能用常规方法退出，需要在 before-quite 中自行退出 app
      alwaysOnTop: true,
      hasShadow: false,
      webPreferences: {
        nodeIntegration: true,
        preload: `${__dirname}/preload.js`,
      },
      ...Window.getRenderPosition(),
    });

    this.on('blur', () => {
      if (!config.isDebug) this.fadeOut();
    });

    this.loadURL(config.translateUrl);

    new Promise((resolve, reject) => {
      this.webContents.addListener('did-finish-load', resolve);
      setTimeout(reject, 3000);
    }).catch(() => {
      this.loadURL(config.translateUrlFallback);
    });

    initIpcService(this);
  }
  fadeIn() {
    const { x, y, width, height } = Window.getRenderPosition();
    this.setPosition(x, y);
    this.setSize(width, height);
    this.webContents.send('fade-in');
  }
  fadeOut() {
    this.webContents.send('fade-out');
    setTimeout(() => {
      this.hide();
    }, 200);
  }
}
