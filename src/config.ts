export default {
  platform: process.platform,
  isDebug: process.env.NODE_ENV !== 'production',
  translateUrl: 'https://translate.google.com',
  translateUrlFallback: 'https://translate.google.cn',
};
