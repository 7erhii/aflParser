// Pages
import aflPageParser from "./pages/aflAU/afl.js";

// Models
import { aflAiModel } from "./models/aflAiModel.js";

// AFL
aflPageParser("*/20 * * * * *", async (newNews) => {
  console.log("Запуск парсинга AFL новостей...");

  console.log(newNews);

  if (newNews.length > 0) {
    console.log("AFL новости:", JSON.stringify(newNews, null, 2));
    for (const news of newNews) {
      console.log(`Обработка новости "${news.title}"... , "${news.description}"`);
      try {
        const aiResponse = await aflAiModel(news.title, news.description);
        if (aiResponse) {
          // Здесь вы увидите финальный строчный ответ,
          // сформированный ассистентом
          console.log(`Ответ AI для новости "${news.title}":`, aiResponse);
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
