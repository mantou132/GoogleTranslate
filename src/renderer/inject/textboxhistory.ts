import startCase from 'lodash/startCase';
import { throttle } from './util';

export default function (arg: HTMLTextAreaElement) {
  let isComposition = false;
  const valueHistory = {
    currentPosition: 0,
    historyValuePool: [''],
  };
  const textarea = arg;
  function handleComposition(e: Event) {
    isComposition = e.type !== 'compositionend';
  }

  function addValueToHistory(text: string) {
    if (!isComposition) {
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
    const recentHistoryValue =
      valueHistory.historyValuePool[valueHistory.currentPosition];
    if (textarea.value !== recentHistoryValue) {
      textarea.value = recentHistoryValue;
    } else if (valueHistory.currentPosition) {
      valueHistory.currentPosition -= 1;
      textarea.value =
        valueHistory.historyValuePool[valueHistory.currentPosition];
    }
  }

  function redo() {
    if (
      valueHistory.currentPosition + 1 <
      valueHistory.historyValuePool.length
    ) {
      valueHistory.currentPosition += 1;
      textarea.value =
        valueHistory.historyValuePool[valueHistory.currentPosition];
    }
  }
  const throttleAddValueToHistory = throttle(addValueToHistory, 1000);
  textarea.addEventListener('input', () => {
    throttleAddValueToHistory(textarea.value);
  });

  textarea.addEventListener('compositionstart', handleComposition);
  textarea.addEventListener('compositionupdate', handleComposition);
  textarea.addEventListener('compositionend', handleComposition);

  textarea.addEventListener('keydown', (e: KeyboardEvent) => {
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
  textarea.addEventListener('paste', (e: ClipboardEvent) => {
    const isSelectionAll =
      !textarea.selectionStart &&
      textarea.selectionEnd === textarea.value.length;
    if (!textarea.value.trim() || isSelectionAll) {
      // Prevent the default pasting event and stop bubbling
      e.preventDefault();
      e.stopPropagation();

      // Get the clipboard data
      const newString = e.clipboardData.getData('text');
      if (!newString) return;

      const trimStr = newString.trim();
      const originStr = /^[a-zA-Z_-]+$/.test(trimStr)
        ? startCase(trimStr)
        : trimStr;
      textarea.value = originStr;
      addValueToHistory(originStr);
    }
  });

  return { addValueToHistory };
}