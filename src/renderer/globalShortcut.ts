import { ipcRenderer, remote } from 'electron';
import { frequency } from './inject/util';

export default function () {
  const exitApp = frequency(() => remote.app.quit());
  window.addEventListener('keydown', (e) => {
    // command + shift + w
    if (e.keyCode === 87 && e.shiftKey && (e.metaKey || e.ctrlKey)) {
      exitApp();
    }
    // command + r
    if (e.keyCode === 82 && (e.metaKey || e.ctrlKey)) {
      window.location.reload();
    }
    // esc
    if (e.keyCode === 27) {
      ipcRenderer.send('hide-window');
    }
  });
}
