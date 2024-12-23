// Import the OpenAI Node.js SDK
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  headers: {
    "OpenAI-Beta": "assistants=v2",
  },
});

export async function aflAiModel(title, description) {
  console.log(title, description);
  title = "pipe";
  description = "pope";
  try {
    const assistantId = "asst_P570ZXnVUjIFYrfFRpRInA8z";

    // 1. Создаём поток (thread)
    console.log("Creating thread...");
    const thread = await openai.beta.threads.create();
    console.log("Thread created with ID:", thread.id);

    // 2. Отправляем сообщение
    console.log("Adding message to thread...");
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Title: ${title}, Description: ${description}`,
    });
    console.log("Message added to thread...");

    // 3. Запускаем ассистента
    console.log("Running the assistant...");

    // Здесь будем накапливать ответ ассистента
    let fullResponse = "";

    // Важно: когда используем .stream, 
    // необходимо сохранять результат в переменной,
    // а затем возвращать её после завершения стрима
    const run = openai.beta.threads.runs
      .stream(thread.id, {
        assistant_id: assistantId,
      })
      .on("textCreated", (text) => {
        // Первичная часть ответа
        process.stdout.write("\nAssistant > ");
        fullResponse += text.value;
      })
      .on("textDelta", (textDelta) => {
        // Дельты текста, приходят по кусочкам
        process.stdout.write(textDelta.value);
        fullResponse += textDelta.value;
      })
      .on("toolCallCreated", (toolCall) => {
        // Пример: если ассистент вызывает Tool (Code Interpreter)
        console.log("\nTool called:", toolCall.type);
      })
      .on("toolCallDelta", (toolCallDelta) => {
        // Логируем то, что внутри Code Interpreter (если он используется)
        if (toolCallDelta.type === "code_interpreter") {
          if (toolCallDelta.code_interpreter.input) {
            console.log(toolCallDelta.code_interpreter.input);
          }
          if (toolCallDelta.code_interpreter.outputs) {
            console.log("Output:");
            toolCallDelta.code_interpreter.outputs.forEach((output) => {
              if (output.type === "logs") {
                console.log(output.logs);
              }
            });
          }
        }
      })
      .on("error", (err) => {
        console.error("Stream error:", err);
      });

    // Дожидаемся окончания стриминга
    await run.finished();

    console.log("\nAssistant run complete.");

    // Теперь возвращаем всю собранную строку
    return fullResponse;
  } catch (error) {
    console.error("Error:", error);
    throw error; // Пробрасываем выше, чтобы вызывающий код мог её отловить
  }
}
