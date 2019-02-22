export default async () => {
  await new Promise((resolve) => {
    window.addEventListener('DOMContentLoaded', resolve);
  });
  // eslint-disable-next-line global-require
  const { injectGlobal } = require('emotion'); // 库中直接操作了 DOM，不能使用顶部 import

  // eslint-disable-next-line no-unused-expressions
  injectGlobal`
  header {
    margin-top: -1px !important;
    height: 0 !important;
    overflow: hidden !important;
    padding: 0 !important;
  }
  #source {
    max-height: none !important;
    padding-right: 50px !important;
  }
  *:not(.moremenu) {
    box-shadow: none !important;
  }
  ::-webkit-scrollbar,
  .go-wrap,
  .ad-panel {
    display: none !important;
  }
  :focus {
    outline: none !important;
  }
  .frame {
    height: 100vh !important;
  }
  .jfk-button-flat:focus {
    border-color: transparent !important;
  }
`;
};
