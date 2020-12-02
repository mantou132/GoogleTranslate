import startCase from 'lodash/startCase';

export function getTranslateString(str: string) {
  let translateStr = str;
  // 连体，常见于代码中变量名
  if (/^[a-zA-Z_\-.]+$/.test(translateStr) && !/^[a-z]+$/.test(translateStr)) {
    translateStr = startCase(translateStr);
  }
  // 多行
  if (/\n/.test(translateStr)) {
    const comment1RegRxp = /^\s*\/\/\/?/;
    const comment2RegRxp = /^\s*\*/; // markdown 列表会被当成注释合并翻译
    const lines = translateStr.split('\n');
    translateStr = lines.reduce((p, c) => {
      const isComment1 = comment1RegRxp.test(c);
      const isComment2 = comment2RegRxp.test(c);
      const suffix = isComment1 || isComment2 ? ' ' : '\n'; // 纯文本多行不能自动合并
      return (
        p +
        c
          .replace(comment1RegRxp, '')
          .replace(comment2RegRxp, '')
          .trim() +
        suffix
      );
    }, '');
  }
  return translateStr.trim();
}

export function throttle(fn: Function, delay = 500) {
  let timer = 0;
  return (...rest: any[]) => {
    clearTimeout(timer);
    timer = window.setTimeout(fn.bind(null, ...rest), delay);
  };
}

export function frequency(fn: Function, rate = 2) {
  const pool = [] as number[];
  return (...rest: any[]) => {
    const now = Date.now();
    pool.push(now);

    const recent = pool.filter(time => time >= now - 1000);
    if (recent.length >= rate) {
      fn(...rest);
      pool.length = 0;
    }
  };
}

export function click(ele: HTMLElement) {
  const activeElement = document.activeElement;
  ele.dispatchEvent(new MouseEvent('mousedown'));
  ele.dispatchEvent(new MouseEvent('mouseup'));
  ele.click();
  if (activeElement instanceof HTMLElement) {
    activeElement.focus();
  }
}

export function dispatchInputEvent(ele: HTMLElement) {
  ele.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
}
