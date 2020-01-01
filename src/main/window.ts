import { BrowserWindow, screen, app } from 'electron';

import config from '../config';

import { CUSTOM_EVENT } from '../consts';

import { initIpcService } from './nativeMessage';

const loadURLOptions = {
  userAgent:
    'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3976.0 Mobile Safari/537.36',
};

export default class Window extends BrowserWindow {
  static getRenderPosition() {
    const mousePosition = screen.getCursorScreenPoint();
    const display = screen.getDisplayNearestPoint(mousePosition);
    const displayBounds = display.bounds;
    const displaySize = display.workAreaSize;
    const isFullHeight = config.platform === 'darwin' && displaySize.height < 1200;
    const isBottom = config.platform === 'win32';
    const width = 380;
    const height = isFullHeight ? displaySize.height : 640;
    const x = displayBounds.x + displaySize.width - width;
    const y = displayBounds.y + (isBottom ? displaySize.height - height : 0);

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
      alwaysOnTop: config.isDebug, // 为 false 时，在全屏 app 上显示将自动回到源工作区
      hasShadow: false,
      webPreferences: {
        webSecurity: false,
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        preload: `${__dirname}/preload.js`,
      },
      ...Window.getRenderPosition(),
    });

    this.on('blur', () => {
      if (!config.isDebug && !this.webContents.isDevToolsOpened()) this.fadeOut();
    });

    this.loadURL(config.translateUrl, loadURLOptions);

    this.webContents.addListener('devtools-opened', () => {
      this.setAlwaysOnTop(true);
    });

    this.webContents.addListener('devtools-closed', () => {
      this.setAlwaysOnTop(false);
    });

    this.webContents.addListener('crashed', console.log);
    new Promise((resolve, reject) => {
      this.webContents.addListener('did-finish-load', resolve);
      setTimeout(reject, 3000);
    }).catch(() => {
      this.loadURL(config.translateUrlFallback, loadURLOptions);
    });

    initIpcService(this);
  }
  fadeIn() {
    const { x, y, width, height } = Window.getRenderPosition();
    this.setBounds({ x, y, width, height });
    this.webContents.send(CUSTOM_EVENT.WINDOW_FADEIN);
  }
  fadeOut() {
    this.webContents.send(CUSTOM_EVENT.WINDOW_FADEOUT);
    setTimeout(() => {
      this.hide();
      app.hide();
    }, 200);
  }
  toggleDevTools() {
    if (this.webContents.isDevToolsOpened()) {
      this.webContents.closeDevTools();
    } else {
      this.fadeIn();
      setTimeout(() => {
        this.webContents.openDevTools({ mode: 'undocked' });
      }, 200);
    }
  }
}
