import path from 'path';
import fs from 'fs';

import { ipcMain, app } from 'electron';

import { createStore, updateStore } from '@mantou/gem/lib/store';

import { CUSTOM_EVENT } from '../consts';

export interface Settings {
  translateShortcut: string;
}

const defaultSettings = {
  translateShortcut: 'CommandOrControl+Q',
};

const settingsPath = path.join(app.getPath('userData'), 'settings.json');
const getSettings = () => {
  if (fs.existsSync(settingsPath)) {
    return JSON.parse(fs.readFileSync(settingsPath, { encoding: 'utf8' }));
  } else {
    return defaultSettings;
  }
};

const settings = createStore<Settings>(getSettings());

ipcMain.on(CUSTOM_EVENT.GET_SETTINGS, event => {
  event.returnValue = settings;
});

ipcMain.on(CUSTOM_EVENT.SETTINGS_CHANGE, (event, data) => {
  updateStore(settings, data);
  fs.writeFileSync(settingsPath, JSON.stringify(settings));
  event.returnValue = true;
});

export default settings;
