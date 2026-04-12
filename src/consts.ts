export const CUSTOM_EVENT = {
  // 来自浏览器扩展的翻译请求
  TRANSLATE_REQUEST: 'translate-text',
  // 发送给 google translate 进行翻译
  TRANSLATE: 'translate',

  // 用默认浏览器打开链接
  OPEN_URL: 'open-url',

  WINDOW_FADEIN: 'fade-in',
  WINDOW_FADEOUT: 'fade-out',

  SETTINGS_CHANGE: 'settings-change',
  GET_SETTINGS: 'get-settings',
};

export enum SHORTCUT {
  TRANSLATE,
}
