import { clipboard } from 'electron';
import robotjs from 'robotjs';

import config from '../config';

export async function delay(time: number) {
  await new Promise(resolve => setTimeout(resolve, time));
}

export async function getSelectionText() {
  const oldString = clipboard.readText();
  clipboard.writeText('');
  // window 平台下，ctrl+q 调用此函数时如果 ctrl 弹起的早则会输入 'c'
  if (config.platform === 'win32') {
    await delay(200);
    robotjs.keyTap('c', 'control');
    await delay(100);
  } else {
    robotjs.keyTap('c', 'command');
    await delay(300);
  }
  const newString = clipboard.readText();
  clipboard.writeText(oldString);
  return newString;
}
