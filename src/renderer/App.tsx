import { ipcRenderer, WebviewTag } from 'electron';
import Vue from 'vue';
import Comopnent from 'vue-class-component';
import styled, { injectGlobal } from 'vue-emotion';

const isDevelopment = process.env.NODE_ENV !== 'production';

// eslint-disable-next-line no-unused-expressions
injectGlobal`
  * {
    backface-visibility: hidden;
    box-sizing: border-box;
  }
  html,
  body,
  #app {
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
    filter: drop-shadow(rgba(0, 0, 0, 0.2) 0px 1px 3.5px);
  }
  #app {
    &:before {
      content: '\\e601';
      display: block;
      color: white;
      font-family: icon;
      font-size: 32px;
      text-align: center;
      line-height: 0.3;
      transform: rotate(180deg);
    }
  }
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: calc(100% - 20px);
  height: calc(100% - 19px);
  border-radius: 6px;
  overflow: hidden;
`;

const WebView = styled.webview`
  flex-grow: 1;
`;

@Comopnent
export default class App extends Vue {
  public readonly $refs!: {
    webview: WebviewTag;
  };

  mounted() {
    const { webview } = this.$refs;
    if (isDevelopment) {
      webview.addEventListener('dom-ready', () => {
        webview.openDevTools();
      });
    }
    ipcRenderer.on(
      'translate-clipboard-text',
      async (event: Event, arg: any) => {
        if (arg) {
          webview.send('translate-clipboard-text', arg);
        }
      },
    );
    window.addEventListener('focus', () => {
      webview.focus();
    });
  }

  render() {
    const initWebViewSrc = isDevelopment
      ? `file://${process.cwd()}/build/dev/inject.js`
      : `file://${__dirname}/js/inject.js`;
    return (
      <div id="app">
        <Page>
          <WebView
            tabIndex="0"
            ref="webview"
            preload={initWebViewSrc}
            src="https://translate.google.cn/m/translate"
            useragent="Mozilla/5.0 (Linux; Android 4.4.4; en-us; Nexus 4 Build/JOP40D) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2307.2 Mobile Safari/537.36"
          />
        </Page>
      </div>
    );
  }
}
