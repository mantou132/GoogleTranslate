import { getCurrentWindow, app } from '@electron/remote';

import { frequency } from './utils';

const exitApp = frequency(() => app.quit());
window.addEventListener('keydown', e => {
  // command + shift + w
  if (e.keyCode === 87 && e.shiftKey && (e.metaKey || e.ctrlKey)) {
    exitApp();
  }
  // esc
  if (e.keyCode === 27) {
    getCurrentWindow().emit('blur');
  }
});
