import fs from "fs";
import Parser from "rss-parser";
import cron from "node-cron";

const existingNewsFile = "./pages/newsAU/existingNews.json";

async function fetchNewsSportAU() {
  const parser = new Parser({
    customFields: {
      item: [
        "subtitle",
        "seotitle",
        "socialtitle",
        "vertical",
        "section",
        "category",
        ["image", "image"],
        ["media:content", "mediaContent"]
      ]
    }
  });

  const feedUrl = "https://www.news.com.au/content-feeds/latest-news-sport/";

  const feed = await parser.parseURL(feedUrl);

  const currentNews = feed.items.map(item => ({
    title: item.title || "",
    subtitle: item.subtitle || "",
    link: item.link || "",
    seotitle: item.seotitle || "",
    socialtitle: item.socialtitle || "",
    description: item.contentSnippet || item.description || "",
    vertical: item.vertical || "",
    section: item.section || "",
    category: item.category || "",
    image: item.image?.url || item.mediaContent?.url || "",
    pubDate: item.pubDate || ""
  }));

  let existingNews = [];
  if (fs.existsSync(existingNewsFile)) {
    const fileData = fs.readFileSync(existingNewsFile, "utf8");
    existingNews = JSON.parse(fileData);
  }

  const lastExistingNews = existingNews.slice(-50);
  const newNews = currentNews.filter(news =>
    !lastExistingNews.some(existing => existing.title === news.title)
  );

  const updatedNews = [...existingNews, ...newNews];
  fs.writeFileSync(existingNewsFile, JSON.stringify(updatedNews, null, 2));

  return newNews;
}

function newsAuSportParser(cronExpression, callback) {
  cron.schedule(cronExpression, async () => {
    console.log("Запуск парсинга SportAU новостей...");

    const newNews = await fetchNewsSportAU();
    callback(newNews); // Передаем данные через callback
  });

  console.log(`Планировщик SportAU настроен с интервалом: ${cronExpression}`);
}

export default newsAuSportParser;
