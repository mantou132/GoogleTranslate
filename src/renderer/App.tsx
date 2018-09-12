import { ipcRenderer, WebviewTag, remote, IpcMessageEvent } from 'electron';
import Vue from 'vue';
import Comopnent from 'vue-class-component';
import styled from 'vue-emotion';

import config from './config';

const isDevelopment = process.env.NODE_ENV !== 'production';

const Wrap = styled.div<{ color: string }>`
  height: 100%;
  &:before {
    content: '\\e601';
    display: block;
    color: ${props => props.color};
    font-family: icon;
    font-size: 32px;
    text-align: center;
    line-height: 0.3;
    transform: rotate(180deg);
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
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.15);
`;

const WebView = styled.webview`
  background: white;
  flex-grow: 1;
`;

@Comopnent
export default class App extends Vue {
  color = 'white';
  public readonly $refs!: {
    webview: WebviewTag;
  };

  mounted() {
    const { webview } = this.$refs;
    window.addEventListener('focus', () => {
      webview.focus();
    });
    webview.addEventListener('dom-ready', () => {
      if (isDevelopment) {
        webview.openDevTools();
      }
      webview.focus();
    });
    webview.addEventListener('new-window', (e) => {
      webview.loadURL(e.url);
    });
    webview.addEventListener(
      'ipc-message',
      ({ channel, args }: IpcMessageEvent) => {
        if (channel === 'header-background-change') {
          const [arg] = args;
          if (arg) {
            this.color = arg;
          }
        }
      },
    );
    ipcRenderer.on('translate-clipboard-text', async (e: Event, arg: any) => {
      if (arg) {
        webview.send('translate-clipboard-text', arg);
      }
    });
  }

  render() {
    const { color } = this;
    return (
      <Wrap color={color}>
        <Page>
          <WebView
            tabIndex="0"
            ref="webview"
            preload={
              isDevelopment
                ? `file://${process.cwd()}/build/dev/inject.js`
                : `file://${__dirname}/js/inject.js`
            }
            allowpopups
            useragent="Mozilla/5.0 (Linux; Android 7.1.1; E5823) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.2 Mobile Safari/537.36"
            src={config.translateUrl}
          />
        </Page>
      </Wrap>
    );
  }
}
