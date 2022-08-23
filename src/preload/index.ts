import { ipcRenderer } from 'electron';

import config from '../config';
import { CUSTOM_EVENT } from '../consts';

import textBoxHistory from './textboxhistory';
import injectCSS from './css';
import lang from './lang';
import { click, getTranslateString, dispatchInputEvent } from './utils';
import localConfig from './config.json';

import './shortcut';
import './animate';

export interface InitPageOption {
  sourceTextArea: string;
  sourceTTS: string;
  responseTTS: string;
  responseCopy: string;
  signIn: string;
  signOut: string;

  submit?: string;
  sourceCurrentLabel?: string;
  sourceDetectLabel?: string;
  targetCurrentLabel?: string;
  targetENLabel?: string;
  targetZHCNLabel?: string;
  starButton?: string;
}

const ready = new Promise(resolve => {
  window.addEventListener('load', resolve);
});

const initTranslatePage = async (opt: InitPageOption) => {
  await ready;

  const sourceTextAreaEle = document.querySelector(opt.sourceTextArea) as HTMLTextAreaElement;
  sourceTextAreaEle.focus();
  textBoxHistory(sourceTextAreaEle, opt.submit);
  ipcRenderer.on(CUSTOM_EVENT.TRANSLATE, (_: any, arg: string) => {
    sourceTextAreaEle.focus();
    if (!arg) return; // 没有选择的文本
    sourceTextAreaEle.value = getTranslateString(arg);
    dispatchInputEvent(sourceTextAreaEle);
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement !== sourceTextAreaEle) {
      sourceTextAreaEle.focus();
      e.preventDefault();
    }
    if (e.key === '1' && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const sourceTTSEle = document.querySelector(opt.sourceTTS) as HTMLElement | null;
      if (sourceTTSEle && sourceTextAreaEle.value) {
        click(sourceTTSEle);
      }
    }
    if (e.key === '2' && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const responseTTSEle = document.querySelector(opt.responseTTS) as HTMLElement | null;
      if (responseTTSEle && sourceTextAreaEle.value) {
        click(responseTTSEle);
      }
    }
    if (e.key === '3' && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const responseCopyEle = document.querySelector(opt.responseCopy) as HTMLElement | null;
      if (responseCopyEle) {
        click(responseCopyEle);
      }
    }
    if (e.key === 's' && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const starButtonEle = opt.starButton && (document.querySelector(opt.starButton) as HTMLElement | null);
      if (starButtonEle) {
        click(starButtonEle);
      }
    }
    if (e.key === 'i' && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const signInEle = document.querySelector(opt.signIn) as HTMLElement;
      signInEle && signInEle.click();
    }
    if (e.key === 'o' && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const signOutEle = document.querySelector(opt.signOut) as HTMLElement;
      signOutEle && signOutEle.click();
    }
  });

  if (
    opt.sourceCurrentLabel &&
    opt.sourceDetectLabel &&
    opt.targetCurrentLabel &&
    opt.targetENLabel &&
    opt.targetZHCNLabel
  ) {
    const i18n = lang();
    const sourceCurrentLabelEle = document.querySelector(opt.sourceCurrentLabel) as HTMLElement;
    const sourceDetectLabelEle = document.querySelector(opt.sourceDetectLabel) as HTMLElement;
    const targetCurrentLabelEle = document.querySelector(opt.targetCurrentLabel) as HTMLElement;
    const targetENLabelEle = document.querySelector(opt.targetENLabel) as HTMLElement;
    const targetZHCNLabelEle = document.querySelector(opt.targetZHCNLabel) as HTMLElement;

    sourceDetectLabelEle.click();

    ipcRenderer.on(CUSTOM_EVENT.TRANSLATE, (_: any, arg: string) => {
      const { value } = sourceTextAreaEle;
      if (value === arg) return;
      sourceTextAreaEle.value = '';
      sourceDetectLabelEle.click();
      sourceTextAreaEle.value = getTranslateString(value);
      dispatchInputEvent(sourceTextAreaEle);
    });

    const observer = new MutationObserver(() => {
      const sourceStr = sourceCurrentLabelEle.textContent?.match(i18n.detectReg)?.[1];
      const targetStr = targetCurrentLabelEle.textContent;
      if (sourceStr && targetStr?.includes(sourceStr)) {
        if (sourceStr.startsWith(i18n.detectZh)) {
          targetENLabelEle.click();
        } else {
          targetZHCNLabelEle.click();
        }
      }
    });
    observer.observe(sourceCurrentLabelEle, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  }
};

const { href } = window.location;
if (href.startsWith(config.translateUrl) || href.startsWith(config.translateUrlFallback)) {
  injectCSS();
  ipcRenderer.sendToHost('header-background-change', 'white');
  fetch(`${config.repoRawURL}?t=${Date.now()}`)
    .then(async res => {
      if (!res.ok) throw new Error();
      initTranslatePage((await res.json()) as typeof localConfig);
    })
    .catch(() => initTranslatePage(localConfig));
} else {
  ipcRenderer.sendToHost('header-background-change', 'transparent');
}
