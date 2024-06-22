import { clipboard } from 'electron';
import robotjs from 'robotjs';

import config from '../config';

export async function delay(time: number) {
  await new Promise(resolve => setTimeout(resolve, time));
}

export async function getSelectionText(modifier: string) {
  function restoreContent() {
    const oldString = clipboard.readHTML();
    const oldImage = clipboard.readImage();
    clipboard.writeHTML('');
    if (!oldImage.isEmpty()) {
      return () => clipboard.writeImage(oldImage);
    }
    if (oldString) {
      return () => clipboard.writeHTML(oldString);
    }
    return () => {
      //
    };
  }
  const restore = restoreContent();
  // window 平台下，ctrl+q 调用此函数时如果 ctrl 弹起的早则会输入 'c'
  if (config.platform === 'win32') {
    await delay(200);
    robotjs.keyTap('c', modifier === 'auto' ? 'control' : modifier);
    await delay(100);
  } else {
    robotjs.keyTap('c', modifier === 'auto' ? 'command' : modifier);
    await delay(300);
  }
  const newString = clipboard.readText();
  restore();
  return newString;
}
