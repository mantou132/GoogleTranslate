import { clipboard } from 'electron';
import { keySequenceParse } from 'enigojs';

import { getTranslateString } from '../utils';

export async function getSelectionText() {
  const oldString = clipboard.readText();
  clipboard.writeText('');
  keySequenceParse('{+META}c{-META}');
  await new Promise(resolve => setTimeout(resolve, 300));
  const newString = clipboard.readText();
  clipboard.writeText(oldString);
  return getTranslateString(newString);
}
