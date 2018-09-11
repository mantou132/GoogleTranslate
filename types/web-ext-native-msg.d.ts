// https://github.com/asamuzaK/webExtNativeMsg

declare module 'web-ext-native-msg' {
  export class Input {
    decode(opts: string | Buffer): string[] | null;
  }
  export class Output {
    encode(opts: string): Buffer | null;
  }
}
