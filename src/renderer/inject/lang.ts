export default () => {
  if ((document.documentElement as HTMLElement).lang === 'zh-CN') {
    return {
      detechReg: /检测到(.*)/,
      detechZh: '中文',
    };
  }
  return {
    detechReg: /(.*) - detected/,
    detechZh: 'Chinese',
  };
};
