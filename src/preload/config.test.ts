import * as puppeteer from 'puppeteer';

import selectors from './config.json';

let page: undefined | puppeteer.Page;
let browser: undefined | puppeteer.Browser;

beforeAll(async () => {
  browser = await puppeteer.launch({
    headless: true,
  });

  page = await browser.newPage();
  await page.emulate(puppeteer.KnownDevices['iPhone 13 Mini']);
  await page.goto('https://translate.google.com');

  (await page.$(selectors.sourceTextArea))?.type('China');
  await page.waitForSelector(selectors.responseTTS, { timeout: 5000 });
}, 30_000);

test('css selector', async () => {
  if (!page) throw new Error('puppeteer launch error');

  const sourceTextArea = await page.$(selectors.sourceTextArea);
  const sourceTTS = await page.$(selectors.sourceTTS);
  const responseTTS = await page.$(selectors.responseTTS);
  const responseCopy = await page.$(selectors.responseCopy);
  const starButton = await page.$(selectors.starButton);
  const signIn = await page.$(selectors.signIn);
  const sourceDetectLabel = await page.$(selectors.sourceDetectLabel);
  const sourceCurrentLabel = await page.$(selectors.sourceCurrentLabel);
  const targetCurrentLabel = await page.$(selectors.targetCurrentLabel);
  const targetENLabel = await page.$(selectors.targetENLabel);
  const targetZHCNLabel = await page.$(selectors.targetZHCNLabel);

  expect(sourceTextArea).toBeTruthy();
  expect(sourceTTS).toBeTruthy();
  expect(responseTTS).toBeTruthy();
  expect(responseCopy).toBeTruthy();
  expect(starButton).toBeTruthy();
  expect(signIn).toBeTruthy();
  expect(sourceDetectLabel).toBeTruthy();
  expect(targetENLabel).toBeTruthy();
  expect(targetZHCNLabel).toBeTruthy();

  expect(sourceCurrentLabel).toBeTruthy();
  expect(await sourceCurrentLabel?.evaluate(el => el.getAttribute('role'))).toBe('button');
  expect(await sourceCurrentLabel?.evaluate(el => el.getBoundingClientRect().height)).toBeTruthy();
  expect(targetCurrentLabel).toBeTruthy();
  expect(await targetCurrentLabel?.evaluate(el => el.getAttribute('role'))).toBe('button');
  expect(await targetCurrentLabel?.evaluate(el => el.getBoundingClientRect().height)).toBeTruthy();
}, 30_000);

afterAll(async () => browser?.close());
