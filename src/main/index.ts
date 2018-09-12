import {
  app,
  protocol,
  ipcMain,
  clipboard,
  globalShortcut,
  IpcMessageEvent,
  Menu,
  MenuItem,
} from 'electron';
import { format as formatUrl } from 'url';
import path from 'path';
import robotjs from 'robotjs';
import AutoLaunch from 'auto-launch';
import startCase from 'lodash/startCase';
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';
import menubar from 'menubar';
import checkForUpdates from './checkForUpdates';
import { initIpcService } from './nativeMessage';

const isDevelopment = process.env.NODE_ENV !== 'production';

process.env.GOOGLE_API_KEY = 'AIzaSyB0X6iZUJXzdqBK-3TOzKIx6p14J2Eb4OU';

if (!isDevelopment) {
  const googleTranslateAutoLaunch = new AutoLaunch({ name: 'Google 翻译' });
  googleTranslateAutoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) {
      googleTranslateAutoLaunch.enable();
    }
  });
}

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow: Menubar.MenubarApp | null;

function createMainWindow() {
  // https://electronjs.org/docs/api/browser-window
  const mb = menubar({
    title: 'Google Translate',
    icon: path.join(__static, 'iconTemplate.png'), // https://electronjs.org/docs/api/native-image
    index: isDevelopment
      ? process.env.WEBPACK_DEV_SERVER_URL
      : formatUrl({
          pathname: path.join(__dirname, 'index.html'),
          protocol: 'file',
          slashes: true,
        }),
    height: 640,
    width: 420,
    hasShadow: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    showDockIcon: isDevelopment,
    transparent: true,
    alwaysOnTop: isDevelopment,
    preloadWindow: true,
    webPreferences: {
      scrollBounce: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
  });

  const { window } = mb;
  const { webContents } = window;

  if (!isDevelopment) {
    const menu = new Menu();
    // 加了菜单才有 cmd + shift + i 的功能
    menu.append(
      new MenuItem({
        role: 'about',
        submenu: [{ role: 'toggledevtools' }],
      }),
    );
    // 加了菜单才有 cmd + c 的功能
    menu.append(new MenuItem({ role: 'editMenu' }));
    Menu.setApplicationMenu(menu);
    createProtocol('app');
  }

  ipcMain.on('show-window', () => {
    mb.showWindow();
  });

  ipcMain.on('hide-window', () => {
    mb.hideWindow();
  });

  if (isDevelopment && !process.env.IS_TEST) {
    webContents.openDevTools({ mode: 'undocked' });
  } else {
    webContents.on('devtools-opened', () => {
      window.setAlwaysOnTop(true);
    });
    webContents.on('devtools-closed', () => {
      window.setAlwaysOnTop(false);
    });
  }

  window.on('closed', () => {
    mainWindow = null;
  });

  webContents.on('did-finish-load', () => {
    webContents.setZoomFactor(1);
    webContents.setVisualZoomLevelLimits(1, 1);
    webContents.setLayoutZoomLevelLimits(0, 0);
  });

  mb.on('after-show', () => {
    window.focus();
  });

  return mb;
}

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true });

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  try {
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      await installVueDevtools();
    } else {
      // Check for updates
      checkForUpdates(); // do not await
      ipcMain.on('check-for-updates', async (event: IpcMessageEvent) => {
        event.sender.send('check-for-updates', await checkForUpdates());
      });
    }
  } catch (e) {
    //
  }
  mainWindow = createMainWindow();
  initIpcService(mainWindow, isDevelopment);
  globalShortcut.register('CommandOrControl+Q', async () => {
    if (!mainWindow) return;
    const { window } = mainWindow;
    if (window.isVisible()) {
      mainWindow.hideWindow();
    } else {
      const oldString = clipboard.readText();
      clipboard.writeText(''); // clear clipboard text
      robotjs.keyTap('c', 'command'); // Invalid when no selection text
      await new Promise(resolve => setTimeout(resolve, 300));
      const newString = clipboard.readText();
      const trimStr = newString.trim();
      const originStr = /^[a-zA-Z_-]+$/.test(trimStr)
        ? startCase(trimStr)
        : trimStr;
      clipboard.writeText(oldString);
      mainWindow.showWindow();
      window.webContents.send('translate-clipboard-text', originStr);
    }
  });
});
