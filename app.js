// Pages
import aflPageParser from "./pages/aflAU/afl.js";

// Ai Models
import { aflAiModel } from "./models/aflAiModel.js";

// Telegram Bot Calls
import { sendMessageToGroup } from "./bots/aifBotModel/aifBotModel.js";

// AFL
aflPageParser("*/10 * * * * *", async (newNews) => {
// aflPageParser("0 * * * *", async (newNews) => {
  console.log("Запуск парсинга AFL новостей...");

  if (newNews && newNews.length > 0) {
    console.log("AFL новости:", JSON.stringify(newNews, null, 2));
    for (const news of newNews) {
      console.log(
        `Обработка новости "${news.title}"... , "${news.description}"`
      );
      try {
        const aiResponse = await aflAiModel(news.title, news.description);
        if (aiResponse) {
          console.log(`Ответ AI для новости "${news.title}":`, aiResponse);

          const titleMatch = aiResponse.match(
            /Title:\s*(.+?)(?:\n|Description:|$)/
          );

          const descriptionMatch = aiResponse.match(/Description:\s*(.+)/);

          const title = titleMatch ? titleMatch[1].trim() : null;
          const description = descriptionMatch
            ? descriptionMatch[1].trim()
            : null;

          console.log("1Title:", title);
          console.log("2Description:", description);
          const imageUrl = news.imageLink;
          sendMessageToGroup(title, description, imageUrl);
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
