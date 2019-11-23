import { clipboard } from 'electron';
import robotjs from 'robotjs';

import { getTranslateString } from '../utils';
import config from '../config';

export async function getSelectionText() {
  const oldString = clipboard.readText();
  clipboard.writeText('');
  robotjs.keyTap('c', config.platform === 'darwin' ? 'command' : 'control');
  await new Promise(resolve => setTimeout(resolve, 300));
  const newString = clipboard.readText();
  clipboard.writeText(oldString);
  return getTranslateString(newString);
}
