import { app, globalShortcut } from 'electron';
import { connect } from '@mantou/gem/lib/store';

import { SHORTCUT } from '../consts';

import settings from './settings';

/**
 * 找到快捷键的最新设置
 */
const getShortcut = (shortcut: SHORTCUT) => {
  switch (shortcut) {
    case SHORTCUT.TRANSLATE:
      return settings.translateShortcut;
  }
};

/**
 * 注册快捷键
 * 当 settings 更新时重新注册
 */
export default function register(shortcut: SHORTCUT, callback: () => void) {
  let accelerator = getShortcut(shortcut);
  const exec = () => {
    // 移除老绑定
    if (globalShortcut.isRegistered(accelerator)) {
      globalShortcut.unregister(accelerator);
    }
    // 注册新绑定
    accelerator = getShortcut(shortcut);
    globalShortcut.register(accelerator, callback);
  };
  connect(settings, exec);
  exec();
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
