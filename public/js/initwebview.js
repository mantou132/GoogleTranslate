const { ipcRenderer, remote } = require('electron');

window.addEventListener('load', () => {
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
  const window = remote.getCurrentWindow();

  addEventListener('keydown', (e) => {
    // esc
    if (e.keyCode === 27) {
      ipcRenderer.send('hideWindow');
    }
    // command + 1
    if (e.keyCode === 49 && (e.metaKey || e.ctrlKey)) {
      if (window.isVisible() && sourceTextArea.value) {
        e.preventDefault();
        sourceTTS.click();
      }
    }
    // command + 2
    if (e.keyCode === 50 && (e.metaKey || e.ctrlKey)) {
      if (window.isVisible() && sourceTextArea.value) {
        e.preventDefault();
        responseTTS.click();
      }
    }
  });
});
