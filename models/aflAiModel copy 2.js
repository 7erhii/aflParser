// Import the OpenAI Node.js SDK
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is stored securely
  headers: {
    "OpenAI-Beta": "assistants=v2", // Required beta header for Assistants API
  },
});

async function main() {
  try {
    // Step 1: Create an Assistant
    console.log("Creating assistant...");
    const assistant = await openai.beta.assistants.create({
      name: "Math Tutor",
      instructions: "You are a personal math tutor. Write and run code to answer math questions.",
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4o",
    });

    console.log("Assistant created with ID:", assistant.id);

    // Step 2: Create a Thread
    console.log("Creating thread...");
    const thread = await openai.beta.threads.create();

    console.log("Thread created with ID:", thread.id);

    // Step 3: Add a Message to the Thread
    console.log("Adding message to thread...");
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: "I need to solve the equation `3x + 11 = 14`. Can you help me?",
    });

    console.log("Message added to thread:", message);

    // Step 4: Run the Assistant
    console.log("Running the assistant...");
    const run = await openai.beta.threads.runs.stream(thread.id, {
      assistant_id: assistant.id,
    })
      .on("textCreated", (text) => process.stdout.write("\nAssistant > "))
      .on("textDelta", (textDelta) => process.stdout.write(textDelta.value))
      .on("toolCallCreated", (toolCall) => console.log("\nTool called:", toolCall.type))
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

    console.log("Assistant run complete.");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
