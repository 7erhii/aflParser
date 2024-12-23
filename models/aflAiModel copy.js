
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Убедитесь, что API-ключ установлен
const ASSISTANT_ID = "asst_P570ZXnVUjIFYrfFRpRInA8z"; // Ваш ID ассистента

export default async function aflAiModel(newsItem) {
  try {
    console.log("aflAiModel вызвана с:", newsItem);

    // Проверяем входные данные
    if (!newsItem.title || !newsItem.description) {
      throw new Error(
        "Некорректные данные для обработки: отсутствует title или description"
      );
    }

    console.log("Отправка запроса в OpenAI...");
    console.log("Запрос:", {
      messages: [
        {
          role: "user",
          content: `Новость:
Заголовок: ${newsItem.title}
Описание: ${newsItem.description}

Пожалуйста, перепиши заголовок и описание так, чтобы они звучали немного по-другому, но сохранили ту же суть. Сделай текст свежим и уникальным, как для нового поста.`,
        },
      ],
    });

    const response = await fetch(
      `https://api.openai.com/v1/assistants/${ASSISTANT_ID}/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Новость:
Заголовок: ${newsItem.title}
Описание: ${newsItem.description}

Пожалуйста, перепиши заголовок и описание так, чтобы они звучали немного по-другому, но сохранили ту же суть. Сделай текст свежим и уникальным, как для нового поста.`,
            },
          ],
        }),
      }
    );

    console.log("Ответ OpenAI получен, статус:", response.status);

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error("Ошибка ответа OpenAI API:", errorDetails);
      throw new Error(
        `Ошибка API OpenAI: ${response.status} - ${errorDetails}`
      );
    }

    const result = await response.json();
    console.log("Результат ответа OpenAI:", JSON.stringify(result, null, 2));

    const content = result.choices?.[0]?.message?.content || null;
    console.log("Переписанный текст от OpenAI:", content);

    return content; // Возвращаем текстовый результат
  } catch (error) {
    console.error("Ошибка в aflAiModel:", error.message);
    return null; // Возвращаем null в случае ошибки
  }
}
