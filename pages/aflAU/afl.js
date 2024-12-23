import puppeteer from "puppeteer";
import fs from "fs";
import cron from "node-cron";

const existingNewsFile = "./pages/aflAU/existingNews.json";

async function fetchAFLNews() {
  console.log("Шаг 1: Запуск Puppeteer");
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    executablePath: "/usr/bin/chromium-browser",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      // дополнительные флаги при необходимости
    ],
  });

  const page = await browser.newPage();

  const url = "https://www.afl.com.au/news/all-news";
  console.log(`Шаг 2: Переход на страницу ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  console.log("Шаг 3: Ожидание селектора .media-list__list");
  await page.waitForSelector(".media-list__list");

  // Прокрутка страницы для загрузки всех lazyLoad-изображений
  console.log("Шаг 4: Прокрутка страницы");
  await autoScroll(page);

  console.log("Шаг 5: Извлечение данных со страницы");
  const currentNews = await page.evaluate(() => {
    const firstMediaList = document.querySelector(".media-list__list");

    if (!firstMediaList) {
      console.error("Секция .media-list__list не найдена");
      return [];
    }

    const items = Array.from(
      firstMediaList.querySelectorAll(".media-list__item")
    ).slice(0, 10);

    return items.map((item) => {
      const title =
        item.querySelector(".media-thumbnail__title")?.textContent?.trim() ||
        "";
      const description =
        item
          .querySelector(".media-thumbnail__description")
          ?.textContent?.trim() || "";
      const postLink =
        item.querySelector(".media-thumbnail__absolute-link")?.href || "";

      const pictureElement = item.querySelector("picture source");
      const imageLink = pictureElement
        ? pictureElement.srcset.split(",")[0].split(" ")[0]
        : "";

      return { title, description, imageLink, postLink };
    });
  });

  console.log("Шаг 6: Закрытие браузера");
  await browser.close();

  console.log("Шаг 7: Текущие новости:", JSON.stringify(currentNews, null, 2));

  let existingNews = [];
  if (fs.existsSync(existingNewsFile)) {
    const fileData = fs.readFileSync(existingNewsFile, "utf8");
    existingNews = JSON.parse(fileData);
  }

  console.log("Шаг 8: Сравнение с существующими новостями");
  const lastExistingNews = existingNews.slice(-20);
  const newNews = currentNews.filter(
    (news) =>
      !lastExistingNews.some((existing) => existing.title === news.title)
  );

  console.log("Шаг 9: Новые новости:", JSON.stringify(newNews, null, 2));

  const updatedNews = [...existingNews, ...newNews];

  console.log("Шаг 10: Сохранение обновленных новостей");
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

    try {
      const newNews = await fetchAFLNews();
      console.log(
        "Новости получены для обработки:",
        JSON.stringify(newNews, null, 2)
      );
      callback(newNews);
    } catch (error) {
      console.error("Ошибка при парсинге новостей:", error.message);
    }
  });

  console.log(`Планировщик AFL настроен с интервалом: ${cronExpression}`);
}

export default aflPageParser;
