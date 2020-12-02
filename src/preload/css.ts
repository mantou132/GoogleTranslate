import { css } from '@mantou/gem/lib/utils';

import config from '../config';

export default async () => {
  await new Promise(resolve => {
    window.addEventListener('DOMContentLoaded', resolve);
  });

  const style = document.createElement('style');
  style.innerText = css`
    header,
    body > c-wiz > div:first-child > div:first-child {
      margin-top: -1px !important;
      height: 0 !important;
      overflow: hidden !important;
      padding: 0 !important;
    }
    c-wiz c-wiz c-wiz c-wiz > h2 ~ span > span > div,
    c-wiz c-wiz c-wiz c-wiz > h2 ~ span > span > div > div:last-child {
      max-height: none !important;
      padding-right: 50px !important;
    }
    * {
      box-shadow: none !important;
    }
    ::-webkit-scrollbar,
    h1#i5 + div c-wiz > h2 ~ div[jsaction] > div[aria-label],
    body > c-wiz nav + div {
      display: none !important;
    }
    :focus {
      outline: none !important;
    }
    body {
      background: transparent !important;
      transform: translateX(100%) !important;
    }
    body > c-wiz[view] {
      overflow: auto;
      height: 100vh !important;
      background: #f5f5f5 !important;
      margin: ${config.platform === 'win32' ? '20px' : '0'} 0 ${config.platform === 'linux' ? '20px' : '0'} 20px !important;
      filter: drop-shadow(rgba(0, 0, 0, 0.5) 0px 0px 0.5px) !important;
      box-shadow: 0 1px 10px rgba(0, 0, 0, 0.15) !important;
    }
  `;
  document.head.append(style);
};
