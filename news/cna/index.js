const puppeteer = require("puppeteer");

const cnaScrap = async (id) => {
  let result;
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--disable-infobars", "--disable-gpu"],
      ignoreDefaultArgs: ["--enable-automation"],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();
    await page.goto(`https://www.cna.com.tw/list/${id}.aspx`, {
      waitUntil: "domcontentloaded",
    });

    let count = 0;
    let maxCount = 2;
    if (id !== "aall") {
      //點擊畫面中的按鈕，讓新聞可以繼續跑
      while (count <= maxCount) {
        await page.waitForTimeout(200);
        await page.click("#SiteContent_uiViewMoreBtn_Style3");
        count++;
      }
    }

    result = await page.evaluate(() => {
      let data = [];

      let newsItem = document.querySelectorAll(".mainList li");
      newsItem.forEach((el, i) => {
        let imgElement = newsItem[i]
          ?.querySelector(".wrap img")
          ?.getAttribute("src");
        if (imgElement) {
          data.push({
            source: "cna",
            title: newsItem[i].querySelector(".listInfo h2 span").textContent,
            date: newsItem[i].querySelector(".listInfo div").textContent,
            url: newsItem[i].querySelector("a").getAttribute("href"),
            img:
              newsItem[i]?.querySelector(".wrap img")?.getAttribute("src") ||
              "",
          });
        } else {
          data.push({
            category: "cna",
            title: newsItem[i].querySelector(".listInfo h2 span").textContent,
            date: newsItem[i].querySelector(".listInfo div").textContent,
            url: newsItem[i].querySelector("a").getAttribute("href"),
          });
        }
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
  } catch (err) {
    console.log(err);
  }

  return result;
};

module.exports = cnaScrap;
