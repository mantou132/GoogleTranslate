export default () => {
  if ((document.documentElement as HTMLElement).lang === 'zh-CN') {
    return {
      detectReg: /检测到(.*)/,
      detectZh: '中文',
    };
  }
  return {
    detectReg: /(.*) - detected/,
    detectZh: 'Chinese',
  };
};
