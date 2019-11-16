import { css } from '@mantou/gem';

export default async () => {
  await new Promise(resolve => {
    window.addEventListener('DOMContentLoaded', resolve);
  });

  const style = document.createElement('style');
  style.innerText = css`
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

    body {
      -webkit-app-region: drag;
      background: transparent;
      transform: translateX(100%);
    }
    a {
      -webkit-app-region: no-drag;
    }
    .frame {
      background: #f5f5f5;
      margin-left: 20px;
      filter: drop-shadow(rgba(0, 0, 0, 0.5) 0px 0px 0.5px);
      box-shadow: 0 1px 10px rgba(0, 0, 0, 0.15) !important;
    }
  `;
  document.head.append(style);
};
