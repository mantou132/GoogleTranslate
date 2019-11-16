import { ipcRenderer } from 'electron';

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

ipcRenderer.on('fade-in', (_: any) => {
  document.body.animate(keyframes, {
    ...animateOptions,
  });
});
ipcRenderer.on('fade-out', (_: any) => {
  document.body.animate(keyframes, {
    ...animateOptions,
    direction: 'reverse',
  }).onfinish = _ => {
    ipcRenderer.send('hide-window');
  };
});
