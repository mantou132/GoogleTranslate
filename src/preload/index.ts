import { ipcRenderer } from 'electron';

import config from '../config';
import { CUSTOM_EVENT } from '../consts';

import textBoxHistory from './textboxhistory';
import injectCSS from './css';
import lang from './lang';
import { click, getTranslateString, dispatchInputEvent } from './utils';

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
    dispatchInputEvent(sourceTextAreaEle);
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
      const responseCopyEle = document.querySelector(opt.responseCopy) as HTMLElement | null;
      if (responseCopyEle) {
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
        if (sourceStr === i18n.detectZh) {
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
  initTranslatePage({
    sourceTextArea: 'textarea[aria-autocomplete="list"]',
    sourceTTS: 'div[data-enable-toggle-playback-speed][data-location="1"] > button[aria-label][jscontroller][jsname]',
    responseTTS: 'div[data-enable-toggle-playback-speed][data-location="2"] > button[aria-label][jscontroller][jsname]',
    responseCopy: 'div[data-enable-toggle-playback-speed][data-location="2"] + button',
    starButton: '[data-saved-translation-limit-reached] > button[aria-pressed]',
    signIn: 'a[href*="https://accounts.google.com/ServiceLogin"]',
    signOut: 'a[href*="https://accounts.google.com/Logout"]',
    sourceCurrentLabel: 'h1#i5 + div > div > c-wiz[jsmodel] > div[jsname][role="button"]:nth-of-type(1)',
    sourceDetectLabel: 'div[data-auto-open-search] > div > div> div div[data-language-code="auto"]',
    targetCurrentLabel: 'h1#i5 + div > div > c-wiz[jsmodel] > div[jsname][role="button"]:nth-of-type(3)',
    targetENLabel:
      'h1#i5 + div + div + div > c-wiz > div:nth-of-type(2) > div[data-auto-open-search] > div > div> div div[data-language-code="en"]',
    targetZHCNLabel:
      'h1#i5 + div + div + div > c-wiz > div:nth-of-type(2) > div[data-auto-open-search] > div > div> div div[data-language-code="zh-CN"]',
  });
  ipcRenderer.sendToHost('header-background-change', 'white');
} else {
  ipcRenderer.sendToHost('header-background-change', 'transparent');
}
