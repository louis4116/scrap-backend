const puppeteer = require("puppeteer-core");
const { executablePath } = require("puppeteer");
const chromium = require("@sparticuz/chromium");
const autoScroll = require("../../util/autoScroll.js");

const ltnMilitary = async (item) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
    ignoreDefaultArgs: [
      ...chromium.args,
      "--enable-automation",
      "--disable-extensions",
    ],
    executablePath: await chromium.executablePath(),
    defaultViewport: chromium.defaultViewport,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.goto(`https://def.ltn.com.tw/${item}`, {
    waitUntil: "domcontentloaded",
  });
  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
  });
  await autoScroll({ page, dis: 3000, max: 4 });
  const result = await page.evaluate(() => {
    let data = [];
    let newsItem = document.querySelectorAll(".article-box");
    newsItem.forEach((el, i) => {
      data.push({
        source: "military",
        title: newsItem[i].querySelector("h3").textContent.trim(),
        date: newsItem[i].querySelector("span").textContent.trim(),
        url: newsItem[i].getAttribute("href"),
        img: newsItem[i].querySelector("div img").getAttribute("data-src"),
      });
    });
    return data;
  });
  await page.waitForFunction(
    (result) => {
      return result && result.length >= 20;
    },
    {},
    result
  );
  await browser.close();
  return result;
};

module.exports = ltnMilitary;
