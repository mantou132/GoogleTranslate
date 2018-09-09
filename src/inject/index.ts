import { ipcRenderer, remote, clipboard } from 'electron';
import { frequency } from './util';
import textBoxHistory from './textboxhistory';
import lang from './lang';
import './style';

window.addEventListener('load', () => {
  const i18n = lang();
  const sourceTextArea = document.querySelector(
    '#source',
  ) as HTMLTextAreaElement;
  const sourceTTS = document.querySelector('.src-tts') as HTMLDivElement;
  const responseTTS = document.querySelector('.res-tts') as HTMLDivElement;
  const responseContainer = document.querySelector(
    '.tlid-translation',
  ) as HTMLSpanElement;
  const signIn = document.querySelector('.gb_Aa.gb_Fb') as HTMLAnchorElement;
  const signOut = document.querySelector('#gb_71') as HTMLAnchorElement;

  const sourceTextHistory = textBoxHistory(sourceTextArea);

  sourceTextArea.focus();

  ipcRenderer.on('translate-clipboard-text', (event: any, arg: string) => {
    sourceTextArea.focus();
    if (!arg) return; // 没有选择的文本
    sourceTextArea.value = arg;
    sourceTextHistory.addValueToHistory(arg);
  });

  const exitApp = frequency(() => remote.app.quit());
  window.addEventListener('keydown', (e) => {
    // command + shift + w
    if (e.keyCode === 87 && e.shiftKey && (e.metaKey || e.ctrlKey)) {
      exitApp();
    }
    // esc
    if (e.keyCode === 27) {
      ipcRenderer.send('hideWindow');
    }
    // enter
    if (e.keyCode === 13 && document.activeElement !== sourceTextArea) {
      sourceTextArea.focus();
      e.preventDefault();
    }
    // command + 1
    if (e.keyCode === 49 && (e.metaKey || e.ctrlKey)) {
      if (sourceTextArea.value) {
        sourceTTS.click();
      }
    }
    // command + 2
    if (e.keyCode === 50 && (e.metaKey || e.ctrlKey)) {
      if (sourceTextArea.value) {
        responseTTS.click();
      }
    }
    // command + i
    if (e.keyCode === 73 && (e.metaKey || e.ctrlKey)) {
      signIn.click();
    }
    // command + o
    if (e.keyCode === 79 && (e.metaKey || e.ctrlKey)) {
      signOut.click();
    }
  });

  const sourceLabel = document.querySelector(
    '.tlid-open-small-source-language-list',
  ) as HTMLDivElement;
  const targetLabel = document.querySelector(
    '.tlid-open-small-target-language-list',
  ) as HTMLDivElement;
  const enLabel = document.querySelector(
    '[onclick*=tl_list_en]',
  ) as HTMLDivElement;
  const zhLabel = document.querySelector(
    '[onclick*=tl_list_zh-CN]',
  ) as HTMLDivElement;
  const observer = new MutationObserver(() => {
    const sourceMatch = (sourceLabel.textContent || '').match(i18n.detechReg);
    const sourceStr = sourceMatch ? sourceMatch[1] : '';
    const targetStr = targetLabel.textContent || '';
    if (sourceStr && targetStr.includes(sourceStr)) {
      if (sourceStr === i18n.detechZh) {
        enLabel.click();
      } else {
        zhLabel.click();
      }
    }
  });
  observer.observe(sourceLabel, {
    attributes: false,
    childList: true,
    subtree: false,
  });
});
