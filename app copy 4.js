// Pages
import aflPageParser from "./pages/aflAU/afl.js";

// Models
import { aflAiModel } from "./models/aflAiModel.js";

// AFL
aflPageParser("*/20 * * * * *", async (newNews) => {
  console.log("Запуск парсинга AFL новостей...");

  if (newNews.length > 0) {
    console.log("AFL новости:", JSON.stringify(newNews, null, 2));
    for (const news of newNews) {
      console.log(
        `Обработка новости "${news.title}"... , "${news.description}"`
      );
      try {
        const aiResponse = await aflAiModel(news.title, news.description);
        if (aiResponse) {
          console.log(`Ответ AI для новости "${news.title}":`, aiResponse);

          const titleMatch = aiResponse.match(/Title(?:Title)?:\s*(.+?)\n/);
          const descriptionMatch = aiResponse.match(/Description:\s*(.+)/);

          const title = titleMatch ? titleMatch[1].trim() : null;
          const description = descriptionMatch
            ? descriptionMatch[1].trim()
            : null;

          console.log("1Title:", title);
          console.log("2Description:", description);
        } else {
          console.log(`Не удалось обработать новость: "${news.title}"`);
        }
      } catch (error) {
        console.error(
          `Ошибка при обработке новости "${news.title}":`,
          error.message
        );
      }
    }
  } else {
    console.log("Нет новых новостей для обработки.");
  }
});
