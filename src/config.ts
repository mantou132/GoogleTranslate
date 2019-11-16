export default {
  isMac: process.platform === 'darwin',
  isWin: process.platform === 'win32',
  isLinux: process.platform === 'linux',
  isDebug: process.env.NODE_ENV !== 'production',
  translateUrl: 'https://translate.google.com',
  translateUrlFallback: 'https://translate.google.cn',
};
