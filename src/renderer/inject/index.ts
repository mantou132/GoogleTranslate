import { ipcRenderer, clipboard } from 'electron';
import textBoxHistory from './textboxhistory';
import injectCSS from './injectCSS';
import lang from './lang';
import config from '../config';

interface IInitPageOption {
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
  enLabel?: string;
  zhLabel?: string;
}

const initTranslatePage = async (opt: IInitPageOption) => {
  await new Promise((resolve) => {
    window.addEventListener('load', resolve);
  });

  const sourceTextAreaEle = document.querySelector(
    opt.sourceTextArea,
  ) as HTMLTextAreaElement;
  sourceTextAreaEle.focus();
  textBoxHistory(sourceTextAreaEle, opt.submit);
  ipcRenderer.on('translate-clipboard-text', (_: any, arg: string) => {
    sourceTextAreaEle.focus();
    if (!arg) return; // 没有选择的文本
    sourceTextAreaEle.value = arg;
  });

  window.addEventListener('keydown', (e) => {
    // enter
    if (e.keyCode === 13 && document.activeElement !== sourceTextAreaEle) {
      sourceTextAreaEle.focus();
      e.preventDefault();
    }
    // command + 1
    if (e.keyCode === 49 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const sourceTTSEle = document.querySelector(
        opt.sourceTTS,
      ) as HTMLElement | null;
      if (sourceTTSEle && sourceTextAreaEle.value) {
        sourceTTSEle.dispatchEvent(new MouseEvent('mousedown'));
        sourceTTSEle.dispatchEvent(new MouseEvent('mouseup'));
        sourceTTSEle.click();
      }
    }
    // command + 2
    if (e.keyCode === 50 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const responseTTSEle = document.querySelector(
        opt.responseTTS,
      ) as HTMLElement | null;
      if (responseTTSEle && sourceTextAreaEle.value) {
        responseTTSEle.dispatchEvent(new MouseEvent('mousedown'));
        responseTTSEle.dispatchEvent(new MouseEvent('mouseup'));
        responseTTSEle.click();
      }
    }
    // command + 3
    if (e.keyCode === 51 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const responseContainerEle = document.querySelector(
        opt.responseContainer,
      );
      const responseCopyEle = document.querySelector(
        opt.responseCopy,
      ) as HTMLElement | null;
      const response =
        responseContainerEle && responseContainerEle.textContent!.trim();
      if (response && responseCopyEle) {
        clipboard.writeText(response);
        responseCopyEle.dispatchEvent(new MouseEvent('mousedown'));
        responseCopyEle.dispatchEvent(new MouseEvent('mouseup'));
        responseCopyEle.click();
      }
    }
    // command + i
    if (e.keyCode === 73 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const signInEle = document.querySelector(opt.signIn) as HTMLElement;
      signInEle.click();
    }
    // command + o
    if (e.keyCode === 79 && !e.altKey && (e.metaKey || e.ctrlKey)) {
      const signOutEle = document.querySelector(opt.signOut) as HTMLElement;
      signOutEle.click();
    }
  });

  if (opt.sourceLabel && opt.targetLabel && opt.enLabel && opt.zhLabel) {
    const i18n = lang();
    const sourceLabelEle = document.querySelector(
      opt.sourceLabel,
    ) as HTMLElement;
    const targetLabelEle = document.querySelector(
      opt.targetLabel,
    ) as HTMLElement;
    const enLabelEle = document.querySelector(opt.enLabel) as HTMLElement;
    const zhLabelEle = document.querySelector(opt.zhLabel) as HTMLElement;
    const observer = new MutationObserver(() => {
      const sourceMatch = sourceLabelEle.textContent!.match(i18n.detechReg);
      const sourceStr = sourceMatch ? sourceMatch[1] : '';
      const targetStr = targetLabelEle.textContent;
      if (sourceStr && targetStr!.includes(sourceStr)) {
        if (sourceStr === i18n.detechZh) {
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
if (href.startsWith(config.translateUrl)) {
  injectCSS('google');
  initTranslatePage({
    sourceTextArea: '#source',
    responseContainer: '.tlid-translation',
    sourceTTS: '.src-tts',
    responseTTS: '.res-tts',
    responseCopy: '.copybutton',
    signIn: '.gb_Aa.gb_Fb',
    signOut: '#gb_71',
    sourceLabel: '.tlid-open-small-source-language-list',
    targetLabel: '.tlid-open-small-target-language-list',
    enLabel: '[onclick*=tl_list_en]',
    zhLabel: '[onclick*=tl_list_zh-CN]',
  });
  ipcRenderer.sendToHost('header-background-change', 'white');
} else if (href.startsWith(config.translateUrlFallback)) {
  injectCSS('baidu');
  initTranslatePage({
    sourceTextArea: '#j-textarea',
    submit: '.trans-btn',
    responseContainer: '.trans-content',
    sourceTTS: '#single-sound .horn',
    responseTTS: '.concise-trans .horn',
    responseCopy: '.copy-btn',
    signIn: '#login-btn',
    signOut: '.go-to-logout',
  });
  ipcRenderer.sendToHost('header-background-change', 'white');
} else {
  ipcRenderer.sendToHost('header-background-change', 'transparent');
}
