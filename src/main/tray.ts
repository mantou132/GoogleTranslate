import { app, Tray, Menu } from 'electron';

import Window from './window';

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
          label: 'Quit',
          click() {
            app.exit();
          },
        },
      ]);
      this.popUpContextMenu(contextMenu);
    });
  }
}
