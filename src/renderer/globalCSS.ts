import { injectGlobal } from 'vue-emotion';
// eslint-disable-next-line no-unused-expressions
injectGlobal`
  * {
    backface-visibility: hidden;
    box-sizing: border-box;
  }
  html,
  body {
    height: 100%;
  }
  html {
    -webkit-font-smoothing: antialiased;
    -webkit-user-drag: none;
    user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu,
      Helvetica Neue, sans-serif;
    font-weight: 300;
    cursor: default;
  }
  body {
    margin: 0;
    overflow: hidden;
    filter: drop-shadow(rgba(0, 0, 0, 0.5) 0px 0px .5px); // 作为边框
  }
`;
