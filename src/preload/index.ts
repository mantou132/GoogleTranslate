import { ipcRenderer, clipboard } from 'electron';

import config from '../config';
import { CUSTOM_EVENT } from '../consts';

import textBoxHistory from './textboxhistory';
import injectCSS from './css';
import lang from './lang';
import { click, getTranslateString } from './utils';

import './shortcut';
import './animate';

interface InitPageOption {
  sourceTextArea: string;
  responseContainer: string;
  sourceTTS: string;
  responseTTS: string;
  responseCopy: string;
  signIn: string;
  signOut: string;

  submit?: string;
  sourceLabel?: string;
  targetLabel?: string;
  detectLabel?: string;
  enLabel?: string;
  zhLabel?: string;
  starButton?: string;
}

const initTranslatePage = async (opt: InitPageOption) => {
  await new Promise(resolve => {
    window.addEventListener('load', resolve);
  });

  const sourceTextAreaEle = document.querySelector(opt.sourceTextArea) as HTMLTextAreaElement;
  sourceTextAreaEle.focus();
  textBoxHistory(sourceTextAreaEle, opt.submit);
  ipcRenderer.on(CUSTOM_EVENT.TRANSLATE, (_: any, arg: string) => {
    sourceTextAreaEle.focus();
    if (!arg) return; // 没有选择的文本
    sourceTextAreaEle.value = getTranslateString(arg);
  });

  window.addEventListener('keydown', e => {
    // enter
    if (e.keyCode === 13 && document.activeElement !== sourceTextAreaEle) {
      sourceTextAreaEle.focus();
      e.preventDefault();
    }
    // command + 1
    if (e.keyCode === 49 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const sourceTTSEle = document.querySelector(opt.sourceTTS) as HTMLElement | null;
      if (sourceTTSEle && sourceTextAreaEle.value) {
        click(sourceTTSEle);
      }
    }
    // command + 2
    if (e.keyCode === 50 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const responseTTSEle = document.querySelector(opt.responseTTS) as HTMLElement | null;
      if (responseTTSEle && sourceTextAreaEle.value) {
        click(responseTTSEle);
      }
    }
    // command + 3
    if (e.keyCode === 51 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const responseContainerEle = document.querySelector(opt.responseContainer);
      const responseCopyEle = document.querySelector(opt.responseCopy) as HTMLElement | null;
      const response = responseContainerEle && responseContainerEle.textContent?.trim();
      if (response && responseCopyEle) {
        clipboard.writeText(response);
        click(responseCopyEle);
      }
    }
    // command + s
    if (e.keyCode === 83 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const starButtonEle = opt.starButton && (document.querySelector(opt.starButton) as HTMLElement | null);
      if (starButtonEle) {
        click(starButtonEle);
      }
    }
    // command + i
    if (e.keyCode === 73 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const signInEle = document.querySelector(opt.signIn) as HTMLElement;
      signInEle && signInEle.click();
    }
    // command + o
    if (e.keyCode === 79 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const signOutEle = document.querySelector(opt.signOut) as HTMLElement;
      signOutEle && signOutEle.click();
    }
  });

  if (opt.sourceLabel && opt.targetLabel && opt.enLabel && opt.zhLabel && opt.detectLabel) {
    const i18n = lang();
    const sourceLabelEle = document.querySelector(opt.sourceLabel) as HTMLElement;
    const targetLabelEle = document.querySelector(opt.targetLabel) as HTMLElement;
    const enLabelEle = document.querySelector(opt.enLabel) as HTMLElement;
    const zhLabelEle = document.querySelector(opt.zhLabel) as HTMLElement;
    const detectLabelEle = document.querySelector(opt.detectLabel) as HTMLElement;

    ipcRenderer.on(CUSTOM_EVENT.TRANSLATE, (_: any, arg: string) => {
      const { value } = sourceTextAreaEle;
      if (value === arg) return;
      sourceTextAreaEle.value = '';
      targetLabelEle.click();
      detectLabelEle.click();
      sourceTextAreaEle.value = getTranslateString(value);
    });

    const observer = new MutationObserver(() => {
      const sourceMatch = sourceLabelEle.textContent?.match(i18n.detectReg);
      const sourceStr = sourceMatch ? sourceMatch[1] : '';
      const targetStr = targetLabelEle.textContent;
      if (sourceStr && targetStr?.includes(sourceStr)) {
        targetLabelEle.click();
        if (sourceStr === i18n.detectZh) {
          enLabelEle.click();
        } else {
          zhLabelEle.click();
        }
      }
    });
    observer.observe(sourceLabelEle, {
      attributes: false,
      childList: true,
      subtree: false,
    });
  }
};

const { href } = window.location;
if (href.startsWith(config.translateUrl) || href.startsWith(config.translateUrlFallback)) {
  injectCSS();
  initTranslatePage({
    sourceTextArea: '#source',
    responseContainer: '.tlid-translation',
    sourceTTS: '.src-tts',
    responseTTS: '.res-tts',
    responseCopy: '.copybutton',
    starButton: '.starbutton',
    signIn: 'a[href*="https://accounts.google.com/ServiceLogin"]',
    signOut: 'a[href*="https://accounts.google.com/Logout"]',
    sourceLabel: '.tlid-open-small-source-language-list',
    targetLabel: '.tlid-open-small-target-language-list',
    detectLabel: '[onclick*=sl_list_auto]',
    enLabel: '[onclick*=tl_list_en]',
    zhLabel: '[onclick*=tl_list_zh-CN]',
  });
  ipcRenderer.sendToHost('header-background-change', 'white');
} else {
  ipcRenderer.sendToHost('header-background-change', 'transparent');
}
