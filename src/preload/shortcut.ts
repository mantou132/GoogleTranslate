import { ipcRenderer, remote } from 'electron';

import { frequency } from './utils';

const exitApp = frequency(() => remote.app.quit());
window.addEventListener('keydown', e => {
  // command + shift + w
  if (e.keyCode === 87 && e.shiftKey && (e.metaKey || e.ctrlKey)) {
    exitApp();
  }
  // esc
  if (e.keyCode === 27) {
    ipcRenderer.send('hide-window');
  }
});
