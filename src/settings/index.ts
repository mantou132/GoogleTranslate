import { app, ipcRenderer } from 'electron';
import { html, render } from '@mantou/gem';

import { CUSTOM_EVENT } from '../consts';
import { Settings } from '../main/settings';
import { version } from '../../package.json';

const translateShortcutList = ['CommandOrControl+Q', 'CommandOrControl+T', 'CommandOrControl+F'];

document.title = 'Settings';

const settings: Settings = ipcRenderer.sendSync(CUSTOM_EVENT.GET_SETTINGS);

const submitHandle = (e: Event) => {
  e.preventDefault();
  const fd = new FormData(document.forms[0]);
  const data = Object.fromEntries(fd.entries());
  ipcRenderer.sendSync(CUSTOM_EVENT.SETTINGS_CHANGE, data);
  window.close();
  app.hide?.();
};

render(
  html`
    <style>
      .action, fieldset {
        margin-block-start: 1em;
      }
      .version {
        margin-block-end: 1em;
      }
    </style>
    <div class="version">Version ${version}</div>
    <form @submit=${submitHandle}>
      <!-- 未选中时值为 off，选中时转成对象后会覆盖该值 -->
      <input name="enableUpdateCheck" type="hidden" value="off">
      <label>
        <input name="enableUpdateCheck" type="checkbox" value="on" ?checked=${settings.enableUpdateCheck ===
          'on'}></input>
        check update
      </label>
      <fieldset>
        <legend>Shortcut</legend>
        <label>
          translate selection text:
          <select name="translateShortcut">
            ${translateShortcutList.map(
              shortcut => html`
                <option value=${shortcut} ?selected=${settings.translateShortcut === shortcut}>${shortcut}</option>
              `,
            )}
          </select>
        </label>
      </fieldset>
      <div class="action"><button type="submit">Save</button></div>
    </form>
  `,
  document.body,
);
