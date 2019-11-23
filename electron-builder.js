module.exports = {
  productName: 'Google 翻译',
  appId: 'org.moefe.googletranslate',
  files: ['dist/**/*', '!src', '!node_modules'],
  directories: {
    output: 'build',
  },
  extraResources: './public',
  mac: {
    icon: './public/icon.icns',
  },
};
