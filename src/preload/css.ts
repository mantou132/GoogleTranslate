import { css } from '@mantou/gem';

export default async () => {
  await new Promise(resolve => {
    window.addEventListener('DOMContentLoaded', resolve);
  });

  const style = document.createElement('style');
  style.innerText = css`
    /* debug */
    body {
      -webkit-app-region: drag;
    }
    a {
      -webkit-app-region: no-drag;
    }
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
  document.head.append(style);
};
