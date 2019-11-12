# Goolge Translate

## 使用方式

- 安装浏览器[扩展](https://github.com/mantou132/CallGoogleTranslate)，在浏览器中选择文本，使用上下文菜单进行翻译
- 在任意应用中选择文本，使用 <kbd>command</kbd> + <kbd>q</kbd> 进行翻译
- 在窗口内使用快捷键：<br>
  <kbd>esc</kbd> - 关闭窗口<br>
  <kbd>enter</kbd> - Google 翻译页面聚焦到输入框<br>
  <kbd>command</kbd> + <kbd>r</kbd> - 重载应用<br>
  <kbd>command</kbd> + <kbd>1</kbd> - 朗读源文本<br>
  <kbd>command</kbd> + <kbd>2</kbd> - 朗读翻译文本<br>
  <kbd>command</kbd> + <kbd>3</kbd> - 复制翻译文本<br>
  <kbd>command</kbd> + <kbd>s</kbd> - 保存/撤销保存翻译<br>
  <kbd>command</kbd> + <kbd>i</kbd> - 登陆 Google 账号<br>
  <kbd>command</kbd> + <kbd>o</kbd> - 登出 Google 账号<br>
  <kbd>command</kbd> + <kbd>shift</kbd> + <kbd>w</kbd> 连续按两次 - 退出应用

## 下载

您可以在[这里](https://github.com/mantou132/GoogleTranslate/releases/latest)手动下载最新版本

## FAQ

Q：为什么快捷键要使用 <kbd>command</kbd> + <kbd>q</kbd>？<br>
A：个人习惯，平常会误触导致 App 被关闭

Q：为什么 <kbd>command</kbd> + <kbd>q</kbd> 打开翻译窗口没有自动填充选择的文本？<br>
A：可能被 OS 禁止了，试试重新为应用授权。如：<a href="./screenshot/Screen Shot 2018-11-21 at 00.57.30.png">图片</a>

## 开发

```bash
# serve renderer/preload
npm run watch
# run electron app
npm run start
```

## TODO

- 翻译指针位置的单词
