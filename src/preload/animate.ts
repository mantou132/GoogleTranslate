import { ipcRenderer, remote } from 'electron';

import { CUSTOM_EVENT } from '../consts';

const duration = 200;
const keyframes = [
  // keyframes
  { transform: 'translateX(100%)' },
  { transform: 'translateX(0)' },
];
const animateOptions: KeyframeAnimationOptions = {
  duration,
  fill: 'forwards',
};

ipcRenderer.on(CUSTOM_EVENT.WINDOW_FADEIN, (_: any) => {
  remote.getCurrentWindow().show();
  document.body.animate(keyframes, {
    ...animateOptions,
  });
});
ipcRenderer.on(CUSTOM_EVENT.WINDOW_FADEOUT, (_: any) => {
  document.body.animate(keyframes, {
    ...animateOptions,
    direction: 'reverse',
  }).onfinish = () => {
    // 不能在这里调用 hide，不然将导致 fade-in 的时候触发 window blur 事件
    // https://github.com/mantou132/electron-window-hide
    // remote.getCurrentWindow().hide();
  };
});
