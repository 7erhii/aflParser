// Core
import cron from "node-cron";

// Pages
import aflPage from "./pages/aflAU/afl.js";
import newsSportAU from "./pages/newsAU/newsSport.js";

// Функция для настройки планировщика
function scheduleParser(name, pageFunction, cronExpression) {
    cron.schedule(cronExpression, async () => {
        console.log(`Запуск парсинга для ${name}...`);

        const newNews = await pageFunction();
        if (newNews.length > 0) {
            console.log(`Новые новости для ${name}:`, newNews);
        } else {
            console.log(`Новых новостей для ${name} нет.`);
        }
    });

    console.log(`Планировщик для ${name} настроен. Интервал: ${cronExpression}`);
}

// Пример настройки для AFL страницы
// scheduleParser("AFL", aflPage, "0 * * * *");

// scheduleParser("AFL", aflPage, "*/30 * * * * *"); 
