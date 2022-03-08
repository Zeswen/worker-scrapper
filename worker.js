const puppeteer = require('puppeteer');
const fsp = require('fs/promises');
const { parentPort } = require('worker_threads');

async function scrapAccount(starterId, index, browser, filename) {
  const page = await browser.newPage();
  page.setCacheEnabled(false);

  const currentId = `rc${starterId + index}`;

  const requestURL = `https://www.some-page.com/${currentId}`;

  const response = await page.goto(requestURL);

  const responseURL = response.url();
  const success = !responseURL.toLowerCase().includes('login');
  const icon = success ? '✅' : '❌';

  const conclusion = `${icon} ${requestURL} = ${responseURL}`;

  if (success) {
    const client = await page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
  }

  console.log(conclusion);
  await fsp.appendFile(filename, `${conclusion}\n`);
  page.close();
}

async function scrapAccounts(filename, multiplier = 0) {
  const multiple = 100000;
  const starterId = 1378892 + multiple * multiplier;

  // Set up browser and page.
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.createIncognitoBrowserContext();

  for (let index = 0; index < multiple; index++) {
    await scrapAccount(starterId, index, context, filename);
  }

  context.close();
}

parentPort.on('message', ({ filename, multiplier }) => {
  scrapAccounts(filename, multiplier);
  parentPort.postMessage('done');
});
