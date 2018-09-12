import { ipcRenderer } from 'electron';
import textBoxHistory from './textboxhistory';
import injectCSS from './injectCSS';
import lang from './lang';
import config from '../config';
import registerShortcut from '../globalShortcut';

registerShortcut();

const initTranslatePage = () => {
  const i18n = lang();
  const sourceTextArea = document.querySelector(
    '#source',
  ) as HTMLTextAreaElement;
  const sourceTTS = document.querySelector('.src-tts') as HTMLDivElement;
  const responseTTS = document.querySelector('.res-tts') as HTMLDivElement;
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

  window.addEventListener('keydown', (e) => {
    // enter
    if (e.keyCode === 13 && document.activeElement !== sourceTextArea) {
      sourceTextArea.focus();
      e.preventDefault();
    }
    // command + 1
    if (e.keyCode === 49 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      if (sourceTextArea.value) {
        sourceTTS.dispatchEvent(new MouseEvent('mousedown'));
        sourceTTS.dispatchEvent(new MouseEvent('mouseup'));
      }
    }
    // command + 2
    if (e.keyCode === 50 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      if (sourceTextArea.value) {
        responseTTS.dispatchEvent(new MouseEvent('mousedown'));
        responseTTS.dispatchEvent(new MouseEvent('mouseup'));
      }
    }
    // command + i
    if (e.keyCode === 73 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      signIn.click();
    }
    // command + o
    if (e.keyCode === 79 && !e.altKey && (e.metaKey || e.ctrlKey)) {
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
};

if (window.location.href.startsWith(config.translateUrl)) {
  ipcRenderer.sendToHost('header-background-change', 'white');
  window.addEventListener('DOMContentLoaded', injectCSS);
  window.addEventListener('load', initTranslatePage);
} else {
  ipcRenderer.sendToHost('header-background-change', '#4285f4');
  window.addEventListener('keydown', (e) => {
    // command + back
    if (e.keyCode === 8 && (e.metaKey || e.ctrlKey)) {
      window.location.href = config.translateUrl;
    }
  });
}
