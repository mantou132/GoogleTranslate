/**
 * 主进程和渲染进程公用的工具函数
 */

import startCase from 'lodash/startCase';

// eslint-disable-next-line import/prefer-default-export
export function getTranslateString(str: string) {
  const trimStr = str.trim();
  const translateStr = /^[a-zA-Z_\-.]+$/.test(trimStr) && !/^[a-z]+$/.test(trimStr) ? startCase(trimStr) : trimStr;
  return translateStr;
}
