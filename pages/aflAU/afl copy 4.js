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

  await page.waitForSelector(".media-list__list");

  // Прокрутка страницы для загрузки всех lazyLoad-изображений
  await autoScroll(page);

  const currentNews = await page.evaluate(() => {
    // Находим первую секцию media-list__list
    const firstMediaList = document.querySelector(".media-list__list");

    if (!firstMediaList) return [];

    // Извлекаем первые 10 элементов media-list__item внутри первой секции
    const items = Array.from(firstMediaList.querySelectorAll(".media-list__item"))
      .slice(0, 10);

    return items.map((item) => {
      const title =
        item.querySelector(".media-thumbnail__title")?.textContent?.trim() || "";
      const description =
        item.querySelector(".media-thumbnail__description")
          ?.textContent?.trim() || "";
      const postLink =
        item.querySelector(".media-thumbnail__absolute-link")?.href || "";

      // Извлекаем ссылку на изображение из тега <picture>
      const pictureElement = item.querySelector("picture source");
      const imageLink = pictureElement
        ? pictureElement.srcset.split(",")[0].split(" ")[0] // Берём первую ссылку из srcset
        : "";

      return { title, description, imageLink, postLink };
    });
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


// Функция для автоматической прокрутки страницы
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100; // Расстояние прокрутки за один шаг
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100); 
    });
  });
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
