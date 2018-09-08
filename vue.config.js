/* eslint-disable global-require */
const WriteFilePlugin = require('write-file-webpack-plugin');
const path = require('path');

module.exports = {
  outputDir: 'build/dev',
  filenameHashing: false, // 避免找不到 <webview> preload 脚本
  pages: {
    index: {
      entry: './src/renderer/main.ts',
      template: 'public/index.html',
      filename: 'index.html',
    },
    inject: {
      entry: './src/inject/index.ts',
      filename: 'inject.html',
    },
  },
  pluginOptions: {
    electronBuilder: {
      outputDir: 'build',
      mainProcessFile: 'src/main/index.js',
      mainProcessWatch: ['src/main/lib/menubar/index.js'],
      disableMainProcessTypescript: true,
      builderOptions: {
        productName: 'Google 翻译',
        appId: 'org.moefe.googletranslate',
        mac: {
          icon: 'build/bundled/icon.icns',
          extendInfo: {
            LSUIElement: 1,
          },
        },
      },
    },
  },
  configureWebpack: {
    // 供 dev 模式下 <webview> preload 使用
    plugins: [
      new WriteFilePlugin({
        test: /^.{0,33}$/,
      }),
    ],
  },
  chainWebpack: (config) => {
    // inject.js 完全独立
    // 所以禁止多页面提前 chunk
    config.optimization.delete('splitChunks');

    if (process.env.NODE_ENV !== 'production') {
      config.module
        .rule('tsx')
        .test(/\.tsx$/)
        .use('vue-jsx-hot-loader')
        .before('babel-loader')
        .loader('vue-jsx-hot-loader');
    }

    config.plugin('define').tap((args) => {
      Object.assign(args[0], {
        VERSION: JSON.stringify(require('./package.json').version),
      });
      return args;
    });
  },
};
