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
  ele.dispatchEvent(new MouseEvent('mousedown'));
  ele.dispatchEvent(new MouseEvent('mouseup'));
  ele.click();
}
