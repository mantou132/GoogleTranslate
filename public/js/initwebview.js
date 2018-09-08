/**
 * 该脚本注入 Google 翻译页面运行
 * 修改完需要 `command + r` 重新加载 Google 翻译页面
 */

const { ipcRenderer, remote, clipboard } = require('electron');

addEventListener('load', () => {
  const valueHistory = {
    currentPosition: 0,
    historyValuePool: [''],
  };
  const sourceTextArea = document.querySelector('#source');

  let isComposition = false;

  ipcRenderer.on('translate-clipboard-text', (event, arg) => {
    sourceTextArea.value = arg;
    sourceTextArea.focus();
    addValueToHistory(arg);
  });

  sourceTextArea.addEventListener('input', throttle(addValueToHistory, 1000));

  sourceTextArea.addEventListener('compositionstart', handleComposition);
  sourceTextArea.addEventListener('compositionupdate', handleComposition);
  sourceTextArea.addEventListener('compositionend', handleComposition);

  sourceTextArea.addEventListener('keydown', (e) => {
    // command + y or command + shift + z
    if (
      (e.keyCode === 89 || (e.keyCode === 90 && e.shiftKey)) &&
      (e.metaKey || e.ctrlKey)
    ) {
      e.preventDefault();
      redo();
    }
    // command + z
    if (e.keyCode === 90 && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
  });

  function handleComposition(e) {
    isComposition = e.type !== 'compositionend';
  }

  function throttle(fn, delay = 500) {
    let timer = 0;
    return (...rest) => {
      clearTimeout(timer);
      timer = setTimeout(fn.bind(null, ...rest), delay);
    };
  }

  function addValueToHistory(e) {
    if (!isComposition) {
      const text = (typeof e === 'string' ? e : e.target.value).trim();
      if (
        text === valueHistory.historyValuePool[valueHistory.currentPosition]
      ) {
        return;
      }
      valueHistory.historyValuePool.length = valueHistory.currentPosition + 1;
      valueHistory.historyValuePool.push(text);
      valueHistory.currentPosition += 1;
    }
  }

  function undo() {
    if (valueHistory.currentPosition) {
      valueHistory.currentPosition -= 1;
      sourceTextArea.value =
        valueHistory.historyValuePool[valueHistory.currentPosition];
    }
  }

  function redo() {
    if (
      valueHistory.currentPosition + 1 <
      valueHistory.historyValuePool.length
    ) {
      valueHistory.currentPosition += 1;
      sourceTextArea.value =
        valueHistory.historyValuePool[valueHistory.currentPosition];
    }
  }

  const sourceTTS = document.querySelector('.src-tts');
  const responseTTS = document.querySelector('.res-tts');
  const responseContainer = document.querySelector('.tlid-translation');

  const responseCopy = responseTTS.cloneNode(true);
  responseCopy.setAttribute('data-tooltip', '复制');
  responseCopy.setAttribute('aria-label', '复制');
  responseCopy.classList.remove('res-tts');
  responseCopy.classList.add('res-copy');
  responseCopy.addEventListener('click', () => {
    const response = responseContainer.textContent.trim();
    if (response) {
      clipboard.writeText(response);
      responseCopy.classList.add('done');
      setTimeout(() => {
        responseCopy.classList.remove('done');
      }, 1000);
    }
  });
  responseTTS.after(responseCopy);

  addEventListener('click', () => {
    setTimeout(() => {
      if (!getSelection().toString()) sourceTextArea.focus();
    });
  });

  addEventListener('keydown', (e) => {
    // command + shift + q
    if (e.keyCode === 81 && e.shiftKey && (e.metaKey || e.ctrlKey)) {
      remote.app.exit();
    }
    // esc
    if (e.keyCode === 27) {
      ipcRenderer.send('hideWindow');
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
    // command + 3
    if (e.keyCode === 51 && (e.metaKey || e.ctrlKey)) {
      if (responseContainer.textContent.trim()) {
        responseCopy.click();
      }
    }
  });

  const sourceLabel = document.querySelector(
    '.tlid-open-small-source-language-list',
  );
  const targetLabel = document.querySelector(
    '.tlid-open-small-target-language-list',
  );
  const observer = new MutationObserver(() => {
    const sourceMatch = sourceLabel.textContent.match(/检测到(.*)/);
    const sourceStr = sourceMatch ? sourceMatch[1] : '';
    const targetStr = targetLabel.textContent;
    if (sourceStr && targetStr.includes(sourceStr)) {
      if (sourceStr === '中文') {
        _e(event, 'changeLanguage+0', 'tl_list_en_r');
      } else {
        _e(event, 'changeLanguage+0', 'tl_list_zh-CN');
      }
    }
  });
  observer.observe(sourceLabel, {
    attributes: false,
    childList: true,
    subtree: false,
  });
});

addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.innerHTML = `
    #source {
      max-height: none !important;
      padding-right: 50px !important;
    }
    *:not(.moremenu) {
      box-shadow: none !important;
    }
    ::-webkit-scrollbar,
    .res-copy div,
    .go-wrap,
    .ad-panel {
      display: none !important;
    }
    :focus {
      outline: none !important;
    }
    .gb_Dd {
      margin-top: -1px !important;
      height: 0 !important;
      overflow: hidden !important;
      padding: 0 !important;
    }
    .frame {
      height: 100vh !important;
    }
    .jfk-button-flat:focus {
      border-color: transparent !important;
    }
    .res-copy {
      background: no-repeat center/45% url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAQAAABIkb+zAAABk0lEQVR4Ae3cNVoFQRAEYNwPgDsJvt0nQxM0ejERdgKcG+ARziVwd/cQp2ZfMx9Vc4Ctf91jGIZ5P9W52iBTeqgP4Y5Qyldk6LDc4+WMAKXJuoQXMwRIrz54DJBSufMaEET0wWuArvgOuPAcAEzAIARYhQACCCCgOjeol2nd/e0BTDoNAZomg8ApH0bAAZooC0BxlIADpAsojRJwgGbJlT6YEXBA0ArUxQk4QOfQuhgBB2yg5/8YAQecowCQYA8ACfYAkGAPAAn2AIyAAy5QAEiwB4AEewBIsAdABBwglygAJNgDQII9ACTYA0CCPQAj4IArFAAS7AE4wR7wC4JXgFeCb4AvCM4Aeo0CfkGwB+CDAAL+DOCGAAL+OeCWAAII8BogdwQQQIDfgHsCAAAaAgjAow8EEEAAAQQQ4C8glgAC/Adg0SMTwJE7wLIJYMX0Y1F8BBFngNoyg/sSt5of4y7SH3VAj+NP1mUtqvWXSpPd/zRgPDrXxnKvwxUZMWEkKJBmmQ5xp7qrk9pYnft5C4ZhHgEvy6Z99ElYFAAAAABJRU5ErkJggg==) !important;
      filter: brightness(100) !important;
    }
    .res-copy.done {
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAQAAABIkb+zAAABOElEQVR4Ae3TgUYEYRSG4YW1diNCwAIGUJs5h7q3QIGQhAjdRyIt7EIQBF1FRBcwKXwso+KwZw7v+1/A/3zzmxEREREREREREW3W7ttpYf7hnr9557d1+a/efR+7LszXhKp8nYuqfJ32vCZfx87gw/+jZrc6/wV+UvATgg8f/mKnOv8ZflbwE4IP30/syWejQPNpIv/o2D698/V8GuCv8/jtD7/ThGp8/9CVmlCGvzjY4GtCFf7c33uuXv3/d/aZrTL4yu56rtcr5H/9wIRmks8PTbClJgyWH5jQTBL5gQni2zKbH5iQzw9NGCJf2c1vE/L5gQk+zufHJjz4eOh85Vd9TL/3xxA//xXK8DWhLl8TSvKVXZbma0JdvibU5WtCXb4m1OVrQl2+JhTla8J2+URERERERET0BTMPgAX3NpM4AAAAAElFTkSuQmCC) !important;
    }
  `;
  document.head.append(style);
});
