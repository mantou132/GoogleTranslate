import { getTranslateString, throttle, dispatchInputEvent } from './utils';

export default function(arg: HTMLTextAreaElement, submit?: string) {
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
      if (text === valueHistory.historyValuePool[valueHistory.currentPosition]) {
        return;
      }
      valueHistory.historyValuePool.length = valueHistory.currentPosition + 1;
      valueHistory.historyValuePool.push(text);
      valueHistory.currentPosition += 1;
      if (submit) {
        const submitEle = document.querySelector(submit) as HTMLElement | null;
        if (submitEle) submitEle.click();
      }
    }
  }

  function undo() {
    const recentHistoryValue = valueHistory.historyValuePool[valueHistory.currentPosition];
    if (textarea.value !== recentHistoryValue) {
      textarea.value = recentHistoryValue;
    } else if (valueHistory.currentPosition) {
      valueHistory.currentPosition -= 1;
      textarea.value = valueHistory.historyValuePool[valueHistory.currentPosition];
    }
    dispatchInputEvent(textarea);
  }

  function redo() {
    if (valueHistory.currentPosition + 1 < valueHistory.historyValuePool.length) {
      valueHistory.currentPosition += 1;
      textarea.value = valueHistory.historyValuePool[valueHistory.currentPosition];
      dispatchInputEvent(textarea);
    }
  }
  const throttleAddValueToHistory = throttle(addValueToHistory, 1000);

  const textareaProtoProp = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
  Object.defineProperty(textarea, 'value', {
    ...textareaProtoProp,
    set(v) {
      const value = String(v);
      throttleAddValueToHistory(value);
      return textareaProtoProp?.set?.apply(this, [value]);
    },
  });

  textarea.addEventListener('input', () => {
    throttleAddValueToHistory(textarea.value);
  });

  textarea.addEventListener('compositionstart', handleComposition);
  textarea.addEventListener('compositionupdate', handleComposition);
  textarea.addEventListener('compositionend', handleComposition);

  textarea.addEventListener('keydown', (e: KeyboardEvent) => {
    // command + y or command + shift + z
    if ((e.keyCode === 89 || (e.keyCode === 90 && e.shiftKey)) && (e.metaKey || e.ctrlKey)) {
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
    const isSelectionAll = !textarea.selectionStart && textarea.selectionEnd === textarea.value.length;
    if (!textarea.value.trim() || isSelectionAll) {
      // Prevent the default pasting event and stop bubbling
      e.preventDefault();
      e.stopPropagation();

      // Get the clipboard data
      const newString = e?.clipboardData?.getData('text');
      if (!newString) return;

      const originStr = getTranslateString(newString);
      textarea.value = originStr;
      dispatchInputEvent(textarea);
      addValueToHistory(originStr);
    }
  });
}
