import { shell, Notification } from 'electron';
import fetch from 'node-fetch';
import pkg from '../../package.json';

interface IGithubRelease {
  // eslint-disable-next-line camelcase
  tag_name: string;
}

export default async function checkForUpdates() {
  const url =
    'https://api.github.com/repos/mantou132/GoogleTranslate/releases/latest';
  const res = await fetch(url);
  const release: IGithubRelease = await res.json();
  if (release.tag_name.replace(/^v/, '') > pkg.version) {
    const notice = new Notification({
      title: 'Google 翻译',
      body: `发现新版本 (${release.tag_name}) 可用，点击下载最新版本！`,
    });
    notice.on('click', () => shell.openExternal(url));
    notice.show();
    return true;
  }
  return false;
}
