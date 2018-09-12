export default async (type = 'google') => {
  await new Promise((resolve) => {
    window.addEventListener('DOMContentLoaded', resolve);
  });
  // eslint-disable-next-line global-require
  const { injectGlobal } = require('emotion'); // 库中直接操作了 DOM，不能使用顶部 import

  if (type === 'google') {
    // eslint-disable-next-line no-unused-expressions
    injectGlobal`
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
      .gb_Dd {
        margin-top: -1px !important;
        height: 0 !important;
        overflow: hidden !important;
        padding: 0 !important;
      }
      .frame {
        height: 100vh !important;
      }
      .jfk-button-flat:focus {
        border-color: transparent !important;
      }
    `;
  }

  if (type === 'baidu') {
    // eslint-disable-next-line no-unused-expressions
    injectGlobal`
      header,
      .trans-btn,
      .app-bar,
      .article,
      .st-resource,
      .dict-origin,
      .st-net-tips,
      .bottom-intro,
      ::-webkit-scrollbar {
        display: none !important;
      }
      #j-textarea::placeholder {
        font-size: 23px;
        opacity: .5;
      }
    `;
  }
};
