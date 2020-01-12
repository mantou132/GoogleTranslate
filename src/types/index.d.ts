/**
 * - development 环境指向 /public 目录
 * - production 环境由复制到 electron 资源目录下
 */
declare let __public: string;

declare module 'regedit' {
  declare type RegType = 'REG_SZ' | 'REG_DEFAULT';
  export declare type RegValue = { value: any; type: RegType };
  export declare type RegsValues = { [valuename: string]: RegValue };
  export declare type RegKeys = { [keyname: string]: RegsValues };
  declare type Callback = <T>(err: Error, result: T) => void;
  declare let RegEdit: {
    createKey: (keys: string | string[], callback: Callback) => void;
    deleteKey: (keys: string | string[], callback: Callback) => void;
    putValue: (obj: RegKeys, callback: Callback) => void;
    setExternalVBSLocation: (path: string) => void;
  };
  export default RegEdit;
}
