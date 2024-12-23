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
  try {
    const assistantId = "asst_P570ZXnVUjIFYrfFRpRInA8z";

    // Step 1: Create a Thread
    console.log("Creating thread...");
    const thread = await openai.beta.threads.create();

    console.log("Thread created with ID:", thread.id);

    // Step 2: Add a Message to the Thread
    console.log("Adding message to thread...");
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `Title: ${title}, Description: ${description}`,
    });

    console.log("Message added to thread.");

    // Step 3: Run the Assistant
    console.log("Running the assistant...");

    // Для накопления полного ответа
    let fullResponse = "";

    const run = await openai.beta.threads.runs
      .stream(thread.id, {
        assistant_id: assistantId,
      })
      .on("textCreated", (text) => {
        process.stdout.write("\nAssistant > ");
        fullResponse += text.value;
      })
      .on("textDelta", (textDelta) => {
        process.stdout.write(textDelta.value);
        fullResponse += textDelta.value;
      })
      .on("toolCallCreated", (toolCall) =>
        console.log("\nTool called:", toolCall.type)
      )
      .on("toolCallDelta", (toolCallDelta) => {
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
      });

    console.log("\nAssistant run complete.");

    // Возвращаем полный текст ответа
    return fullResponse;
  } catch (error) {
    console.error("Error in aflAiModel:", error);
    throw error;
  }
}
