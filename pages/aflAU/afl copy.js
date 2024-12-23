import puppeteer from "puppeteer";
import fs from "fs";
import cron from "node-cron";

const existingNewsFile = "./pages/aflAU/existingNews.json";

async function fetchAFLNews() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  const url = "https://www.afl.com.au/news/all-news";
  await page.goto(url, { waitUntil: "domcontentloaded" });

  await page.waitForSelector(".media-list__item");

  const currentNews = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".media-list__item")).map(
      (item) => {
        const title =
          item.querySelector(".media-thumbnail__title")?.textContent?.trim() ||
          "";
        const description =
          item
            .querySelector(".media-thumbnail__description")
            ?.textContent?.trim() || "";
        const imageLink = item.querySelector("img")?.src || "";
        const postLink =
          item.querySelector(".media-thumbnail__absolute-link")?.href || "";

        return { title, description, imageLink, postLink };
      }
    );
  });

  await browser.close();

  let existingNews = [];
  if (fs.existsSync(existingNewsFile)) {
    const fileData = fs.readFileSync(existingNewsFile, "utf8");
    existingNews = JSON.parse(fileData);
  }

  const lastExistingNews = existingNews.slice(-20);
  const newNews = currentNews.filter(
    (news) =>
      !lastExistingNews.some((existing) => existing.title === news.title)
  );

  const updatedNews = [...existingNews, ...newNews];

  fs.writeFileSync(existingNewsFile, JSON.stringify(updatedNews, null, 2));

  return newNews;
}

function aflPageParser(cronExpression, callback) {
  cron.schedule(cronExpression, async () => {
    console.log("Запуск парсинга AFL новостей...");

    const newNews = await fetchAFLNews();
    callback(newNews);
  });

  console.log(`Планировщик AFL настроен с интервалом: ${cronExpression}`);
}

export default aflPageParser;
