<p align="center">
  <a href="https://github.com/mantou132/GoogleTranslate">
    <img alt="Google Translate" src="https://i.loli.net/2018/07/01/5b38a1b1dcc25.png" width="600">
  </a>
</p>

<p align="center">
  <a href="https://github.com/mantou132/GoogleTranslate/releases"><img alt="GitHub release" src="https://img.shields.io/github/release/mantou132/GoogleTranslate.svg?style=for-the-badge"></a>
  <a href="https://travis-ci.org/mantou132/GoogleTranslate"><img alt="Build Status" src="https://img.shields.io/travis/mantou132/GoogleTranslate/google-webapp.svg?style=for-the-badge"></a>
  <a href="./LICENSE"><img alt="LICENSE GPL" src="https://img.shields.io/badge/license-gpl-yellow.svg?style=for-the-badge"></a>
  <a href="https://github.com/prettier/prettier"><img alt="Code Style: Prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge"></a>
</p>

> 🌐 Google 翻译 Mac 客户端（Forked from [MoeFE/GoogleTranslate](https://github.com/MoeFE/GoogleTranslate)）

## 预览

<img alt="应用程序主界面" src="./screenshot/Screen Shot 2018-09-08 at 07.59.35.png" width="420">

## 使用方式

- 安装浏览器[扩展](https://github.com/mantou132/CallGoogleTranslate)，在浏览器中选择文本，使用上下文菜单进行翻译
- 在任意应用中选择文本，使用 <kbd>command</kbd> + <kbd>q</kbd> 进行翻译
- 在窗口内使用快捷键：<br>
  <kbd>esc</kbd> - 关闭窗口<br>
  <kbd>enter</kbd> - 聚焦到输入框<br>
  <kbd>command</kbd> + <kbd>1</kbd> - 全局快捷键<br>
  <kbd>command</kbd> + <kbd>2</kbd> - 全局快捷键<br>
  <kbd>command</kbd> + <kbd>i</kbd> - 登陆 Google 账号<br>
  <kbd>command</kbd> + <kbd>o</kbd> - 登出 Google 账号<br>
  <kbd>command</kbd> + <kbd>shift</kbd> + <kbd>w</kbd> 连续按两次 - 退出应用

## 下载

您可以在[这里](https://github.com/mantou132/GoogleTranslate/releases/latest)手动下载最新版本

## FAQ

Q：Electron 不是跨平台的吗？为什么只有 Mac 版本？
A：因为 UI 的交互设计不适用于其他操作系统

Q：为什么不能自动更新？
A：因为我没有加入 [Apple Developer Program](https://developer.apple.com/programs/)（需要缴纳年费），无法进行[代码签名](https://electronjs.org/docs/tutorial/code-signing)，所以无法使用自动更新功能

Q：无法打开应用，提示该应用来自身份不明的开发者？
A：在终端中输入 `sudo spctl –master-disable` 然后按回车确认，密码是系统开机密码。
然后打开系统偏好设置 ⇨ 安全性和隐私 ⇨ 任何来源，勾选即可。

## 参与贡献

1.  Fork it!
2.  将自己添加为贡献者：`yarn contributors`
3.  创建功能分支：`git checkout -b my-new-feature`
4.  提交你的更改：`git commit -am 'Add some feature'`
5.  推送这个分支：`git push origin my-new-feature`
6.  提交一个拉取请求 :D

## 贡献者

感谢这些美好的人 ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/20062482?v=4" width="100px;"/><br /><sub><b>さくら</b></sub>](https://qwq.cat)<br />[💻](https://github.com/MoeFE/GoogleTranslate/commits?author=u3u "Code") [📖](https://github.com/MoeFE/GoogleTranslate/commits?author=u3u "Documentation") [🎨](#design-u3u "Design") [🤔](#ideas-u3u "Ideas, Planning, & Feedback") | [<img src="https://avatars1.githubusercontent.com/u/9591690?v=4" width="100px;"/><br /><sub><b>Batur</b></sub>](https://github.com/Batur24)<br />[💬](#question-Batur24 "Answering Questions") [🐛](https://github.com/MoeFE/GoogleTranslate/issues?q=author%3ABatur24 "Bug reports") [🤔](#ideas-Batur24 "Ideas, Planning, & Feedback") [⚠️](https://github.com/MoeFE/GoogleTranslate/commits?author=Batur24 "Tests") | [<img src="https://avatars3.githubusercontent.com/u/3841872?v=4" width="100px;"/><br /><sub><b>mantou</b></sub>](https://github.com/mantou132)<br />[💻](https://github.com/MoeFE/GoogleTranslate/commits?author=mantou132 "Code") [🤔](#ideas-mantou132 "Ideas, Planning, & Feedback") |
| :---: | :---: | :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

该项目遵循 [all-contributors](https://github.com/kentcdodds/all-contributors) 规范，欢迎任何形式的贡献！

## TODO

- 翻译指针位置的单词

## 协议

[GNU General Public License v3.0](./LICENSE)
本项目仅供学习交流和私人使用，禁止商业用途

> [mantou](https://xianqiao.wang) · GitHub [@mantou132](https://github.com/mantou132) · Twitter [@594mantou](https://twitter.com/594mantou)
