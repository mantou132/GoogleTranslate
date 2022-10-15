export default {
  platform: process.platform,
  isDebug: process.env.NODE_ENV !== 'production',
  translateUrl: 'https://translate.google.com',
  translateUrlFallback: 'https://translate.google.com.hk',
  repoRawURL: 'https://raw.githubusercontent.com/mantou132/GoogleTranslate/master/src/preload/config.json',
};
