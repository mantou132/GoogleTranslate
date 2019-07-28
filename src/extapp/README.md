## web-ext-native-message

浏览器扩展进程 <-- 标准输入/输出 --> wenm <-- Socket 进程间通信 --> 本机 App

作为一个本机 App 和浏览器通信的中间程序，如果采用 nodejs 编写，打包文件较大，所以使用 rust 编写，
兼容 nodejs 的 node-ipc，用来和 node 端的 node-ipc 通信

### 使用

```bash
# 编译
cargo build --release
# 复制并重命名
cp target/release/google-translate-bridge bridge
# 应用启动时会自动连接 path 为 `/tmp/app.<filename>` 的 unix socket
```

### node-ipc 通信规范

- [平台](https://nodejs.org/api/net.html#net_ipc_support): UNIX domain / named pipe
- 名称: `\\\\.\\pipe\\${options.path}` / `/tmp/app.${id}`
- 消息格式: [js-message](https://www.npmjs.com/package/js-message)
  - 序列化消息 + 分割符(默认换页符)
  - type
  - data

### web-ext 通信规范

前面 4 个字节存长度，后面写 `utf-8` 编码的字符串内容。

注意：webextension 会自动序列化

### TODO

- 支持 windows pipe name
