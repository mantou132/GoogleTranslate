export default () => {
  const { lang } = document.documentElement;
  if (lang === 'zh') {
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
