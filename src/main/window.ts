import { BrowserWindow, screen, app } from 'electron';
import internetAvailable from 'internet-available';

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
      alwaysOnTop: config.platform === 'win32' ? true : config.isDebug, // 为 false 时，在全屏 app 上显示将自动回到源工作区
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

    this.webContents.addListener('devtools-opened', () => {
      this.setAlwaysOnTop(true);
    });

    this.webContents.addListener('devtools-closed', () => {
      this.setAlwaysOnTop(false);
    });

    // eslint-disable-next-line no-console
    this.webContents.addListener('crashed', console.log);

    internetAvailable({ timeout: 1000, retries: 5, port: '53', host: '114.114.114.114', domainName: 'google.com' })
      .then(() => {
        return new Promise((resolve, reject) => {
          // https://github.com/electron/electron/issues/20357
          const testWindow = new BrowserWindow({ show: false });
          testWindow.loadURL(config.translateUrl);
          const timer = setTimeout(() => {
            testWindow.close();
            reject(new Error('timeout'));
          }, 3000);
          testWindow.webContents.on('page-title-updated', (_evt, _title, explicitSet) => {
            if (explicitSet) {
              testWindow.close();
              resolve(null);
              clearTimeout(timer);
            }
          });
        });
      })
      .then(() => {
        this.loadURL(config.translateUrl, loadURLOptions);
      })
      .catch(() => {
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
    // Windows blur 聚焦到上一个窗口，这里不知道什么原因要执行两次
    this.blur();
    this.webContents.send(CUSTOM_EVENT.WINDOW_FADEOUT);
    setTimeout(() => {
      this.blur();
      this.hide();
      app.hide?.();
    }, 300); // 时间太短动画没有完成
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
