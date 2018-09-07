import {
  app,
  protocol,
  systemPreferences,
  ipcMain,
  Menu,
  MenuItem,
  clipboard,
  globalShortcut,
} from 'electron';
import { format as formatUrl } from 'url';
import path from 'path';
import robotjs from 'robotjs';
import startCase from 'lodash/startCase';
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';
import menubar from './lib/menubar';
import checkForUpdates from './checkForUpdates';

const isDevelopment = process.env.NODE_ENV !== 'production';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true });

function createMainWindow() {
  // https://electronjs.org/docs/api/browser-window
  const mb = menubar({
    title: 'Google Translate',
    icon: path.join(__static, 'iconTemplate.ico'), // https://electronjs.org/docs/api/native-image
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

  systemPreferences.setUserDefault(
    'AppleShowScrollBars',
    'string',
    'Automatic',
  );

  if (!isDevelopment) {
    const menu = new Menu();
    menu.append(
      new MenuItem({
        role: 'about',
        submenu: [{ role: 'toggledevtools' }],
      }),
    );
    menu.append(new MenuItem({ role: 'editMenu' }));
    Menu.setApplicationMenu(menu);
    createProtocol('app');
  }

  ipcMain.on('showWindow', () => {
    mb.showWindow();
  });

  ipcMain.on('hideWindow', () => {
    mb.hideWindow();
  });

  if (isDevelopment && !process.env.IS_TEST) {
    webContents.openDevTools({ mode: 'undocked' });
  }

  window.on('closed', () => {
    mainWindow = null;
  });

  webContents.on('did-finish-load', () => {
    webContents.setZoomFactor(1);
    webContents.setVisualZoomLevelLimits(1, 1);
    webContents.setLayoutZoomLevelLimits(0, 0);
  });

  webContents.on('devtools-opened', () => {
    window.focus();
    setImmediate(() => {
      window.focus();
    });
  });

  mb.on('after-show', () => {
    window.focus();
  });

  return mb;
}

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
      ipcMain.on('check-for-updates', async (event, arg) => {
        event.sender.send('check-for-updates', await checkForUpdates());
      });
    }
  } finally {
    mainWindow = createMainWindow();
    globalShortcut.register('CommandOrControl+Q', async () => {
      const { window } = mainWindow;
      if (window.isVisible()) {
        mainWindow.hideWindow();
      } else {
        const oldString = clipboard.readText();
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
  }
});
