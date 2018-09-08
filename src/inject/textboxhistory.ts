import { throttle } from './util';

export default function (arg: any) {
  let isComposition = false;
  const valueHistory = {
    currentPosition: 0,
    historyValuePool: [''],
  };
  const textarea = arg;
  function handleComposition(e: CompositionEvent) {
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
    if (valueHistory.currentPosition) {
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
  return { addValueToHistory };
}
