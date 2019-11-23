module.exports = {
  productName: 'Google 翻译',
  appId: 'org.moefe.googletranslate',
  files: ['dist/**/*', '!dist/src', '!dist/node_modules'],
  directories: {
    output: 'build',
  },
  extraResources: './public',
  mac: {
    icon: './public/icon.icns',
  },
};
