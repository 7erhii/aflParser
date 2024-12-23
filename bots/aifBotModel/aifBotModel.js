import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.DOKI_DOKI_API_KEY);

// Изначальный ID группы
let groupId = process.env.DOKI_DOKI_GROUP_ID;

// Функция для отправки сообщения
export function sendMessageToGroup(title, description, imageUrl) {
    const message = `*${title}*\n${description}`;

    if (imageUrl) {
        bot.telegram.sendPhoto(groupId, imageUrl, {
            caption: message,
            parse_mode: 'Markdown'
        })
        .catch(err => {
            if (err.response && err.response.parameters && err.response.parameters.migrate_to_chat_id) {
                // Обновляем groupId
                groupId = err.response.parameters.migrate_to_chat_id;
                console.log('Обновленный ID чата:', groupId);
                // Повторная отправка сообщения с новым ID
                bot.telegram.sendPhoto(groupId, imageUrl, {
                    caption: message,
                    parse_mode: 'Markdown'
                }).catch(err => console.error('Ошибка при повторной отправке:', err));
            } else {
                console.error('Ошибка отправки сообщения с изображением:', err);
            }
        });
    } else {
        bot.telegram.sendMessage(groupId, message, {
            parse_mode: 'Markdown'
        })
        .catch(err => {
            if (err.response && err.response.parameters && err.response.parameters.migrate_to_chat_id) {
                // Обновляем groupId
                groupId = err.response.parameters.migrate_to_chat_id;
                console.log('Обновленный ID чата:', groupId);
                // Повторная отправка сообщения с новым ID
                bot.telegram.sendMessage(groupId, message, {
                    parse_mode: 'Markdown'
                }).catch(err => console.error('Ошибка при повторной отправке:', err));
            } else {
                console.error('Ошибка отправки текстового сообщения:', err);
            }
        });
    }
}

// Обработчик упоминаний бота
bot.on('text', (ctx) => {
    const message = ctx.message.text;

    if (message.includes(`@${ctx.botInfo.username}`)) {
        const reply = 'hi';
        ctx.reply(reply);
    }
});

// Запуск бота
bot.launch()
    .then(() => console.log('Бот запущен!'))
    .catch((err) => console.error('Ошибка при запуске бота:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
