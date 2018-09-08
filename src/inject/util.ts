export function throttle(fn: Function, delay = 500) {
  let timer = 0;
  return (...rest: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(fn.bind(null, ...rest), delay);
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
