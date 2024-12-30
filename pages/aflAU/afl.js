import puppeteer from "puppeteer";
import fs from "fs";
import cron from "node-cron";

const existingNewsFile = "./pages/aflAU/existingNews.json";

async function fetchAFLNews() {
  console.log("Шаг 1: Запуск Puppeteer");
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    executablePath: puppeteer.executablePath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  try {
    const page = await browser.newPage();
    const url = "https://www.afl.com.au/news/all-news";
    console.log(`Шаг 2: Переход на страницу ${url}`);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    console.log("Шаг 3: Ожидание селектора .media-list__list");
    await page.waitForSelector(".media-list__list");

    console.log("Шаг 4: Прокрутка страницы");
    await autoScroll(page);

    console.log("Шаг 5: Извлечение данных со страницы");
    const currentNews = await page.evaluate(() => {
      // Логика парсинга...
    });

    return currentNews;
  } catch (error) {
    console.error("Ошибка во время парсинга:", error);
    throw error;
  } finally {
    console.log("Шаг 6: Закрытие браузера");
    await browser.close();
  }
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
